import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ok, badRequest, unauthorized, forbidden, notFound,
  conflict, formatZodErrors, serverError,
} from "@/lib/utils/api";
import { VerifyPaymentSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const parsed = VerifyPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(formatZodErrors(parsed.error.flatten().fieldErrors));
    }

    const { action, message } = parsed.data;

    const { data: booking } = await supabase
      .from("bookings")
      .select("id, status, vendor_id, user_id, service_id, event_date, dp_proof_url, event_name")
      .eq("id", id)
      .single();

    if (!booking) return notFound("Booking tidak ditemukan.");

    const { data: vendor } = await supabase
      .from("vendor_profiles")
      .select("id, store_name, whatsapp_number")
      .eq("id", booking.vendor_id)
      .eq("user_id", user.id)
      .single();

    if (!vendor) return forbidden("Kamu bukan vendor pemilik booking ini.");

    if (booking.status !== "waiting_payment") {
      return conflict(
        `Verifikasi DP hanya bisa dilakukan saat status WAITING_PAYMENT. Status saat ini: ${booking.status}.`
      );
    }

    if (!booking.dp_proof_url) {
      return badRequest("Bukti DP belum diupload oleh user.");
    }

    if (action === "verify") {
      const { data: updated, error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "dp_verified",
          dp_verified_at: new Date().toISOString(),
          // Bersihkan klarifikasi lama jika ada
          clarification_message: null,
          clarification_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("id, status, dp_verified_at, updated_at")
        .single();

      if (updateError) return serverError(updateError.message);

      const { error: blockError } = await supabase
        .from("availability_blocks")
        .upsert(
          {
            vendor_id: booking.vendor_id,
            date: booking.event_date,
            status: "full",
            booking_id: id,
          },
          { onConflict: "vendor_id,date" }
        );

      if (blockError) {
        console.error("[verify-payment] Gagal block kalender:", blockError.message);
      }

      return ok({
        booking: updated,
        message: "DP terverifikasi! Tanggal event otomatis dikunci di kalender vendor.",
      });
    }

    const clarificationMsg = message!.trim();
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("full_name, phone")
      .eq("id", booking.user_id)
      .single();

    const { data: updated, error: clarifyError } = await supabase
      .from("bookings")
      .update({
        clarification_message: clarificationMsg,
        clarification_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, status, clarification_message, clarification_at, updated_at")
      .single();

    if (clarifyError) return serverError(clarifyError.message);

    const userPhone = userProfile?.phone?.replace(/\D/g, "") ?? null;
    const waMessage = encodeURIComponent(
      `Halo${userProfile?.full_name ? ` ${userProfile.full_name}` : ""}, ` +
      `bukti DP untuk booking "${booking.event_name}" memerlukan klarifikasi.\n\n` +
      `Pesan: ${clarificationMsg}\n\n` +
      `Mohon upload ulang bukti DP yang valid di halaman bookings kamu di Findor. Terima kasih.`
    );
    const waLink = userPhone
      ? `https://wa.me/${userPhone}?text=${waMessage}`
      : null;

    return ok({
      booking: updated,
      clarification_message: clarificationMsg,
      wa_link: waLink,
      message: "Permintaan klarifikasi berhasil dikirim. Status booking tetap 'Menunggu DP' hingga user mengupload bukti yang valid.",
    });
  } catch {
    return serverError();
  }
}
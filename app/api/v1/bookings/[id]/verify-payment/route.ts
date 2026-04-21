import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, badRequest, unauthorized, forbidden, notFound, conflict, formatZodErrors, serverError } from "@/lib/utils/api";
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
      .select("id, status, vendor_id, service_id, event_date, dp_proof_url")
      .eq("id", id)
      .single();

    if (!booking) return notFound("Booking tidak ditemukan.");

    const { data: vendor } = await supabase
      .from("vendor_profiles")
      .select("id")
      .eq("id", booking.vendor_id)
      .eq("user_id", user.id)
      .single();

    if (!vendor) return forbidden("Kamu bukan vendor pemilik booking ini.");

    if (booking.status !== "waiting_payment") {
      return conflict(`Verifikasi DP hanya bisa dilakukan saat status WAITING_PAYMENT. Status saat ini: ${booking.status}.`);
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

    return ok({
      booking: { id, status: booking.status },
      message: message
        ? `Pesan klarifikasi dikirim: "${message}". Hubungi user melalui WhatsApp untuk detail.`
        : "Permintaan klarifikasi dicatat. Hubungi user melalui WhatsApp.",
    });
  } catch {
    return serverError();
  }
}

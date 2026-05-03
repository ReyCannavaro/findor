import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ok, unauthorized, forbidden, notFound, conflict, badRequest, serverError,
} from "@/lib/utils/api";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { data: booking } = await supabase
      .from("bookings")
      .select("id, status, user_id, vendor_id")
      .eq("id", id)
      .single();

    if (!booking) return notFound("Booking tidak ditemukan.");
    if (booking.user_id !== user.id) return forbidden("Kamu bukan pemohon booking ini.");

    const CANCELLABLE = ["pending", "confirmed"];
    const FINAL       = ["completed", "rejected", "cancelled"];

    if (FINAL.includes(booking.status)) {
      return conflict(`Booking sudah berstatus final (${booking.status}) dan tidak bisa diubah.`);
    }

    if (!CANCELLABLE.includes(booking.status)) {
      return conflict(
        "Booking tidak bisa dibatalkan secara mandiri karena sudah ada bukti DP. " +
        "Hubungi vendor via WhatsApp untuk negosiasi pembatalan dan pengembalian DP."
      );
    }

    let cancellationReason: string | null = null;
    if (booking.status === "confirmed") {
      let body: Record<string, unknown> = {};
      try { body = await request.json(); } catch {}
      const reason = typeof body.cancellation_reason === "string"
        ? body.cancellation_reason.trim()
        : "";
      if (!reason) {
        return badRequest("Alasan pembatalan wajib diisi untuk booking yang sudah dikonfirmasi.");
      }
      if (reason.length > 500) {
        return badRequest("Alasan pembatalan maksimal 500 karakter.");
      }
      cancellationReason = reason;
    }

    const updatePayload: Record<string, unknown> = {
      status: "cancelled",
      updated_at: new Date().toISOString(),
    };
    if (cancellationReason) {
      updatePayload.cancellation_reason = cancellationReason;
    }

    const { data: updated, error } = await supabase
      .from("bookings")
      .update(updatePayload)
      .eq("id", id)
      .select("id, status, updated_at")
      .single();

    if (error) return serverError(error.message);

    return ok({
      booking: updated,
      message: booking.status === "confirmed"
        ? "Booking berhasil dibatalkan. Mohon hubungi vendor jika ada hal yang perlu dikomunikasikan."
        : "Booking berhasil dibatalkan.",
    });
  } catch {
    return serverError();
  }
}
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, forbidden, notFound, conflict, serverError } from "@/lib/utils/api";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { data: booking } = await supabase
      .from("bookings")
      .select("id, status, user_id")
      .eq("id", id)
      .single();

    if (!booking) return notFound("Booking tidak ditemukan.");

    if (booking.user_id !== user.id) {
      return forbidden("Kamu bukan pemohon booking ini.");
    }

    if (booking.status !== "pending") {
      return conflict(
        `Booking tidak bisa dibatalkan. Status saat ini: ${booking.status}. Hubungi vendor jika perlu pembatalan lebih lanjut.`
      );
    }

    const { data: updated, error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, status, updated_at")
      .single();

    if (error) return serverError(error.message);

    return ok({ booking: updated, message: "Booking berhasil dibatalkan." });
  } catch {
    return serverError();
  }
}

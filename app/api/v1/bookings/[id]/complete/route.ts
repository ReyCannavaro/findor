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
      .select("id, status, vendor_id, event_date")
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

    if (booking.status !== "dp_verified") {
      return conflict(
        `Booking hanya bisa ditandai selesai dari status DP_VERIFIED. Status saat ini: ${booking.status}.`
      );
    }

    const now = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from("bookings")
      .update({
        status: "completed",
        completed_at: now,
        updated_at: now,
      })
      .eq("id", id)
      .select("id, status, completed_at, updated_at")
      .single();

    if (error) return serverError(error.message);

    return ok({
      booking: updated,
      message: "Event ditandai selesai. User sekarang bisa memberikan ulasan.",
    });
  } catch {
    return serverError();
  }
}

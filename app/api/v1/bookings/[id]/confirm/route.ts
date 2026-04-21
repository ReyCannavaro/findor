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
      .select("id, status, vendor_id, service_id, event_date")
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
    if (booking.status !== "pending") {
      return conflict(`Booking tidak bisa dikonfirmasi. Status saat ini: ${booking.status}.`);
    }

    const { data: updated, error } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, status, updated_at")
      .single();

    if (error) return serverError(error.message);

    return ok({
      booking: updated,
      message: "Booking dikonfirmasi. User perlu mengupload bukti DP untuk mengunci tanggal.",
    });
  } catch {
    return serverError();
  }
}

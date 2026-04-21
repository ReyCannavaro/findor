import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, badRequest, unauthorized, forbidden, notFound, conflict, formatZodErrors, serverError } from "@/lib/utils/api";
import { RejectBookingSchema } from "@/lib/validators";

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
    const parsed = RejectBookingSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(formatZodErrors(parsed.error.flatten().fieldErrors));
    }

    const { data: booking } = await supabase
      .from("bookings")
      .select("id, status, vendor_id")
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
      return conflict(`Booking tidak bisa ditolak. Status saat ini: ${booking.status}.`);
    }

    const { data: updated, error } = await supabase
      .from("bookings")
      .update({
        status: "rejected",
        rejection_reason: parsed.data.reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, status, rejection_reason, updated_at")
      .single();

    if (error) return serverError(error.message);

    return ok({
      booking: updated,
      message: "Booking ditolak. User akan mendapatkan notifikasi beserta alasan penolakan.",
    });
  } catch {
    return serverError();
  }
}

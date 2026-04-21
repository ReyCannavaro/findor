import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { created, badRequest, unauthorized, forbidden, conflict, formatZodErrors, serverError } from "@/lib/utils/api";
import { CreateReviewSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();
    const body = await request.json();
    const parsed = CreateReviewSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(formatZodErrors(parsed.error.flatten().fieldErrors));
    }
    const { booking_id, rating, comment } = parsed.data;
    const { data: booking } = await supabase
      .from("bookings")
      .select("id, status, user_id, vendor_id")
      .eq("id", booking_id)
      .single();

    if (!booking) return badRequest("Booking tidak ditemukan.");
    if (booking.user_id !== user.id) return forbidden("Kamu bukan pemohon booking ini.");
    if (booking.status !== "completed") {
      return forbidden("Ulasan hanya bisa diberikan setelah event selesai (status: COMPLETED).");
    }

    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("booking_id", booking_id)
      .maybeSingle();

    if (existing) {
      return conflict("Kamu sudah memberikan ulasan untuk booking ini.");
    }

    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        booking_id,
        vendor_id: booking.vendor_id,
        user_id: user.id,
        rating,
        comment: comment ?? null,
      })
      .select("id, booking_id, vendor_id, rating, comment, created_at")
      .single();

    if (error) return serverError(error.message);
    return created({
      review,
      message: "Ulasan berhasil dikirim. Terima kasih atas feedback kamu!",
    });
  } catch {
    return serverError();
  }
}

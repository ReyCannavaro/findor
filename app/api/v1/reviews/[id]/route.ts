import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, badRequest, unauthorized, forbidden, notFound, formatZodErrors, serverError } from "@/lib/utils/api";
import { UpdateReviewSchema } from "@/lib/validators";

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
    const parsed = UpdateReviewSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(formatZodErrors(parsed.error.flatten().fieldErrors));
    }

    const { data: review } = await supabase
      .from("reviews")
      .select("id, user_id, created_at")
      .eq("id", id)
      .single();

    if (!review) return notFound("Ulasan tidak ditemukan.");
    if (review.user_id !== user.id) return forbidden("Kamu bukan pemilik ulasan ini.");

    const createdAt = new Date(review.created_at);
    const diff = Date.now() - createdAt.getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (diff > twentyFourHours) {
      return forbidden("Ulasan hanya bisa diedit dalam 24 jam setelah dibuat.");
    }

    const { data: updated, error } = await supabase
      .from("reviews")
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, rating, comment, updated_at")
      .single();

    if (error) return serverError(error.message);

    return ok({ review: updated, message: "Ulasan berhasil diperbarui." });
  } catch {
    return serverError();
  }
}

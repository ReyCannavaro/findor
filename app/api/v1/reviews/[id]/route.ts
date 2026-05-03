import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  formatZodErrors,
  serverError,
} from "@/lib/utils/api";
import { UpdateReviewSchema } from "@/lib/validators";

async function getReviewAndValidateOwner(
  supabase: Awaited<ReturnType<typeof createClient>>,
  reviewId: string,
  userId: string
) {
  const { data: review } = await supabase
    .from("reviews")
    .select("id, user_id, vendor_id, created_at")
    .eq("id", reviewId)
    .single();

  if (!review) return { review: null, error: notFound("Ulasan tidak ditemukan.") };
  if (review.user_id !== userId)
    return { review: null, error: forbidden("Kamu bukan pemilik ulasan ini.") };

  return { review, error: null };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const parsed = UpdateReviewSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(formatZodErrors(parsed.error.flatten().fieldErrors));
    }

    if (parsed.data.rating === undefined && parsed.data.comment === undefined) {
      return badRequest("Setidaknya satu field (rating atau comment) harus diisi.");
    }

    const { review, error: ownerError } = await getReviewAndValidateOwner(
      supabase,
      id,
      user.id
    );
    if (ownerError) return ownerError;

    const diff = Date.now() - new Date(review!.created_at).getTime();
    if (diff > 24 * 60 * 60 * 1000) {
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { review, error: ownerError } = await getReviewAndValidateOwner(
      supabase,
      id,
      user.id
    );
    if (ownerError) return ownerError;

    const diff = Date.now() - new Date(review!.created_at).getTime();
    if (diff > 24 * 60 * 60 * 1000) {
      return forbidden("Ulasan hanya bisa dihapus dalam 24 jam setelah dibuat.");
    }

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return serverError(error.message);

    return ok({ message: "Ulasan berhasil dihapus." });
  } catch {
    return serverError();
  }
}
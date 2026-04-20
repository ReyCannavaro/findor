import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, badRequest, forbidden, notFound, serverError } from "@/lib/utils/api";
import { UpdateReviewSchema } from "@/lib/validators";

// PATCH /api/v1/reviews/[id] — edit ulasan (dalam 24 jam)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const parsed = UpdateReviewSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues.map((e) => e.message).join("; "));

    // TODO: fetch review, pastikan user_id = user.id
    // TODO: cek created_at > now() - 24 jam, kalau tidak -> forbidden
    // TODO: update review
    return ok({ message: "TODO: implement review update" });
  } catch {
    return serverError();
  }
}

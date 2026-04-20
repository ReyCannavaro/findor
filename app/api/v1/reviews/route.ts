import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, created, unauthorized, badRequest, serverError } from "@/lib/utils/api";
import { CreateReviewSchema } from "@/lib/validators";

// POST /api/v1/reviews
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const parsed = CreateReviewSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues.map((e) => e.message).join("; "));

    // TODO: validasi booking.status = COMPLETED && booking.user_id = user.id (BR-BOOK-09)
    // TODO: cek UNIQUE constraint (BR-BOOK-10)
    // TODO: insert ke reviews — DB trigger akan update rating_avg otomatis
    return created({ message: "TODO: implement review creation" });
  } catch {
    return serverError();
  }
}

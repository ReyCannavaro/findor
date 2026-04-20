import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, created, unauthorized, badRequest, serverError } from "@/lib/utils/api";

// GET /api/v1/bookmarks — list vendor yang di-bookmark user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    // TODO: query bookmarks WHERE user_id = user.id, join vendor_profiles
    return ok({ bookmarks: [], message: "TODO: implement" });
  } catch (e) {
    return serverError();
  }
}

// POST /api/v1/bookmarks — toggle bookmark vendor
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const { vendor_id } = body;
    if (!vendor_id) return badRequest("vendor_id wajib diisi");

    // TODO: cek apakah sudah di-bookmark
    // TODO: jika sudah -> delete (un-bookmark), jika belum -> insert
    return ok({ bookmarked: true, message: "TODO: implement toggle" });
  } catch (e) {
    return serverError();
  }
}

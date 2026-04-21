import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, badRequest, notFound, serverError } from "@/lib/utils/api";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const page     = Math.max(1, parseInt(searchParams.get("page")     ?? "1"));
    const per_page = Math.min(50, parseInt(searchParams.get("per_page") ?? "12"));
    const from = (page - 1) * per_page;
    const to   = from + per_page - 1;

    const { data: bookmarks, error, count } = await supabase
      .from("bookmarks")
      .select(
        `id, created_at,
         vendor:vendor_profiles(id, store_name, slug, category, city, rating_avg, review_count, is_verified)`,
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) return serverError(error.message);

    return ok({
      bookmarks: bookmarks ?? [],
      total: count ?? 0,
      page,
      per_page,
      total_pages: Math.ceil((count ?? 0) / per_page),
    });
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const { vendor_id } = body;
    if (!vendor_id) return badRequest("vendor_id wajib diisi.");

    const { data: vendor } = await supabase
      .from("vendor_profiles")
      .select("id")
      .eq("id", vendor_id)
      .eq("is_active", true)
      .single();

    if (!vendor) return notFound("Vendor tidak ditemukan.");

    const { data: existing } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("vendor_id", vendor_id)
      .maybeSingle();

    if (existing) {
      // Un-bookmark
      await supabase.from("bookmarks").delete().eq("id", existing.id);
      return ok({ bookmarked: false, message: "Vendor dihapus dari bookmark." });
    }

    await supabase.from("bookmarks").insert({ user_id: user.id, vendor_id });
    return ok({ bookmarked: true, message: "Vendor ditambahkan ke bookmark." });
  } catch {
    return serverError();
  }
}

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, forbidden, serverError } from "@/lib/utils/api";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return forbidden("Hanya admin yang bisa mengakses endpoint ini.");
    }

    const { searchParams } = new URL(request.url);
    const status   = searchParams.get("status") ?? "pending"; // default: pending
    const page     = Math.max(1, parseInt(searchParams.get("page")     ?? "1"));
    const per_page = Math.min(50, parseInt(searchParams.get("per_page") ?? "20"));
    const from = (page - 1) * per_page;
    const to   = from + per_page - 1;

    let query = supabase
      .from("vendor_profiles")
      .select(
        `id, store_name, slug, category, city, whatsapp_number,
         description, ktp_url, selfie_url,
         is_verified, is_active,
         created_at, updated_at,
         user:user_profiles(id, email, full_name, phone)`,
        { count: "exact" }
      )
      .order("created_at", { ascending: true })
      .range(from, to);

    if (status === "verified") {
      query = query.eq("is_verified", true);
    } else {
      query = query.eq("is_verified", false);
    }

    const { data: vendors, error, count } = await query;
    if (error) return serverError(error.message);

    return ok({
      vendors: vendors ?? [],
      total: count ?? 0,
      page,
      per_page,
      total_pages: Math.ceil((count ?? 0) / per_page),
      status_filter: status,
    });
  } catch {
    return serverError();
  }
}
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, notFound, serverError } from "@/lib/utils/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const { vendorId } = await params;
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const page     = Math.max(1, parseInt(searchParams.get("page")     ?? "1"));
    const per_page = Math.min(50, parseInt(searchParams.get("per_page") ?? "10"));
    const from = (page - 1) * per_page;
    const to   = from + per_page - 1;

    const { data: vendor } = await supabase
      .from("vendor_profiles")
      .select("id, rating_avg, review_count")
      .eq("id", vendorId)
      .single();

    if (!vendor) return notFound("Vendor tidak ditemukan.");

    const { data: reviews, error, count } = await supabase
      .from("reviews")
      .select(
        `id, rating, comment, created_at,
         user:user_profiles(id, full_name, avatar_url)`,
        { count: "exact" }
      )
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) return serverError(error.message);

    return ok({
      reviews: reviews ?? [],
      rating_avg: vendor.rating_avg,
      review_count: vendor.review_count,
      total: count ?? 0,
      page,
      per_page,
      total_pages: Math.ceil((count ?? 0) / per_page),
    });
  } catch {
    return serverError();
  }
}

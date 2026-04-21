import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, badRequest, serverError } from "@/lib/utils/api";
import { SearchParamsSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const parsed = SearchParamsSchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((e) => e.message).join("; "));
    }

    const { q, category, city, price_min, price_max, rating_min, date, sort, page, per_page } = parsed.data;
    const from = (page - 1) * per_page;
    const to   = from + per_page - 1;

    let query = supabase
      .from("vendor_profiles")
      .select(
        `id, store_name, slug, category, description, city,
         rating_avg, review_count, is_verified,
         services(id, name, category, price_min, price_max, unit)`,
        { count: "exact" }
      )
      .eq("is_active", true)
      .eq("is_verified", true);

    if (q && q.trim().length > 0) {
      query = query.ilike("store_name", `%${q.trim()}%`);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (city) {
      query = query.ilike("city", `%${city}%`);
    }

    if (rating_min !== undefined) {
      query = query.gte("rating_avg", rating_min);
    }

    if (date) {
      const { data: blockedVendorIds } = await supabase
        .from("availability_blocks")
        .select("vendor_id")
        .eq("date", date)
        .in("status", ["full", "off"]);

      if (blockedVendorIds && blockedVendorIds.length > 0) {
        const ids = blockedVendorIds.map((b) => b.vendor_id);
        query = query.not("id", "in", `(${ids.join(",")})`);
      }
    }

    switch (sort) {
      case "rating":
        query = query.order("rating_avg", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "price_asc":
      case "price_desc":
        query = query.order("rating_avg", { ascending: false });
        break;
      default:
        query = query.order("rating_avg", { ascending: false });
    }

    query = query.range(from, to);

    const { data: vendors, error, count } = await query;
    if (error) return serverError(error.message);

    let result = vendors ?? [];

    if (price_min !== undefined || price_max !== undefined) {
      result = result.filter((v) => {
        const services = (v.services as { price_min: number; price_max: number | null }[]) ?? [];
        if (services.length === 0) return false;
        const minService = Math.min(...services.map((s) => s.price_min));
        if (price_min !== undefined && minService < price_min) return false;
        if (price_max !== undefined && minService > price_max) return false;
        return true;
      });
    }

    if (sort === "price_asc") {
      result = result.sort((a, b) => {
        const aMin = Math.min(...(a.services as { price_min: number }[]).map((s) => s.price_min));
        const bMin = Math.min(...(b.services as { price_min: number }[]).map((s) => s.price_min));
        return aMin - bMin;
      });
    } else if (sort === "price_desc") {
      result = result.sort((a, b) => {
        const aMin = Math.min(...(a.services as { price_min: number }[]).map((s) => s.price_min));
        const bMin = Math.min(...(b.services as { price_min: number }[]).map((s) => s.price_min));
        return bMin - aMin;
      });
    }

    return ok({
      vendors: result,
      total: count ?? 0,
      page,
      per_page,
      total_pages: Math.ceil((count ?? 0) / per_page),
      filters: { q, category, city, price_min, price_max, rating_min, date, sort },
    });
  } catch {
    return serverError();
  }
}

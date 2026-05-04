import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, badRequest, serverError } from "@/lib/utils/api";
import { SearchParamsSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const parsed = SearchParamsSchema.safeParse(
      Object.fromEntries(searchParams)
    );
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((e) => e.message).join("; "));
    }

    const {
      q,
      category,
      city,
      price_min,
      price_max,
      rating_min,
      date,
      sort,
      page,
      per_page,
    } = parsed.data;

    let priceFilteredVendorIds: string[] | null = null;

    if (price_min !== undefined || price_max !== undefined) {
      let priceQuery = supabase
        .from("services")
        .select("vendor_id")
        .eq("is_active", true);

      if (price_min !== undefined) {
        priceQuery = priceQuery.gte("price_min", price_min);
      }
      if (price_max !== undefined) {
        priceQuery = priceQuery.lte("price_min", price_max);
      }

      const { data: priceRows, error: priceErr } = await priceQuery;
      if (priceErr) return serverError(priceErr.message);

      priceFilteredVendorIds = [
        ...new Set((priceRows ?? []).map((r) => r.vendor_id as string)),
      ];

      if (priceFilteredVendorIds.length === 0) {
        return ok({
          vendors: [],
          total: 0,
          page,
          per_page,
          total_pages: 0,
          filters: { q, category, city, price_min, price_max, rating_min, date, sort },
        });
      }
    }

    let blockedVendorIds: string[] = [];

    if (date) {
      const { data: blocks } = await supabase
        .from("availability_blocks")
        .select("vendor_id")
        .eq("date", date)
        .in("status", ["booked", "blocked"]);

      blockedVendorIds = (blocks ?? []).map((b) => b.vendor_id as string);
    }

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

    if (priceFilteredVendorIds !== null) {
      query = query.in("id", priceFilteredVendorIds);
    }
    
    if (blockedVendorIds.length > 0) {
      query = query.not("id", "in", `(${blockedVendorIds.join(",")})`);
    }

    if (sort === "price_asc" || sort === "price_desc") {
      const { data: allVendors, error, count } = await query;
      if (error) return serverError(error.message);

      const vendors = (allVendors ?? []).sort((a, b) => {
        const aServices = (
          a.services as { price_min: number }[]
        ) ?? [];
        const bServices = (
          b.services as { price_min: number }[]
        ) ?? [];

        const aMin =
          aServices.length > 0
            ? Math.min(...aServices.map((s) => s.price_min))
            : Infinity;
        const bMin =
          bServices.length > 0
            ? Math.min(...bServices.map((s) => s.price_min))
            : Infinity;

        return sort === "price_asc" ? aMin - bMin : bMin - aMin;
      });

      const total = count ?? vendors.length;
      const paginated = vendors.slice(from, from + per_page);

      return ok({
        vendors: paginated,
        total,
        page,
        per_page,
        total_pages: Math.ceil(total / per_page),
        filters: { q, category, city, price_min, price_max, rating_min, date, sort },
      });
    }

    switch (sort) {
      case "rating":
        query = query.order("rating_avg", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      default:
        query = query.order("rating_avg", { ascending: false });
    }

    query = query.range(from, to);

    const { data: vendors, error, count } = await query;
    if (error) return serverError(error.message);

    return ok({
      vendors: vendors ?? [],
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
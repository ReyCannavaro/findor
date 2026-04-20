import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, badRequest, serverError } from "@/lib/utils/api";
import { SearchParamsSchema } from "@/lib/validators";

// GET /api/v1/search
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const parsed = SearchParamsSchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) return badRequest(parsed.error.issues.map((e) => e.message).join("; "));

    const { q, category, city, price_min, price_max, rating_min, date, sort, page, per_page } = parsed.data;

    // TODO: query vendor_profiles WHERE is_verified = true AND is_active = true
    // TODO: full-text search on store_name, description jika q ada
    // TODO: filter category, city
    // TODO: filter price via JOIN ke services (price_min >= ?, price_max <= ?)
    // TODO: filter rating_min
    // TODO: filter date — exclude vendor yang availability_blocks.status = 'full' di tanggal tsb
    // TODO: sort: rating (rating_avg DESC), price_asc, price_desc, newest (created_at DESC)
    // TODO: paginate dengan range((page-1)*per_page, page*per_page - 1)
    return ok({ vendors: [], total: 0, page, per_page, message: "TODO: implement search" });
  } catch {
    return serverError();
  }
}

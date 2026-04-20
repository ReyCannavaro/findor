import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, serverError } from "@/lib/utils/api";

// GET /api/v1/reviews/vendor/[vendorId]
export async function GET(request: NextRequest, { params }: { params: Promise<{ vendorId: string }> }) {
  try {
    const { vendorId } = await params;
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const per_page = parseInt(searchParams.get("per_page") ?? "10");

    // TODO: query reviews WHERE vendor_id = vendorId, join user profile (full_name, avatar)
    // TODO: paginate dengan range
    return ok({ reviews: [], total: 0, page, per_page, message: "TODO: implement" });
  } catch (e) {
    return serverError();
  }
}

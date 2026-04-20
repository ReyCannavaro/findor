import { createClient } from "@/lib/supabase/server";
import { ok, notFound, serverError } from "@/lib/utils/api";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const query = supabase
      .from("vendor_profiles")
      .select("*")
      .eq("is_active", true)
      .eq("is_verified", true);

    const { data: vendor, error } = await (isUuid
      ? query.eq("id", id)
      : query.eq("slug", id)
    ).single();

    if (error || !vendor) {
      return notFound("Vendor tidak ditemukan atau belum aktif.");
    }

    const { data: services } = await supabase
      .from("services")
      .select("id, name, category, description, price_min, price_max, unit")
      .eq("vendor_id", vendor.id)
      .eq("is_active", true)
      .order("price_min", { ascending: true });

    const { data: reviews } = await supabase
      .from("reviews")
      .select(
        `id, rating, comment, created_at,
         user:user_profiles(id, full_name, avatar_url)`
      )
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const { ktp_url, selfie_url, ...publicVendor } = vendor;

    return ok({
      vendor: {
        ...publicVendor,
        services: services ?? [],
        reviews: reviews ?? [],
      },
    });
  } catch {
    return serverError();
  }
}
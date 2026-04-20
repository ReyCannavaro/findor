import { createClient } from "@/lib/supabase/server";
import { notFound, ok, serverError, unauthorized } from "@/lib/utils/api";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return unauthorized("Sesi tidak valid. Silakan login kembali.");
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id, email, full_name, avatar_url, phone, role, created_at")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return notFound("Profil pengguna tidak ditemukan.");
    }

    let vendorProfile = null;
    if (profile.role === "vendor") {
      const { data: vendor } = await supabase
        .from("vendor_profiles")
        .select(
          "id, store_name, slug, category, city, is_verified, is_active, rating_avg, review_count"
        )
        .eq("user_id", user.id)
        .single();

      vendorProfile = vendor ?? null;
    }

    return ok({
      ...profile,
      vendor: vendorProfile,
    });
  } catch {
    return serverError();
  }
}

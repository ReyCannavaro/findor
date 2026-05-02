import { createClient } from "@/lib/supabase/server";
import { notFound, ok, badRequest, serverError, unauthorized } from "@/lib/utils/api";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  full_name: z.string().min(2, "Nama minimal 2 karakter").max(100).optional(),
  phone: z
    .string()
    .regex(/^(\+62|08)\d{7,13}$/, "Format nomor telepon tidak valid")
    .optional()
    .nullable(),
});

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

    return ok({ ...profile, vendor: vendorProfile });
  } catch {
    return serverError();
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return unauthorized();

    const body = await request.json();
    const parsed = UpdateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(
        parsed.error.issues.map((e) => e.message).join("; ")
      );
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (parsed.data.full_name !== undefined) updates.full_name = parsed.data.full_name;
    if (parsed.data.phone     !== undefined) updates.phone     = parsed.data.phone;

    const { data: updated, error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("id", user.id)
      .select("id, email, full_name, phone, role, updated_at")
      .single();

    if (error) return serverError(error.message);

    return ok({ profile: updated, message: "Profil berhasil diperbarui." });
  } catch {
    return serverError();
  }
}
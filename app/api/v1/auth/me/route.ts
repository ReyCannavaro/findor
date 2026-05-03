import { createClient } from "@/lib/supabase/server";
import {
  notFound,
  ok,
  badRequest,
  serverError,
  unauthorized,
  validateFileUpload,
} from "@/lib/utils/api";
import { z } from "zod";
import { NextRequest } from "next/server";

const UpdateProfileJsonSchema = z.object({
  full_name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100)
    .optional(),
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

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return unauthorized();

    const contentType = request.headers.get("content-type") ?? "";
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const full_name = formData.get("full_name") as string | null;
      const phone     = formData.get("phone") as string | null;
      const avatarFile = formData.get("avatar_file") as File | null;
      const parsed = UpdateProfileJsonSchema.safeParse({
        full_name: full_name ?? undefined,
        phone: phone ?? undefined,
      });
      if (!parsed.success) {
        return badRequest(
          parsed.error.issues.map((e) => e.message).join("; ")
        );
      }

      if (parsed.data.full_name !== undefined)
        updates.full_name = parsed.data.full_name;
      if (parsed.data.phone !== undefined)
        updates.phone = parsed.data.phone;

      if (avatarFile && avatarFile.size > 0) {
        const uploadErr = validateFileUpload(avatarFile, {
          maxSizeMB: 2,
          allowedTypes: ["image/jpeg", "image/png", "image/webp"],
        });
        if (uploadErr) return badRequest(`Avatar: ${uploadErr}`);

        const { data: currentProfile } = await supabase
          .from("user_profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single();

        if (currentProfile?.avatar_url) {
          const oldPath = currentProfile.avatar_url.replace(
            /^.*\/storage\/v1\/object\/public\/avatars\//,
            ""
          );
          if (oldPath && !oldPath.startsWith("http")) {
            await supabase.storage.from("avatars").remove([oldPath]);
          }
        }

        const ext = avatarFile.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/avatar-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, {
            contentType: avatarFile.type,
            upsert: true,
          });

        if (uploadError) {
          return serverError(`Gagal upload avatar: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);

        updates.avatar_url = publicUrlData.publicUrl;
      }
    } else {
      const body = await request.json();
      const parsed = UpdateProfileJsonSchema.safeParse(body);

      if (!parsed.success) {
        return badRequest(
          parsed.error.issues.map((e) => e.message).join("; ")
        );
      }

      if (parsed.data.full_name !== undefined)
        updates.full_name = parsed.data.full_name;
      if (parsed.data.phone !== undefined)
        updates.phone = parsed.data.phone;
    }

    if (Object.keys(updates).length === 1) {
      return badRequest("Tidak ada perubahan yang dikirim.");
    }

    const { data: updated, error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("id", user.id)
      .select("id, email, full_name, avatar_url, phone, role, updated_at")
      .single();

    if (error) return serverError(error.message);

    return ok({
      profile: updated,
      message: "Profil berhasil diperbarui.",
    });
  } catch {
    return serverError();
  }
}
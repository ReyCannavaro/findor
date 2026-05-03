import { createClient } from "@/lib/supabase/server";
import { VendorOnboardingSchema } from "@/lib/validators";
import {
  badRequest,
  conflict,
  created,
  forbidden,
  formatZodErrors,
  serverError,
  unauthorized,
  validateFileUpload,
  slugify,
} from "@/lib/utils/api";
import { NextRequest } from "next/server";

const MAX_SLUG_ATTEMPTS = 10;

async function generateUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storeName: string
): Promise<string> {
  const baseSlug = slugify(storeName);

  for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt++) {
    const candidate = attempt === 1 ? baseSlug : `${baseSlug}-${attempt}`;

    const { data: existing } = await supabase
      .from("vendor_profiles")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!existing) {
      return candidate;
    }
  }

  return `${baseSlug}-${Date.now()}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    // Cegah duplikat registrasi
    const { data: existingVendor } = await supabase
      .from("vendor_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existingVendor) {
      return conflict(
        "Kamu sudah memiliki toko vendor. Tidak bisa mendaftar dua kali."
      );
    }

    const formData = await request.formData();
    const body = {
      store_name:      formData.get("store_name") as string,
      category:        formData.get("category") as string,
      description:     formData.get("description") as string | null,
      whatsapp_number: formData.get("whatsapp_number") as string,
      city:            formData.get("city") as string,
      address:         formData.get("address") as string | null,
    };

    const parsed = VendorOnboardingSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(formatZodErrors(parsed.error.flatten().fieldErrors));
    }

    const ktpFile    = formData.get("ktp_file")    as File | null;
    const selfieFile = formData.get("selfie_file") as File | null;

    if (!ktpFile)    return badRequest("File KTP wajib diupload.");
    if (!selfieFile) return badRequest("File selfie wajib diupload.");

    const ktpError = validateFileUpload(ktpFile, {
      maxSizeMB: 5,
      allowedTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    });
    if (ktpError) return badRequest(`KTP: ${ktpError}`);

    const selfieError = validateFileUpload(selfieFile, {
      maxSizeMB: 5,
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    });
    if (selfieError) return badRequest(`Selfie: ${selfieError}`);
    const slug = await generateUniqueSlug(supabase, parsed.data.store_name);
    const ktpExt  = ktpFile.name.split(".").pop();
    const ktpPath = `${user.id}/ktp-${Date.now()}.${ktpExt}`;

    const { error: ktpUploadError } = await supabase.storage
      .from("vendor-docs")
      .upload(ktpPath, ktpFile, { contentType: ktpFile.type, upsert: false });

    if (ktpUploadError) {
      return serverError(`Gagal upload KTP: ${ktpUploadError.message}`);
    }

    const selfieExt  = selfieFile.name.split(".").pop();
    const selfiePath = `${user.id}/selfie-${Date.now()}.${selfieExt}`;

    const { error: selfieUploadError } = await supabase.storage
      .from("vendor-docs")
      .upload(selfiePath, selfieFile, { contentType: selfieFile.type, upsert: false });

    if (selfieUploadError) {
      await supabase.storage.from("vendor-docs").remove([ktpPath]);
      return serverError(`Gagal upload selfie: ${selfieUploadError.message}`);
    }

    const ktpUrl    = `vendor-docs/${ktpPath}`;
    const selfieUrl = `vendor-docs/${selfiePath}`;

    const { data: vendor, error: insertError } = await supabase
      .from("vendor_profiles")
      .insert({
        user_id:         user.id,
        store_name:      parsed.data.store_name,
        slug,
        category:        parsed.data.category,
        description:     parsed.data.description ?? null,
        whatsapp_number: parsed.data.whatsapp_number,
        city:            parsed.data.city,
        address:         parsed.data.address ?? null,
        ktp_url:         ktpUrl,
        selfie_url:      selfieUrl,
        is_verified:     false,
        is_active:       false,
      })
      .select()
      .single();

    if (insertError) {
      await supabase.storage.from("vendor-docs").remove([ktpPath, selfiePath]);
      if (insertError.code === "23505" && insertError.message.includes("slug")) {
        return conflict(
          "Nama toko terlalu mirip dengan vendor yang sudah ada. Coba tambahkan kata unik pada nama tokomu."
        );
      }

      return serverError(`Gagal membuat profil vendor: ${insertError.message}`);
    }

    await supabase
      .from("user_profiles")
      .update({ role: "vendor", updated_at: new Date().toISOString() })
      .eq("id", user.id);

    return created({
      vendor: {
        id:          vendor.id,
        store_name:  vendor.store_name,
        slug:        vendor.slug,
        category:    vendor.category,
        city:        vendor.city,
        is_verified: vendor.is_verified,
        is_active:   vendor.is_active,
      },
      message:
        "Pendaftaran toko berhasil! Dokumen kamu sedang direview oleh admin. Kamu akan dinotifikasi setelah diverifikasi.",
    });
  } catch {
    return serverError();
  }
}
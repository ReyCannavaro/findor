import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, badRequest, unauthorized, forbidden, notFound, conflict, serverError } from "@/lib/utils/api";
import { z } from "zod";

const AdminVendorActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("approve"),
  }),
  z.object({
    action: z.literal("reject"),
    reason: z.string().min(1, "Alasan penolakan wajib diisi.").max(500),
  }),
]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { data: profile } = await supabase
      .from("user_profiles").select("role").eq("id", user.id).single();
    if (!profile || profile.role !== "admin") return forbidden("Hanya admin.");

    const { data: vendor, error } = await supabase
      .from("vendor_profiles")
      .select(
        `id, store_name, slug, category, city, address, whatsapp_number,
         description, ktp_url, selfie_url, is_verified, is_active,
         created_at, updated_at,
         user:user_profiles(id, email, full_name, phone, created_at)`
      )
      .eq("id", id)
      .single();

    if (error || !vendor) return notFound("Vendor tidak ditemukan.");

    let ktp_signed_url:    string | null = null;
    let selfie_signed_url: string | null = null;

    if (vendor.ktp_url) {
      const ktpPath = vendor.ktp_url.replace("vendor-docs/", "");
      const { data } = await supabase.storage
        .from("vendor-docs").createSignedUrl(ktpPath, 900);
      ktp_signed_url = data?.signedUrl ?? null;
    }

    if (vendor.selfie_url) {
      const selfiePath = vendor.selfie_url.replace("vendor-docs/", "");
      const { data } = await supabase.storage
        .from("vendor-docs").createSignedUrl(selfiePath, 900);
      selfie_signed_url = data?.signedUrl ?? null;
    }

    const { ktp_url, selfie_url, ...safeVendor } = vendor;

    return ok({ ...safeVendor, ktp_signed_url, selfie_signed_url });
  } catch {
    return serverError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase      = await createClient();
    const adminSupabase = createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { data: profile } = await supabase
      .from("user_profiles").select("role").eq("id", user.id).single();
    if (!profile || profile.role !== "admin") return forbidden("Hanya admin.");

    const body = await request.json();
    const parsed = AdminVendorActionSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((e) => e.message).join("; "));
    }

    const { data: vendor } = await supabase
      .from("vendor_profiles")
      .select("id, is_verified, is_active, user_id, store_name")
      .eq("id", id)
      .single();

    if (!vendor) return notFound("Vendor tidak ditemukan.");

    if (vendor.is_verified) {
      return conflict("Vendor ini sudah terverifikasi sebelumnya.");
    }

    if (parsed.data.action === "approve") {
      const { error: vendorError } = await adminSupabase
        .from("vendor_profiles")
        .update({
          is_verified: true,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (vendorError) return serverError(vendorError.message);

      const { error: userError } = await adminSupabase
        .from("user_profiles")
        .update({
          role: "vendor",
          updated_at: new Date().toISOString(),
        })
        .eq("id", vendor.user_id);

      if (userError) return serverError(userError.message);

      return ok({
        vendor_id: id,
        action: "approved",
        message: `Vendor "${vendor.store_name}" berhasil diverifikasi dan sekarang aktif di platform.`,
      });
    }

    const { error: rejectError } = await adminSupabase
      .from("vendor_profiles")
      .update({
        is_active: false,
        is_verified: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (rejectError) return serverError(rejectError.message);

    return ok({
      vendor_id: id,
      action: "rejected",
      reason: parsed.data.reason,
      message: `Pendaftaran vendor "${vendor.store_name}" ditolak. Vendor dapat memperbaiki dokumen dan mendaftar ulang setelah 24 jam.`,
    });
  } catch {
    return serverError();
  }
}
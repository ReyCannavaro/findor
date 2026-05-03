import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,
} from "@/lib/utils/api";
import { z } from "zod";

const AdminVendorActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("approve"),
  }),
  z.object({
    action: z.literal("reject"),
    reason: z.string().min(1, "Alasan penolakan wajib diisi.").max(500),
  }),
  z.object({
    action: z.literal("deactivate"),
    reason: z.string().max(500).optional(),
  }),
  z.object({
    action: z.literal("reactivate"),
  }),
]);

async function isAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role === "admin";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return unauthorized();
    if (!(await isAdmin(supabase, user.id))) return forbidden("Hanya admin.");

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

    let ktp_signed_url: string | null = null;
    let selfie_signed_url: string | null = null;

    if (vendor.ktp_url) {
      const ktpPath = vendor.ktp_url.replace("vendor-docs/", "");
      const { data } = await supabase.storage
        .from("vendor-docs")
        .createSignedUrl(ktpPath, 900);
      ktp_signed_url = data?.signedUrl ?? null;
    }

    if (vendor.selfie_url) {
      const selfiePath = vendor.selfie_url.replace("vendor-docs/", "");
      const { data } = await supabase.storage
        .from("vendor-docs")
        .createSignedUrl(selfiePath, 900);
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
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return unauthorized();
    if (!(await isAdmin(supabase, user.id))) return forbidden("Hanya admin.");

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

    const { action } = parsed.data;

    if (action === "approve") {
      if (vendor.is_verified && vendor.is_active) {
        return conflict(
          `Vendor "${vendor.store_name}" sudah aktif dan terverifikasi. Tidak perlu di-approve ulang.`
        );
      }

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

      const isReapproval = vendor.is_verified && !vendor.is_active;
      return ok({
        vendor_id: id,
        action: "approved",
        message: isReapproval
          ? `Vendor "${vendor.store_name}" berhasil diaktifkan kembali.`
          : `Vendor "${vendor.store_name}" berhasil diverifikasi dan sekarang aktif di platform.`,
      });
    }

    if (action === "reject") {
      const { error: rejectError } = await adminSupabase
        .from("vendor_profiles")
        .update({
          is_active: false,
          is_verified: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (rejectError) return serverError(rejectError.message);

      const { error: userError } = await adminSupabase
        .from("user_profiles")
        .update({
          role: "user",
          updated_at: new Date().toISOString(),
        })
        .eq("id", vendor.user_id);

      if (userError) return serverError(userError.message);

      return ok({
        vendor_id: id,
        action: "rejected",
        reason: parsed.data.action === "reject" ? parsed.data.reason : null,
        message: `Pendaftaran vendor "${vendor.store_name}" ditolak. Vendor dapat memperbaiki dokumen dan mendaftar ulang setelah 24 jam.`,
      });
    }

    if (action === "deactivate") {
      if (!vendor.is_active) {
        return conflict(
          `Vendor "${vendor.store_name}" sudah dalam kondisi nonaktif.`
        );
      }

      const { error } = await adminSupabase
        .from("vendor_profiles")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) return serverError(error.message);

      return ok({
        vendor_id: id,
        action: "deactivated",
        message: `Vendor "${vendor.store_name}" telah dinonaktifkan sementara. Profil vendor disembunyikan dari pencarian publik.`,
      });
    }

    if (action === "reactivate") {
      if (!vendor.is_verified) {
        return conflict(
          `Vendor "${vendor.store_name}" belum terverifikasi. Gunakan aksi "approve" terlebih dahulu.`
        );
      }

      if (vendor.is_active) {
        return conflict(
          `Vendor "${vendor.store_name}" sudah aktif.`
        );
      }

      const { error } = await adminSupabase
        .from("vendor_profiles")
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) return serverError(error.message);

      return ok({
        vendor_id: id,
        action: "reactivated",
        message: `Vendor "${vendor.store_name}" berhasil diaktifkan kembali dan tampil di platform.`,
      });
    }

    return badRequest("Aksi tidak dikenali.");
  } catch {
    return serverError();
  }
}
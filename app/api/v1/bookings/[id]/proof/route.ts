import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, badRequest, unauthorized, forbidden, notFound, conflict, serverError } from "@/lib/utils/api";
import { validateFileUpload } from "@/lib/utils/api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { data: booking } = await supabase
      .from("bookings")
      .select("id, status, user_id, vendor_id, dp_proof_url")
      .eq("id", id)
      .single();

    if (!booking) return notFound("Booking tidak ditemukan.");

    if (booking.user_id !== user.id) {
      return forbidden("Kamu bukan pemohon booking ini.");
    }

    if (booking.status !== "confirmed") {
      return conflict(
        `Bukti DP hanya bisa diupload setelah vendor konfirmasi. Status saat ini: ${booking.status}.`
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return badRequest("File bukti DP wajib dilampirkan.");

    const fileError = validateFileUpload(file, {
      maxSizeMB: 5,
      allowedTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    });
    if (fileError) return badRequest(fileError);

    if (booking.dp_proof_url) {
      const oldPath = booking.dp_proof_url.replace("booking-proofs/", "");
      await supabase.storage.from("booking-proofs").remove([oldPath]);
    }

    const ext = file.name.split(".").pop();
    const filePath = `${booking.vendor_id}/${id}/dp-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("booking-proofs")
      .upload(filePath, file, { contentType: file.type, upsert: false });

    if (uploadError) return serverError(`Gagal upload file: ${uploadError.message}`);

    const dp_proof_url = `booking-proofs/${filePath}`;

    const { data: updated, error: updateError } = await supabase
      .from("bookings")
      .update({
        dp_proof_url,
        status: "waiting_payment",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, status, dp_proof_url, updated_at")
      .single();

    if (updateError) {
      await supabase.storage.from("booking-proofs").remove([filePath]);
      return serverError(updateError.message);
    }

    return ok({
      booking: updated,
      message: "Bukti DP berhasil diupload. Tunggu verifikasi dari vendor.",
    });
  } catch {
    return serverError();
  }
}

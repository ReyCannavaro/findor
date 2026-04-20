import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, badRequest, serverError } from "@/lib/utils/api";
import { validateFileUpload } from "@/lib/utils/api";

// POST /api/v1/bookings/[id]/proof
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return badRequest("File bukti DP wajib dilampirkan");

    const fileError = validateFileUpload(file, { maxSizeMB: 5 });
    if (fileError) return badRequest(fileError);

    // TODO: upload ke Supabase Storage bucket "booking-proofs"
    // TODO: update bookings.dp_proof_url
    // TODO: update status: CONFIRMED -> WAITING_PAYMENT
    return ok({ message: "TODO: implement proof upload" });
  } catch (e) {
    return serverError();
  }
}

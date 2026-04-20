import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, badRequest, serverError } from "@/lib/utils/api";
import { VerifyPaymentSchema } from "@/lib/validators";

// PATCH /api/v1/bookings/[id]/verify-payment
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const parsed = VerifyPaymentSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues.map((e) => e.message).join("; "));

    // TODO: pastikan user adalah vendor pemilik booking ini
    // TODO: jika action = "verify": status WAITING_PAYMENT -> DP_VERIFIED, auto-block kalender (BR-BOOK-05)
    // TODO: jika action = "clarify": status tetap WAITING_PAYMENT, kirim pesan klarifikasi
    return ok({ message: "TODO: implement verify-payment" });
  } catch {
    return serverError();
  }
}

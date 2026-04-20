import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, serverError } from "@/lib/utils/api";

// PATCH /api/v1/bookings/[id]/complete
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    // TODO: pastikan user adalah vendor pemilik booking
    // TODO: status DP_VERIFIED -> COMPLETED
    // TODO: set completed_at = now()
    // TODO: trigger: user bisa memberi ulasan (BR-BOOK-09)
    return ok({ message: "TODO: implement complete" });
  } catch (e) {
    return serverError();
  }
}

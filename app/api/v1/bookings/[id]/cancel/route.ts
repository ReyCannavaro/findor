import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, badRequest, serverError } from "@/lib/utils/api";

// PATCH /api/v1/bookings/[id]/cancel
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    // TODO: implement cancel logic
    return ok({ message: "TODO: implement cancel" });
  } catch (e) {
    return serverError();
  }
}

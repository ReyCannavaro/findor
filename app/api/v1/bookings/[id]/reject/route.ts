import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, badRequest, serverError } from "@/lib/utils/api";

// PATCH /api/v1/bookings/[id]/reject
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    // TODO: implement reject logic
    return ok({ message: "TODO: implement reject" });
  } catch (e) {
    return serverError();
  }
}

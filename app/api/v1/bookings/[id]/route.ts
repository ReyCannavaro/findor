import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, notFound, serverError } from "@/lib/utils/api";

// GET /api/v1/bookings/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return unauthorized();

    // TODO: fetch booking by id dengan RLS (hanya user terkait & vendor penerima)
    return ok({ booking: null, message: "TODO: implement" });
  } catch (e) {
    return serverError();
  }
}

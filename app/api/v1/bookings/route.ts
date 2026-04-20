import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CreateBookingSchema } from "@/lib/validators";
import { ok, created, badRequest, unauthorized, unprocessable, serverError } from "@/lib/utils/api";

// GET /api/v1/bookings
// User: list booking miliknya | Vendor: list booking yang diterima
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const role = searchParams.get("role"); // "user" | "vendor"

    // TODO: implement query
    return ok({ bookings: [], message: "TODO: implement" });
  } catch {
    return serverError();
  }
}

// POST /api/v1/bookings
// Buat booking request baru
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return unauthorized();

    const body = await request.json();
    const parsed = CreateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((e) => e.message).join("; "));
    }

    // TODO: implement booking creation (BR-BOOK-01 s/d BR-BOOK-03)
    return created({ message: "TODO: implement" });
  } catch {
    return serverError();
  }
}

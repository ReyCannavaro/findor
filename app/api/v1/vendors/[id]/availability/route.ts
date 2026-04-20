import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, badRequest, serverError } from "@/lib/utils/api";

// GET /api/v1/vendors/[id]/availability?month=YYYY-MM
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // format: YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return badRequest("Parameter month wajib diisi dengan format YYYY-MM");
    }

    // TODO: query availability_blocks WHERE vendor_id = id AND date LIKE month%
    // TODO: return map { "YYYY-MM-DD": "available" | "full" | "off" }
    return ok({ availability: {}, message: "TODO: implement availability" });
  } catch (e) {
    return serverError();
  }
}

// PATCH /api/v1/vendors/[id]/availability — vendor set tanggal off/available
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const { unauthorized } = await import("@/lib/utils/api");
      return unauthorized();
    }

    // TODO: pastikan user adalah vendor pemilik id ini
    // TODO: upsert availability_blocks dengan status baru
    return ok({ message: "TODO: implement set availability" });
  } catch (e) {
    return serverError();
  }
}

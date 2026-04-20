import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, notFound, serverError } from "@/lib/utils/api";

// GET /api/v1/vendors/[id] — detail vendor + services + reviews (SSR-friendly)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // TODO: fetch vendor_profiles WHERE id = id AND is_active = true
    // TODO: join services WHERE is_active = true
    // TODO: join reviews (paginated, terbaru) + user info
    return ok({ vendor: null, message: "TODO: implement vendor detail" });
  } catch (e) {
    return serverError();
  }
}

import { createClient } from "@/lib/supabase/server";
import { ok, serverError, unauthorized } from "@/lib/utils/api";

export async function POST() {
  try {
    const supabase = await createClient();

    // Pastikan user memang sedang login
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return unauthorized("Kamu belum login.");
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      return serverError("Gagal logout. Coba lagi.");
    }

    return ok(null, 200);
  } catch {
    return serverError();
  }
}

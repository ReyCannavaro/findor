import { createClient } from "@/lib/supabase/server";
import { badRequest, serverError } from "@/lib/utils/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const redirectTo = searchParams.get("redirect") ?? "/dashboard";

    // Sanitasi redirect — hanya izinkan path internal (cegah open redirect)
    const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/dashboard";

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(safeRedirect)}`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error || !data.url) {
      return badRequest("Gagal membuat URL login Google. Coba lagi.");
    }

    // Redirect langsung ke Google OAuth consent page
    return NextResponse.redirect(data.url);
  } catch {
    return serverError();
  }
}

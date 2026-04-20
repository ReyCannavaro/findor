import { createClient } from "@/lib/supabase/server";
import { LoginSchema } from "@/lib/validators";
import { badRequest, formatZodErrors, ok, serverError, unauthorized } from "@/lib/utils/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(formatZodErrors(parsed.error.flatten().fieldErrors));
    }

    const { email, password } = parsed.data;

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (
        error.code === "invalid_credentials" ||
        error.message.toLowerCase().includes("invalid login credentials")
      ) {
        return unauthorized("Email atau password salah.");
      }

      if (error.code === "email_not_confirmed") {
        return unauthorized(
          "Email belum diverifikasi. Cek inbox kamu dan klik link konfirmasi."
        );
      }

      return badRequest(error.message);
    }

    if (!data.user || !data.session) {
      return serverError("Gagal membuat sesi. Coba lagi.");
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("id, email, full_name, avatar_url, role")
      .eq("id", data.user.id)
      .single();

    return ok({
      user: profile ?? {
        id: data.user.id,
        email: data.user.email,
        full_name: null,
        avatar_url: null,
        role: "user",
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });
  } catch {
    return serverError();
  }
}

import { createClient } from "@/lib/supabase/server";
import { RegisterSchema } from "@/lib/validators";
import {
  badRequest,
  conflict,
  created,
  formatZodErrors,
  serverError,
} from "@/lib/utils/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(formatZodErrors(parsed.error.flatten().fieldErrors));
    }

    const { email, password, full_name } = parsed.data;

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      if (error.code === "user_already_exists" || error.status === 422) {
        return conflict("Email sudah terdaftar. Silakan login.");
      }
      return badRequest(error.message);
    }

    if (!data.user) {
      return serverError("Gagal membuat akun. Coba lagi.");
    }

    return created({
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name,
      },
      session: data.session ?? null,
      message:
        data.session === null
          ? "Registrasi berhasil. Cek email kamu untuk verifikasi akun."
          : "Registrasi berhasil.",
    });
  } catch {
    return serverError();
  }
}

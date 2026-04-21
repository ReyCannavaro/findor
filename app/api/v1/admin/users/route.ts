import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api";
import { z } from "zod";

const UpdateUserRoleSchema = z.object({
  user_id: z.string().uuid("user_id tidak valid."),
  role: z.enum(["user", "vendor", "admin"]),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { data: profile } = await supabase
      .from("user_profiles").select("role").eq("id", user.id).single();
    if (!profile || profile.role !== "admin") return forbidden("Hanya admin.");

    const { searchParams } = new URL(request.url);
    const role     = searchParams.get("role");
    const q        = searchParams.get("q");
    const page     = Math.max(1, parseInt(searchParams.get("page")     ?? "1"));
    const per_page = Math.min(50, parseInt(searchParams.get("per_page") ?? "20"));
    const from = (page - 1) * per_page;
    const to   = from + per_page - 1;

    let query = supabase
      .from("user_profiles")
      .select("id, email, full_name, phone, role, created_at, updated_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (role) query = query.eq("role", role);
    if (q)    query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`);

    const { data: users, error, count } = await query;
    if (error) return serverError(error.message);

    return ok({
      users: users ?? [],
      total: count ?? 0,
      page,
      per_page,
      total_pages: Math.ceil((count ?? 0) / per_page),
    });
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase      = await createClient();
    const adminSupabase = createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { data: profile } = await supabase
      .from("user_profiles").select("role").eq("id", user.id).single();
    if (!profile || profile.role !== "admin") return forbidden("Hanya admin.");

    const body = await request.json();
    const parsed = UpdateUserRoleSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((e) => e.message).join("; "));
    }

    const { user_id, role } = parsed.data;

    if (user_id === user.id) {
      return badRequest("Kamu tidak bisa mengubah role akun kamu sendiri.");
    }

    const { data: target } = await supabase
      .from("user_profiles").select("id, role, full_name, email").eq("id", user_id).single();
    if (!target) return notFound("User tidak ditemukan.");

    const { error } = await adminSupabase
      .from("user_profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", user_id);

    if (error) return serverError(error.message);

    if (target.role === "vendor" && role !== "vendor") {
      await adminSupabase
        .from("vendor_profiles")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("user_id", user_id);
    }

    return ok({
      user_id,
      old_role: target.role,
      new_role: role,
      message: `Role ${target.email} berhasil diubah dari "${target.role}" ke "${role}".`,
    });
  } catch {
    return serverError();
  }
}
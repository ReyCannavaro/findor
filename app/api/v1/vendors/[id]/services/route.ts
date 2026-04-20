import { createClient } from "@/lib/supabase/server";
import { ServiceSchema } from "@/lib/validators";
import {
  badRequest,
  created,
  forbidden,
  formatZodErrors,
  notFound,
  ok,
  serverError,
  unauthorized,
} from "@/lib/utils/api";
import { NextRequest } from "next/server";
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: vendor } = await supabase
      .from("vendor_profiles")
      .select("id")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (!vendor) return notFound("Vendor tidak ditemukan.");

    const { data: services, error } = await supabase
      .from("services")
      .select("*")
      .eq("vendor_id", id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) return serverError(error.message);

    return ok(services ?? []);
  } catch {
    return serverError();
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { data: vendor } = await supabase
      .from("vendor_profiles")
      .select("id, is_active")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!vendor) return forbidden("Kamu bukan pemilik toko ini.");
    if (!vendor.is_active) {
      return forbidden("Toko kamu belum aktif. Tunggu verifikasi admin.");
    }

    const body = await request.json();

    const parsed = ServiceSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(formatZodErrors(parsed.error.flatten().fieldErrors));
    }

    if (
      parsed.data.price_max !== null &&
      parsed.data.price_max !== undefined &&
      parsed.data.price_max < parsed.data.price_min
    ) {
      return badRequest("Harga maksimal tidak boleh lebih kecil dari harga minimal.");
    }

    const { data: service, error } = await supabase
      .from("services")
      .insert({
        vendor_id: id,
        name: parsed.data.name,
        category: parsed.data.category,
        description: parsed.data.description ?? null,
        price_min: parsed.data.price_min,
        price_max: parsed.data.price_max ?? null,
        unit: parsed.data.unit ?? null,
        is_active: true,
      })
      .select()
      .single();

    if (error) return serverError(error.message);

    return created(service);
  } catch {
    return serverError();
  }
}
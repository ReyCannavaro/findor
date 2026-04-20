import { createClient } from "@/lib/supabase/server";
import { ServiceSchema } from "@/lib/validators";
import {
  badRequest,
  forbidden,
  formatZodErrors,
  notFound,
  ok,
  serverError,
  unauthorized,
} from "@/lib/utils/api";
import { NextRequest } from "next/server";

type RouteParams = { params: Promise<{ id: string; serviceId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, serviceId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { data: vendor } = await supabase
      .from("vendor_profiles")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!vendor) return forbidden("Kamu bukan pemilik toko ini.");

    const { data: existing } = await supabase
      .from("services")
      .select("id, price_min, price_max")
      .eq("id", serviceId)
      .eq("vendor_id", id)
      .single();

    if (!existing) return notFound("Layanan tidak ditemukan.");

    const body = await request.json();

    const parsed = ServiceSchema.partial().safeParse(body);
    if (!parsed.success) {
      return badRequest(formatZodErrors(parsed.error.flatten().fieldErrors));
    }

    const finalPriceMin = parsed.data.price_min ?? existing.price_min;
    const finalPriceMax =
      parsed.data.price_max !== undefined
        ? parsed.data.price_max
        : existing.price_max;

    if (
      finalPriceMax !== null &&
      finalPriceMax !== undefined &&
      finalPriceMax < finalPriceMin
    ) {
      return badRequest("Harga maksimal tidak boleh lebih kecil dari harga minimal.");
    }

    const { data: updated, error } = await supabase
      .from("services")
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", serviceId)
      .eq("vendor_id", id)
      .select()
      .single();

    if (error) return serverError(error.message);

    return ok(updated);
  } catch {
    return serverError();
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id, serviceId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { data: vendor } = await supabase
      .from("vendor_profiles")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!vendor) return forbidden("Kamu bukan pemilik toko ini.");

    const { data: service } = await supabase
      .from("services")
      .select("id, is_active")
      .eq("id", serviceId)
      .eq("vendor_id", id)
      .single();

    if (!service) return notFound("Layanan tidak ditemukan.");

    const { count } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("service_id", serviceId)
      .in("status", ["pending", "confirmed", "waiting_payment", "dp_verified"]);

    if (count && count > 0) {
      return badRequest(
        "Layanan tidak bisa dihapus karena masih ada booking aktif yang menggunakan layanan ini."
      );
    }

    const { error } = await supabase
      .from("services")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", serviceId)
      .eq("vendor_id", id);

    if (error) return serverError(error.message);

    return ok({ message: "Layanan berhasil dihapus." });
  } catch {
    return serverError();
  }
}
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CreateBookingSchema } from "@/lib/validators";
import {
  ok,
  created,
  badRequest,
  unauthorized,
  forbidden,
  conflict,
  formatZodErrors,
  serverError,
} from "@/lib/utils/api";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const role     = searchParams.get("role") ?? "user";
    const status   = searchParams.get("status");
    const page     = Math.max(1, parseInt(searchParams.get("page")     ?? "1"));
    const per_page = Math.min(50, parseInt(searchParams.get("per_page") ?? "10"));
    const from = (page - 1) * per_page;
    const to   = from + per_page - 1;

    if (role === "vendor") {
      const { data: vendor } = await supabase
        .from("vendor_profiles").select("id").eq("user_id", user.id).single();
      if (!vendor) return forbidden("Kamu belum terdaftar sebagai vendor.");

      let q = supabase
        .from("bookings")
        .select(
          `id, event_date, event_name, event_location, setup_time, notes,
           status, rejection_reason, dp_proof_url, dp_verified_at, completed_at,
           created_at, updated_at,
           service:services(id, name, category),
           user:user_profiles(id, full_name, email, phone)`,
          { count: "exact" }
        )
        .eq("vendor_id", vendor.id)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (status) q = q.eq("status", status);
      const { data: bookings, error, count } = await q;
      if (error) return serverError(error.message);

      return ok({
        bookings: bookings ?? [],
        total: count ?? 0,
        page,
        per_page,
        total_pages: Math.ceil((count ?? 0) / per_page),
      });
    }

    let q = supabase
      .from("bookings")
      .select(
        `id, event_date, event_name, event_location, setup_time, notes,
         status, rejection_reason, dp_proof_url, dp_verified_at, completed_at,
         created_at, updated_at,
         service:services(id, name, category),
         vendor:vendor_profiles(id, store_name, slug, whatsapp_number, city)`,
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status) q = q.eq("status", status);
    const { data: bookings, error, count } = await q;
    if (error) return serverError(error.message);

    return ok({
      bookings: bookings ?? [],
      total: count ?? 0,
      page,
      per_page,
      total_pages: Math.ceil((count ?? 0) / per_page),
    });
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    if (!user.email_confirmed_at) {
      return forbidden("Email kamu belum diverifikasi. Cek inbox dan klik link konfirmasi.");
    }

    const { data: profile } = await supabase
      .from("user_profiles").select("id, role").eq("id", user.id).single();
    if (!profile) return unauthorized("Profil tidak ditemukan.");

    const body = await request.json();
    const parsed = CreateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(formatZodErrors(parsed.error.flatten().fieldErrors));
    }

    const { vendor_id, service_id, event_date, event_name, event_location, setup_time, notes } = parsed.data;

    const { data: vendor } = await supabase
      .from("vendor_profiles").select("id, is_active, is_verified, user_id").eq("id", vendor_id).single();
    if (!vendor || !vendor.is_active || !vendor.is_verified) {
      return badRequest("Vendor tidak ditemukan atau belum aktif.");
    }

    if (vendor.user_id === user.id) {
      return forbidden("Kamu tidak bisa booking ke toko kamu sendiri.");
    }

    const { data: service } = await supabase
      .from("services").select("id, is_active").eq("id", service_id).eq("vendor_id", vendor_id).single();
    if (!service || !service.is_active) {
      return badRequest("Layanan tidak ditemukan atau tidak aktif.");
    }

    const { data: availBlock } = await supabase
      .from("availability_blocks")
      .select("status")
      .eq("vendor_id", vendor_id)
      .eq("date", event_date)
      .single();

    if (availBlock && availBlock.status !== "available") {
      return conflict(`Tanggal ${event_date} tidak tersedia (status: ${availBlock.status}).`);
    }

    const { count: conflictCount } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("vendor_id", vendor_id)
      .eq("service_id", service_id)
      .eq("event_date", event_date)
      .in("status", ["confirmed", "waiting_payment", "dp_verified"]);

    if (conflictCount && conflictCount > 0) {
      return conflict("Layanan ini sudah di-booking untuk tanggal tersebut. Pilih tanggal lain.");
    }

    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        vendor_id,
        user_id: user.id,
        service_id,
        event_date,
        event_name,
        event_location,
        setup_time: setup_time ?? null,
        notes: notes ?? null,
        status: "pending",
      })
      .select("id, vendor_id, user_id, service_id, event_date, event_name, event_location, setup_time, notes, status, created_at")
      .single();

    if (insertError) return serverError(insertError.message);

    return created({
      booking,
      message: "Booking request berhasil dikirim! Tunggu konfirmasi dari vendor.",
    });
  } catch {
    return serverError();
  }
}

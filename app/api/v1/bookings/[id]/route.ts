import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        `id, event_date, event_name, event_location, setup_time, notes,
         status, rejection_reason, dp_verified_at, completed_at,
         created_at, updated_at,
         service:services(id, name, category, price_min, price_max, unit),
         vendor:vendor_profiles(id, store_name, slug, whatsapp_number, city, address, rating_avg),
         user:user_profiles(id, full_name, email, phone)`
      )
      .eq("id", id)
      .single();

    if (error || !booking) return notFound("Booking tidak ditemukan.");

    const userId   = (booking.user   as unknown as { id: string } | null)?.id;
    const vendorId = (booking.vendor as unknown as { id: string } | null)?.id;

    const isUser = userId === user.id;

    let isVendorOwner = false;
    if (vendorId) {
      const { data: ownVendor } = await supabase
        .from("vendor_profiles")
        .select("id")
        .eq("user_id", user.id)
        .eq("id", vendorId)
        .maybeSingle();
      isVendorOwner = !!ownVendor;
    }

    if (!isUser && !isVendorOwner) {
      return forbidden("Kamu tidak punya akses ke booking ini.");
    }

    let dp_proof_signed_url: string | null = null;
    const { data: raw } = await supabase
      .from("bookings")
      .select("dp_proof_url")
      .eq("id", id)
      .single();

    if (raw?.dp_proof_url) {
      const storagePath = raw.dp_proof_url.replace("booking-proofs/", "");
      const { data: signed } = await supabase.storage
        .from("booking-proofs")
        .createSignedUrl(storagePath, 3600);
      dp_proof_signed_url = signed?.signedUrl ?? null;
    }

    return ok({ ...booking, dp_proof_signed_url });
  } catch {
    return serverError();
  }
}

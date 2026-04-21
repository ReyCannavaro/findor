import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/utils/api";
import { SetAvailabilitySchema } from "@/lib/validators";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return badRequest("Parameter month wajib diisi dengan format YYYY-MM.");
    }

    const { data: vendor } = await supabase
      .from("vendor_profiles")
      .select("id")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (!vendor) return notFound("Vendor tidak ditemukan.");

    const startDate = `${month}-01`;
    const [year, mon] = month.split("-").map(Number);
    const lastDay = new Date(year, mon, 0).getDate();
    const endDate = `${month}-${String(lastDay).padStart(2, "0")}`;

    const { data: blocks, error } = await supabase
      .from("availability_blocks")
      .select("date, status")
      .eq("vendor_id", id)
      .gte("date", startDate)
      .lte("date", endDate);

    if (error) return serverError(error.message);
    const availabilityMap: Record<string, string> = {};
    (blocks ?? []).forEach((b) => {
      availabilityMap[b.date] = b.status;
    });

    return ok({ month, availability: availabilityMap });
  } catch {
    return serverError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();
    const { data: vendor } = await supabase
      .from("vendor_profiles")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!vendor) return forbidden("Kamu bukan pemilik toko ini.");

    const body = await request.json();
    const parsed = SetAvailabilitySchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((e) => e.message).join("; "));
    }
    const { dates, status } = parsed.data;
    const { data: lockedBlocks } = await supabase
      .from("availability_blocks")
      .select("date, booking_id")
      .eq("vendor_id", id)
      .in("date", dates)
      .eq("status", "full")
      .not("booking_id", "is", null);

    if (lockedBlocks && lockedBlocks.length > 0) {
      const lockedDates = lockedBlocks.map((b) => b.date).join(", ");
      return badRequest(
        `Tanggal berikut sudah dikunci oleh booking aktif dan tidak bisa diubah: ${lockedDates}`
      );
    }

    const upsertData = dates.map((date) => ({
      vendor_id: id,
      date,
      status,
      booking_id: null,
    }));

    const { error } = await supabase
      .from("availability_blocks")
      .upsert(upsertData, { onConflict: "vendor_id,date" });

    if (error) return serverError(error.message);

    return ok({
      updated: dates.length,
      status,
      message: `${dates.length} tanggal berhasil diset ke "${status}".`,
    });
  } catch {
    return serverError();
  }
}

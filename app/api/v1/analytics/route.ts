import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, forbidden, serverError } from "@/lib/utils/api";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { data: vendor } = await supabase
      .from("vendor_profiles")
      .select("id, store_name, rating_avg, review_count, city, category, is_verified")
      .eq("user_id", user.id)
      .single();

    if (!vendor) return forbidden("Kamu belum terdaftar sebagai vendor.");

    const { searchParams } = new URL(request.url);
    const year   = parseInt(searchParams.get("year")   ?? String(new Date().getFullYear()));
    const months = Math.min(12, Math.max(1, parseInt(searchParams.get("months") ?? "6")));

    const vendorId = vendor.id;

    const { data: allBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id, status, created_at, event_date, service_id")
      .eq("vendor_id", vendorId);

    if (bookingsError) return serverError(bookingsError.message);

    const bookingList = allBookings ?? [];

    const summary = {
      total:           bookingList.length,
      pending:         bookingList.filter(b => b.status === "pending").length,
      confirmed:       bookingList.filter(b => b.status === "confirmed").length,
      waiting_payment: bookingList.filter(b => b.status === "waiting_payment").length,
      dp_verified:     bookingList.filter(b => b.status === "dp_verified").length,
      completed:       bookingList.filter(b => b.status === "completed").length,
      rejected:        bookingList.filter(b => b.status === "rejected").length,
      cancelled:       bookingList.filter(b => b.status === "cancelled").length,
    };

    const completionRate = summary.total > 0
      ? Math.round((summary.completed / summary.total) * 100)
      : 0;

    const monthlyMap: Record<string, { total: number; completed: number }> = {};
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[key] = { total: 0, completed: 0 };
    }

    bookingList.forEach(b => {
      const key = b.created_at.slice(0, 7);
      if (monthlyMap[key]) {
        monthlyMap[key].total++;
        if (b.status === "completed") monthlyMap[key].completed++;
      }
    });

    const monthlyBookings = Object.entries(monthlyMap).map(([month, v]) => ({
      month,
      label: new Date(month + "-01").toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
      total: v.total,
      completed: v.completed,
    }));

    const statusDistribution = Object.entries({
      completed:  summary.completed,
      pending:    summary.pending,
      confirmed:  summary.confirmed,
      cancelled:  summary.cancelled,
      rejected:   summary.rejected,
    })
      .filter(([, v]) => v > 0)
      .map(([status, count]) => ({ status, count }));

    const { data: services } = await supabase
      .from("services")
      .select("id, name, category, price_min, price_max, is_active")
      .eq("vendor_id", vendorId);

    const serviceList = services ?? [];

    const serviceBookingCount: Record<string, { total: number; completed: number }> = {};
    bookingList.forEach(b => {
      if (!b.service_id) return;
      if (!serviceBookingCount[b.service_id]) {
        serviceBookingCount[b.service_id] = { total: 0, completed: 0 };
      }
      serviceBookingCount[b.service_id].total++;
      if (b.status === "completed") serviceBookingCount[b.service_id].completed++;
    });

    const servicesPerformance = serviceList.map(s => ({
      id:         s.id,
      name:       s.name,
      category:   s.category,
      price_min:  s.price_min,
      price_max:  s.price_max,
      is_active:  s.is_active,
      total_bookings:     serviceBookingCount[s.id]?.total     ?? 0,
      completed_bookings: serviceBookingCount[s.id]?.completed ?? 0,
    })).sort((a, b) => b.total_bookings - a.total_bookings);

    const { data: reviews } = await supabase
      .from("reviews")
      .select("id, rating, comment, created_at, user:user_profiles(id, full_name, avatar_url)")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .limit(10);

    const reviewList = reviews ?? [];

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: reviewList.filter(r => r.rating === star).length,
    }));

    const reviewSummary = {
      rating_avg:          vendor.rating_avg,
      review_count:        vendor.review_count,
      rating_distribution: ratingDistribution,
      recent:              reviewList,
    };

    const todayStr = new Date().toISOString().split("T")[0];
    const { data: upcomingRaw } = await supabase
      .from("bookings")
      .select(`
        id, event_date, event_name, event_location, status,
        service:services(id, name, category),
        user:user_profiles(id, full_name)
      `)
      .eq("vendor_id", vendorId)
      .gte("event_date", todayStr)
      .in("status", ["confirmed", "dp_verified", "waiting_payment"])
      .order("event_date", { ascending: true })
      .limit(5);

    const yearStart = `${year}-01-01`;
    const yearEnd   = `${year}-12-31`;

    const yearBookings = bookingList.filter(
      b => b.event_date >= yearStart && b.event_date <= yearEnd
    );
    const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const dayOfWeekCount = [0, 0, 0, 0, 0, 0, 0];
    yearBookings.forEach(b => {
      const dow = new Date(b.event_date).getDay();
      dayOfWeekCount[dow]++;
    });
    const bookingByDay = DAY_LABELS.map((label, i) => ({
      label,
      count: dayOfWeekCount[i],
    }));

    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prevDate        = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey    = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

    const currentMonthTotal = monthlyMap[currentMonthKey]?.total ?? 0;
    const prevMonthTotal    = monthlyMap[prevMonthKey]?.total    ?? 0;
    const growthPct = prevMonthTotal === 0
      ? (currentMonthTotal > 0 ? 100 : 0)
      : Math.round(((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100);

    return ok({
      vendor: {
        id:          vendor.id,
        store_name:  vendor.store_name,
        city:        vendor.city,
        category:    vendor.category,
        is_verified: vendor.is_verified,
      },
      summary: {
        ...summary,
        completion_rate: completionRate,
      },
      growth: {
        current_month: currentMonthTotal,
        prev_month:    prevMonthTotal,
        pct:           growthPct,
      },
      monthly_bookings:    monthlyBookings,
      status_distribution: statusDistribution,
      services_performance: servicesPerformance,
      reviews:             reviewSummary,
      upcoming:            upcomingRaw ?? [],
      booking_by_day:      bookingByDay,
      meta: {
        year,
        months,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (e) {
    console.error("[analytics]", e);
    return serverError();
  }
}
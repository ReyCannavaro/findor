import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const USER_ROUTES   = ["/dashboard", "/bookings", "/bookmarks", "/profile"];
const VENDOR_ROUTES = ["/vendor/dashboard", "/vendor/services", "/vendor/bookings", "/vendor/availability", "/vendor/analytics"];
const ADMIN_ROUTES  = ["/admin"];
const GUEST_ONLY    = ["/login", "/register"];
const ADMIN_API_ROUTES = ["/api/v1/admin"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  if (GUEST_ONLY.some((r) => pathname.startsWith(r))) {
    if (user) return NextResponse.redirect(new URL("/dashboard", request.url));
    return supabaseResponse;
  }

  if (USER_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!user) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (VENDOR_ROUTES.some((r) => pathname.startsWith(r))) {
    // Belum login → redirect ke login dengan redirect param
    if (!user) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "vendor") {
      return NextResponse.redirect(new URL("/vendor/register", request.url));
    }

    return supabaseResponse;
  }

  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && !pathname.startsWith("/api")) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return supabaseResponse;
  }

  if (ADMIN_API_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
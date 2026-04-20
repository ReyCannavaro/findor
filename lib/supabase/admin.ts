import { createClient } from "@supabase/supabase-js";

/**
 * Admin client — bypass RLS.
 * HANYA digunakan di server-side (API routes / server actions).
 * JANGAN export ke client component.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

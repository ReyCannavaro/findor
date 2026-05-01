import { createClient } from '@/lib/supabase/server';
import HomeClient from './HomeClient';

async function getPopularVendors() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('vendor_profiles')
      .select(`
        id, store_name, slug, category, city, rating_avg, review_count, is_verified, description,
        services(price_min, price_max)
      `)
      .eq('is_active', true)
      .eq('is_verified', true)
      .order('rating_avg', { ascending: false })
      .limit(4);
    return data ?? [];
  } catch {
    return [];
  }
}

async function getCategoryCounts() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('vendor_profiles')
      .select('category')
      .eq('is_active', true)
      .eq('is_verified', true);
    if (!data) return {};
    const counts: Record<string, number> = {};
    for (const v of data) {
      counts[v.category] = (counts[v.category] ?? 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

export default async function HomePage() {
  const [popularVendors, categoryCounts] = await Promise.all([
    getPopularVendors(),
    getCategoryCounts(),
  ]);
  return <HomeClient popularVendors={popularVendors} categoryCounts={categoryCounts} />;
}
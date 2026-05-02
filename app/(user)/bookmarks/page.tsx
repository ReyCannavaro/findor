'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Heart, MapPin, Star, CheckCircle, Search,
  ArrowRight, Trash2, Package, Loader2, X,
} from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

interface VendorInfo {
  id: string;
  store_name: string;
  slug: string;
  category: string;
  city: string;
  rating_avg: number;
  review_count: number;
  is_verified: boolean;
}

interface BookmarkItem {
  id: string;
  created_at: string;
  vendor: VendorInfo;
}

function timeAgo(s: string) {
  const d = Math.floor((Date.now() - new Date(s).getTime()) / 86400000);
  if (d === 0) return 'Hari ini';
  if (d === 1) return 'Kemarin';
  if (d < 30)  return `${d} hari lalu`;
  const m = Math.floor(d / 30);
  if (m < 12) return `${m} bulan lalu`;
  return `${Math.floor(m / 12)} tahun lalu`;
}

const AVATAR_COLORS: Record<string, string> = {
  A:'#1C3D2E', B:'#2D6A4F', C:'#40916C', D:'#1B4332', E:'#0D3B2E',
  F:'#2D4739', G:'#1A5C41', H:'#245C45', I:'#1C4D38', J:'#1E5C44',
};
function avatarColor(name: string) {
  return AVATAR_COLORS[name[0]?.toUpperCase()] ?? '#1C3D2E';
}

function Skeleton({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
    }} />
  );
}

function VendorCard({
  item,
  removing,
  onRemove,
}: {
  item: BookmarkItem;
  removing: boolean;
  onRemove: (bookmarkId: string, vendorId: string) => void;
}) {
  const { vendor } = item;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #EBEBEB',
        overflow: 'hidden',
        transition: 'transform 0.22s, box-shadow 0.22s, opacity 0.3s',
        opacity: removing ? 0.4 : 1,
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (!removing) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 8px 28px rgba(28,61,46,0.1)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ height: 3, background: 'linear-gradient(90deg, #1C3D2E, #40916C)' }} />
      <button
        onClick={() => onRemove(item.id, vendor.id)}
        disabled={removing}
        title="Hapus dari wishlist"
        style={{
          position: 'absolute', top: 14, right: 14,
          width: 30, height: 30, borderRadius: '50%',
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid #F3F4F6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: removing ? 'not-allowed' : 'pointer',
          zIndex: 2, transition: 'all 0.18s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          color: '#9CA3AF',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#FEF2F2';
          e.currentTarget.style.borderColor = '#FECACA';
          e.currentTarget.style.color = '#DC2626';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.92)';
          e.currentTarget.style.borderColor = '#F3F4F6';
          e.currentTarget.style.color = '#9CA3AF';
        }}
      >
        {removing
          ? <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} />
          : <X size={13} strokeWidth={2.5} />
        }
      </button>

      <div style={{
        height: 90,
        background: `linear-gradient(135deg, ${avatarColor(vendor.store_name)} 0%, ${avatarColor(vendor.store_name)}cc 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: 'rgba(255,255,255,0.15)',
          border: '2px solid rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 800, color: 'white',
          fontFamily: 'Fraunces, serif',
          backdropFilter: 'blur(8px)',
        }}>
          {vendor.store_name[0].toUpperCase()}
        </div>
      </div>

      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 6 }}>
          <h3 style={{
            fontSize: 15, fontWeight: 800, color: '#111827',
            margin: 0, flex: 1, lineHeight: 1.3,
            fontFamily: 'Fraunces, serif',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {vendor.store_name}
          </h3>
          {vendor.is_verified && (
            <CheckCircle size={15} color="#16A34A" style={{ flexShrink: 0, marginTop: 2 }} />
          )}
        </div>

        <span style={{
          display: 'inline-block',
          fontSize: 11, fontWeight: 600,
          color: '#1C3D2E', background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: 100, padding: '3px 10px',
          marginBottom: 10,
        }}>
          {vendor.category}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={13} fill="#F5A623" color="#F5A623" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
              {vendor.rating_avg > 0 ? vendor.rating_avg.toFixed(1) : '—'}
            </span>
            {vendor.review_count > 0 && (
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                ({vendor.review_count})
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={12} color="#9CA3AF" />
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{vendor.city}</span>
          </div>
        </div>

        <div style={{
          fontSize: 11, color: '#D1D5DB',
          marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <Heart size={11} fill="#D1D5DB" color="#D1D5DB" />
          Disimpan {timeAgo(item.created_at)}
        </div>

        <Link
          href={`/vendor/${vendor.slug}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '10px', borderRadius: 100,
            background: '#1C3D2E', color: '#d8f3dc',
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
            transition: 'background 0.18s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#2D6A4F'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1C3D2E'; }}
        >
          Lihat Vendor <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks]   = useState<BookmarkItem[]>([]);
  const [filtered, setFiltered]     = useState<BookmarkItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [search, setSearch]         = useState('');
  const [removing, setRemoving]     = useState<string | null>(null);

  const PER_PAGE = 12;

  const fetchBookmarks = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/v1/bookmarks?page=${p}&per_page=${PER_PAGE}`);
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (data.success) {
        setBookmarks(data.data.bookmarks ?? []);
        setTotalPages(data.data.total_pages ?? 1);
        setTotal(data.data.total ?? 0);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchBookmarks(page); }, [page, fetchBookmarks]);
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(bookmarks);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(bookmarks.filter(b =>
      b.vendor.store_name.toLowerCase().includes(q) ||
      b.vendor.category.toLowerCase().includes(q) ||
      b.vendor.city.toLowerCase().includes(q)
    ));
  }, [search, bookmarks]);

  const handleRemove = async (bookmarkId: string, vendorId: string) => {
    setRemoving(bookmarkId);
    try {
      const res  = await fetch('/api/v1/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: vendorId }),
      });
      const data = await res.json();
      if (data.success) {
        setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
        setTotal(prev => prev - 1);
      }
    } catch { /* silent */ }
    finally { setRemoving(null); }
  };

  const handleClearAll = async () => {
    if (!confirm(`Hapus semua ${total} vendor dari wishlist?`)) return;
    for (const b of bookmarks) {
      await fetch('/api/v1/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: b.vendor.id }),
      });
    }
    setBookmarks([]);
    setTotal(0);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;1,9..144,300&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .section-animate { animation: fadeUp 0.45s ease both; }
      `}</style>

      <Navbar />

      <main style={{ minHeight: '100vh', background: '#F7F7F4', paddingTop: 100 }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 20px 80px' }}>

          <div
            className="section-animate"
            style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, paddingTop: 12, flexWrap: 'wrap' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: '#FEF2F2', display: 'grid', placeItems: 'center',
                }}>
                  <Heart size={18} fill="#DC2626" color="#DC2626" />
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: 0, fontFamily: 'Fraunces, serif', letterSpacing: '-0.5px' }}>
                  Wishlist
                </h1>
              </div>
              <p style={{ fontSize: 14, color: '#9CA3AF', margin: 0 }}>
                {loading ? 'Memuat...' : `${total} vendor tersimpan`}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {total > 0 && !loading && (
                <button
                  onClick={handleClearAll}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 16px', borderRadius: 100,
                    border: '1.5px solid #FECACA', background: '#FEF2F2',
                    fontSize: 13, fontWeight: 600, color: '#DC2626',
                    cursor: 'pointer', transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                >
                  <Trash2 size={13} /> Hapus Semua
                </button>
              )}
              <Link href="/search" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                fontSize: 13, fontWeight: 700, color: '#1C3D2E',
                background: '#fff', border: '1px solid #EBEBEB',
                borderRadius: 100, padding: '9px 18px', textDecoration: 'none',
                transition: 'all 0.18s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C7DDD1'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EBEBEB'; }}
              >
                + Cari Vendor
              </Link>
            </div>
          </div>

          {!loading && total > 0 && (
            <div className="section-animate" style={{ marginBottom: 24 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#fff', border: '1.5px solid #E5E7EB',
                borderRadius: 12, padding: '11px 16px',
                maxWidth: 420, transition: 'border-color 0.2s',
              }}
                onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1C3D2E'; }}
                onBlurCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'; }}
              >
                <Search size={16} color="#9CA3AF" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Cari nama, kategori, atau kota..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    flex: 1, border: 'none', outline: 'none',
                    fontSize: 14, color: '#111827', background: 'transparent',
                    fontFamily: 'inherit',
                  }}
                />
                {search && (
                  <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 0 }}>
                    <X size={14} />
                  </button>
                )}
              </div>
              {search && (
                <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 8 }}>
                  {filtered.length} hasil untuk &quot;{search}&quot;
                </p>
              )}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {Array(6).fill(0).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: '#fff', borderRadius: 16, border: '1px solid #EBEBEB',
                    overflow: 'hidden', animation: 'fadeUp 0.4s ease both',
                    animationDelay: `${i * 0.07}s`,
                  }}
                >
                  <div style={{ height: 90, background: '#F0F0EC' }} />
                  <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Skeleton w="75%" h={18} r={6} />
                    <Skeleton w={90} h={22} r={100} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Skeleton w={80} h={14} r={6} />
                      <Skeleton w={70} h={14} r={6} />
                    </div>
                    <Skeleton w="100%" h={38} r={100} />
                  </div>
                </div>
              ))}
            </div>

          ) : filtered.length === 0 && search ? (
            <div className="section-animate" style={{
              background: '#fff', borderRadius: 20, border: '1px solid #EBEBEB',
              padding: '48px 32px', textAlign: 'center',
            }}>
              <Search size={32} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#374151', margin: '0 0 6px' }}>
                Tidak ditemukan
              </h3>
              <p style={{ fontSize: 14, color: '#9CA3AF', margin: '0 0 16px' }}>
                Tidak ada vendor yang cocok dengan &quot;{search}&quot;.
              </p>
              <button onClick={() => setSearch('')} style={{
                fontSize: 13, fontWeight: 600, color: '#1C3D2E',
                background: '#F3F9F5', border: 'none', borderRadius: 100,
                padding: '9px 18px', cursor: 'pointer',
              }}>
                Hapus pencarian
              </button>
            </div>

          ) : total === 0 ? (
            // Empty state
            <div className="section-animate" style={{
              background: '#fff', borderRadius: 20, border: '1px solid #EBEBEB',
              padding: '64px 32px', textAlign: 'center',
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: '#FEF2F2', display: 'grid', placeItems: 'center',
                margin: '0 auto 20px',
              }}>
                <Heart size={32} color="#DC2626" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 10px', fontFamily: 'Fraunces, serif' }}>
                Wishlist kamu kosong
              </h3>
              <p style={{ fontSize: 14, color: '#9CA3AF', maxWidth: 380, margin: '0 auto 28px', lineHeight: 1.7 }}>
                Simpan vendor favoritmu agar mudah ditemukan saat merencanakan event. Klik ikon ❤️ di halaman vendor mana saja.
              </p>
              <Link href="/search" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#1C3D2E', color: '#d8f3dc',
                fontSize: 14, fontWeight: 700, borderRadius: 100,
                padding: '13px 28px', textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(28,61,46,0.2)',
              }}>
                Jelajahi Vendor <ArrowRight size={15} />
              </Link>
            </div>

          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}>
                {filtered.map((item, i) => (
                  <div
                    key={item.id}
                    style={{ animation: 'fadeUp 0.4s ease both', animationDelay: `${i * 0.06}s` }}
                  >
                    <VendorCard
                      item={item}
                      removing={removing === item.id}
                      onRemove={handleRemove}
                    />
                  </div>
                ))}
              </div>

              {totalPages > 1 && !search && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      padding: '9px 20px', borderRadius: 100,
                      border: '1px solid #E5E7EB', background: '#fff',
                      fontSize: 13, fontWeight: 600,
                      color: page === 1 ? '#D1D5DB' : '#374151',
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    ← Sebelumnya
                  </button>
                  <span style={{ fontSize: 13, color: '#9CA3AF', padding: '0 8px' }}>
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{
                      padding: '9px 20px', borderRadius: 100,
                      border: '1px solid #E5E7EB', background: '#fff',
                      fontSize: 13, fontWeight: 600,
                      color: page === totalPages ? '#D1D5DB' : '#374151',
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    Berikutnya →
                  </button>
                </div>
              )}
            </>
          )}

          {!loading && total > 0 && (
            <div
              className="section-animate"
              style={{
                marginTop: 40,
                background: 'linear-gradient(115deg, #1C3D2E 0%, #2D6A4F 100%)',
                borderRadius: 20, padding: '24px 28px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: 'white', margin: '0 0 5px', fontFamily: 'Fraunces, serif' }}>
                  Siap memesan vendor?
                </h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                  Hubungi vendor via WhatsApp, negosiasi, lalu buat booking resmi.
                </p>
              </div>
              <Link href="/bookings" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#F5A623', color: '#1C3D2E',
                fontSize: 13, fontWeight: 700, borderRadius: 100,
                padding: '11px 22px', textDecoration: 'none', flexShrink: 0,
                boxShadow: '0 4px 16px rgba(245,166,35,0.35)',
              }}>
                Lihat Transaksi <ArrowRight size={14} />
              </Link>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
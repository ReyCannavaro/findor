import Link from 'next/link'

function IconIG() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="#374151" stroke="none" />
    </svg>
  )
}

function IconFacebook() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#374151">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function IconTikTok() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#374151">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  )
}

const socials = [
  { label: 'Instagram', icon: <IconIG /> },
  { label: 'Facebook', icon: <IconFacebook /> },
  { label: 'TikTok', icon: <IconTikTok /> },
]

const cols = [
  { title: 'Platform', links: [
    { label: 'Cari Vendor', href: '/search' },
    { label: 'Kategori', href: '/search' },
    { label: 'Cara Kerja', href: '/how-it-works' },
  ]},
  { title: 'Perusahaan', links: [
    { label: 'Tentang Kami', href: '/about' },
    { label: 'Karier', href: '#' },
    { label: 'Kontak', href: '#' },
  ]},
  { title: 'Dukungan', links: [
    { label: 'Vendor Support', href: '#' },
    { label: 'Pusat Bantuan', href: '#' },
    { label: 'Keamanan Dana', href: '#' },
    { label: 'Kebijakan Batal', href: '#' },
  ]},
]

export default function Footer() {
  return (
    <footer>
      {/* Gradient divider */}
      <div style={{ height: '80px', background: 'linear-gradient(to bottom, #f5f5f0, #ffffff)' }} />

      <div style={{ background: '#ffffff' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px 40px', boxSizing: 'border-box' as const }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', alignItems: 'flex-start' }}>
            <div>
              <img src="/logo_findor.jpg" alt="Findor" style={{ height: 48, width: 'auto', objectFit: 'contain', marginBottom: 12 }} />
              <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.8, marginTop: '0', marginBottom: '20px', maxWidth: '240px' }}>
                Platform pencarian vendor event premium. Menghubungkan penyelenggara dengan vendor terpercaya di seluruh Indonesia.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {socials.map(s => (
                  <a key={s.label} href="#" aria-label={s.label} style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    border: '1px solid #e5e7eb', background: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    textDecoration: 'none'
                  }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {cols.map(col => (
              <div key={col.title}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {col.links.map(l => (
                    <li key={l.label}>
                      <Link href={l.href} style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '48px', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ fontSize: '11px', color: '#9ca3af' }}>
              © {new Date().getFullYear()} Findor Marketplace · Find Your Vendor.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                <Link key={l} href="#" style={{ fontSize: '11px', color: '#9ca3af', textDecoration: 'none' }}>{l}</Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}
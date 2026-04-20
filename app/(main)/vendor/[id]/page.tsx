export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <main><h1>Detail Vendor: {id}</h1><p>TODO: implement galeri, layanan, peta, ulasan, tombol WA + booking</p></main>;
}

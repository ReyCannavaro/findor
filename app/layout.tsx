import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Findor — Find Your Vendor",
  description:
    "Platform pencarian vendor event premium untuk UMKM dan penyelenggara acara di Indonesia.",
  openGraph: {
    title: "Findor — Find Your Vendor",
    description:
      "Temukan vendor event terpercaya: sound system, dekorasi, catering, dokumentasi, dan lainnya.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,300;1,9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
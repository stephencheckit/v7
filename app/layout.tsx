import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0a0a0a',
};

export const metadata: Metadata = {
  title: "Checkit V7 - Vision-Based Food Service Software | Jolt Alternative",
  description: "Point camera, form auto-fills. Upload menu, labels print in 2 minutes. Built for multi-site operations. $499/mo transparent pricing. Free tier. Try Checkit V7 today.",
  keywords: [
    "food service software",
    "vision-based forms",
    "menu label printing",
    "temperature monitoring",
    "multi-site operations",
    "Jolt alternative",
    "food safety checklist",
    "HACCP software",
    "senior living food service",
    "hospital food service",
    "stadium food service"
  ],
  authors: [{ name: "Checkit V7" }],
  openGraph: {
    title: "Checkit V7 - Vision-Based Food Service Software",
    description: "From paper forms to digital compliance in 30 seconds. Built for multi-site operations.",
    url: "https://checkitv7.com",
    siteName: "Checkit V7",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Checkit V7 - Vision-Based Food Service Software",
    description: "Point camera, form auto-fills. 160x faster than traditional methods.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} antialiased`}
        style={{ fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}

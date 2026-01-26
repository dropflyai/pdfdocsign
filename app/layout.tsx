import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "PDF Doc Sign - Sign & Edit PDFs",
  description: "Simple, secure, and private PDF signing and editing in your browser. Fill forms, add signatures, and download instantly.",
  keywords: ["PDF", "sign", "edit", "fill", "forms", "signature", "document"],
  authors: [{ name: "PDF Doc Sign" }],
  openGraph: {
    title: "PDF Doc Sign - Sign PDFs in Seconds",
    description: "Fill forms. Add signatures. Download instantly. Your documents never leave your browser.",
    url: "https://pdfdocsign.com",
    siteName: "PDF Doc Sign",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PDF Doc Sign - Sign PDFs in Seconds",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Doc Sign - Sign PDFs in Seconds",
    description: "Fill forms. Add signatures. Download instantly.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prologue",
  description: "Prologue is an applet that is a minimalistic circular countdown timer.",
  openGraph: {
    title: 'Prologue',
    description: 'Prologue is an applet that is a minimalistic circular countdown timer.',
    url: 'https://prologue-offekt.vercel.app/',
    siteName: 'Prelude',
    images: [
      {
        url: 'https://offekt.s3.us-west-2.amazonaws.com/opengraph/prologue_opengraph_800x600.png', // Must be an absolute URL
        width: 800,
        height: 600,
      },
      {
        url: 'https://offekt.s3.us-west-2.amazonaws.com/opengraph/prologue_opengraph_1800x1600.png', // Must be an absolute URL
        width: 1800,
        height: 1600,
        alt: 'Prologue | Minimalistic Circular Countdown Timer',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prologue',
    description: 'Prologue is an applet that is a minimalistic circular countdown timer.',
    creator: '@drewvergara',
    images: ['https://offekt.s3.us-west-2.amazonaws.com/opengraph/prologue_opengraph_1800x1600.png'], // Must be an absolute URL
  }    
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

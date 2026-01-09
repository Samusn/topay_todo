import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import IOSScrollFix from "./components/IOSScrollFix";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "To Pay & To Do",
  description: "Elegant organization for your finances and tasks",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ background: '#000000', backgroundImage: 'linear-gradient(to bottom right, #000000, #020617, #000000)' }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: '#000000', backgroundImage: 'linear-gradient(to bottom right, #000000, #020617, #000000)', backgroundAttachment: 'fixed', backgroundSize: 'cover' }}
      >
        <IOSScrollFix />
        {children}
      </body>
    </html>
  );
}

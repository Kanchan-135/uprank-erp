import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { PwaProvider } from "@/context/PwaContext";
import { PwaRegister } from "@/components/common/PwaRegister";
import { OfflineBanner } from "@/components/common/OfflineBanner";

export const metadata: Metadata = {
  title: "Uprank ERP - Unified Multi-Tenant School Management Platform",
  description: "Uprank - Ready-to-deploy comprehensive School ERP supporting Super Admin, School Admin, Teacher, Student, and Parent modules.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon-192.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
        <meta name="theme-color" content="#4f46e5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Uprank ERP" />
        <meta name="application-name" content="Uprank ERP" />
      </head>
      <body className="antialiased bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <PwaProvider>
            <PwaRegister />
            <OfflineBanner />
            {children}
          </PwaProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

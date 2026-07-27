import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";

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
  title: "FCE Yauri Library",
  description: "FCE Yauri Library Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-teal-100">
        {children}

        {/* GLOBAL TOASTER */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "12px",
              padding: "14px",
              fontSize: "14px",
            },
            success: {
              style: {
                border: "1px solid #16a34a",
              },
            },
            error: {
              style: {
                border: "1px solid #dc2626",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
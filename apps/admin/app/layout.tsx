import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { AdminShell } from "@/components/AdminShell";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  // Private tooling: never index it.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-background font-sans text-foreground antialiased">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}

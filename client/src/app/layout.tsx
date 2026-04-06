import type { Metadata } from "next";
import { Poppins, Inter, Open_Sans, Rethink_Sans } from "next/font/google";
import "./globals.css";
import ClientProviders from '@/components/ClientProviders';
import { ThemeProvider } from "@/providers/theme-provider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const rethinkSans = Rethink_Sans({
  variable: "--font-rethink-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "WeddingHub - Plan Your Perfect Wedding",
  description: "WeddingHub is the ultimate platform for couples to find vendors and plan their dream wedding effortlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${inter.variable} ${openSans.variable} ${rethinkSans.variable} antialiased font-sans`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

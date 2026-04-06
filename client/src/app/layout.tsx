import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import ClientProviders from '@/components/ClientProviders';
import { ThemeProvider } from "@/providers/theme-provider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
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
      <body className={`${poppins.variable} antialiased font-sans`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

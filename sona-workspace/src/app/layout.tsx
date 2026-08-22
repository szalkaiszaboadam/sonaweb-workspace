import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SONA Workspace",
  description: "Modern workspace management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // A suppressHydrationWarning nagyon fontos a next-themes működéséhez!
    <html lang="hu" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light" /* 🚀 JAVÍTÁS: Alapból mindenhol világos mód van! */
          enableSystem /* 🚀 JAVÍTÁS: Meghagyjuk, hogy a profilban lehessen "Auto"-t (System) is választani */
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
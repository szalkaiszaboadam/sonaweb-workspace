// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { WorkspaceProvider } from "@/context/WorkspaceContext"; // Ezt importáljuk be
import { TimerProvider } from "@/context/TimerContext";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SONAWEB Workspace",
  description: "",
};

export interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="hu">
      <body className={`${geistSans.variable} antialiased bg-gray-950 text-gray-100`}>
        <AuthProvider>
          <WorkspaceProvider> {/* Ebbe csomagoljuk be a Timer-t és a tartamat */}
            <TimerProvider>
              {children}
            </TimerProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
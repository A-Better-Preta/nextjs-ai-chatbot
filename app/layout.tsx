import { ClerkProvider } from '@clerk/nextjs'
import { Suspense } from 'react'
import { ThemeProvider } from "@/components/theme-provider"
import { SWRegistration } from "@/components/sw-registration"
import type { Metadata, Viewport } from "next";
import "./globals.css"

export const metadata: Metadata = {
  title: "Piloted.app",
  description: "AI-powered private banking assistant",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Piloted.app",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SWRegistration />
            {/* Wrapping children in Suspense here fixes the 
               "Uncached data accessed outside Suspense" error 
               for everything inside the app.
            */}
            <Suspense fallback={null}>
              {children}
            </Suspense>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
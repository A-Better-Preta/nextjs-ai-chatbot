import { ClerkProvider } from '@clerk/nextjs'
import { Suspense } from 'react'
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
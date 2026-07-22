import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { UserProvider } from "@/contexts/user-context"
import { LicenseProvider } from "@/contexts/license-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { Toaster } from "@/components/ui/toaster"
import "@/lib/debug-utils"
import "@/lib/init-utils"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "DPMPTSP Kabupaten Tapin",
  description: "Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu Kabupaten Tapin",
  generator: "DPMPTSP KABUPATEN TAPIN",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${dmSans.variable} antialiased`}>
      <body className="font-sans">
        <UserProvider>
          <AuthProvider>
            <NotificationProvider>
              <LicenseProvider>
                {children}
                <Toaster />
              </LicenseProvider>
            </NotificationProvider>
          </AuthProvider>
        </UserProvider>
      </body>
    </html>
  )
}

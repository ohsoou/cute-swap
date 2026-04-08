import type { Metadata } from 'next'
import { Nunito, Cute_Font } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { BottomNavigation } from '@/components/bottom-navigation'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const nunito = Nunito({
  subsets: ["latin"],
  variable: '--font-nunito',
});

const cuteFont = Cute_Font({
  weight: "400",
  subsets: ["latin"],
  variable: '--font-cute',
});

export const metadata: Metadata = {
  title: 'Kawaii Swap Market - 오타쿠 굿즈 교환',
  description: '피규어, 문구류, CD 등 오타쿠 굿즈를 쉽게 교환하세요!',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { userId } = await auth()

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${nunito.variable} ${cuteFont.variable} font-sans antialiased`}>
          {children}
          <BottomNavigation userId={userId} />
          <Toaster />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </body>
      </html>
    </ClerkProvider>
  )
}

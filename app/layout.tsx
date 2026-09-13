import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AimRoom — CS2 Training Tracker',
  description: 'CS2 günlük antrenman ve görev takip paneli'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}

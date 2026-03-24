import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Refácil | Diagnóstico de Madurez IA',
  description: 'Evalúa el nivel de preparación de tu área para adoptar inteligencia artificial',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-bg1 text-text-primary min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

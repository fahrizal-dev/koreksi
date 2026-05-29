import './globals.css'

export const metadata = {
  title: 'Koreksi - AI Grading Assistant',
  description: 'Aplikasi koreksi jawaban siswa berbasis AI dengan kamera',
  manifest: '/manifest.json',
  themeColor: '#0a0a0a',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="bg-[#0a0a0a] text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}

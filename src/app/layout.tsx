import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from './components/Header'
import Footer from './components/Footer'
import { LanguageProvider } from './contexts/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PDFKing - 免费PDF工具',
  description: '提供PDF转Word、PDF合并/拆分、PDF压缩、图片转PDF、PDF编辑、OCR文字识别、PDF加密/解密等功能',
  keywords: ['PDF工具', 'PDF转Word', 'PDF合并', 'PDF拆分', 'PDF压缩', '图片转PDF', 'PDF编辑', 'OCR识别', 'PDF加密', 'PDF解密'],
  authors: [{ name: 'PDFKing Team' }],
  openGraph: {
    title: 'PDFKing - 免费PDF工具',
    description: '提供全方位的PDF处理功能，满足您的各种文档需求',
    type: 'website',
    url: 'https://pdfking.com',
    images: [
      {
        url: 'https://pdfking.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PDFKing - 免费PDF工具',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDFKing - 免费PDF工具',
    description: '提供全方位的PDF处理功能，满足您的各种文档需求',
    images: ['https://pdfking.com/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <LanguageProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}

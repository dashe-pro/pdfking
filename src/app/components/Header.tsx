"use client"

import Link from 'next/link'
import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

export default function Header() {
  const { t, locale, setLocale } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <header>
      <div className="container header-content">
        <Link href="/" className="logo">
          PDFKing
        </Link>
        
        {/* 语言切换按钮 */}
        <button 
          onClick={() => setLocale(locale === 'zh-CN' ? 'en' : 'zh-CN')}
          style={{
            background: 'none',
            border: '1px solid #3b82f6',
            color: '#3b82f6',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          {locale === 'zh-CN' ? 'EN' : '中文'}
        </button>
        
        {/* 移动端菜单按钮 */}
        <button 
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '×' : '☰'}
        </button>
        
        {/* 导航菜单 */}
        <nav className={mobileMenuOpen ? 'mobile-menu-open' : ''}>
          <ul>
            <li><Link href="/pdf-to-word">{t('common.pdfToWord')}</Link></li>
            <li><Link href="/pdf-merge-split">{t('common.pdfMergeSplit')}</Link></li>
            <li><Link href="/pdf-compress">{t('common.pdfCompress')}</Link></li>
            <li><Link href="/image-to-pdf">{t('common.imageToPdf')}</Link></li>
            <li><Link href="/pdf-edit">{t('common.pdfEdit')}</Link></li>
            <li><Link href="/ocr">{t('common.ocr')}</Link></li>
            <li><Link href="/pdf-encrypt-decrypt">{t('common.pdfEncryptDecrypt')}</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

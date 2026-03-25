"use client"

import Link from 'next/link'
import AdSense from './components/AdSense'
import { useLanguage } from './contexts/LanguageContext'

export default function Home() {
  const { t } = useLanguage()
  
  return (
    <div className="container">
      <section style={{ textAlign: 'center', margin: '2rem 0' }}>
        <h1>
          {t('home.title')}
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
          {t('home.description')}
        </p>
      </section>

      <section className="grid">
        <FeatureCard
          title={t('common.pdfToWord')}
          description="将PDF文件转换为可编辑的Word文档，保留原始格式"
          link="/pdf-to-word"
          icon="📄"
        />
        <FeatureCard
          title={t('common.pdfMergeSplit')}
          description="合并多个PDF文件或拆分PDF文件为多个单独文件"
          link="/pdf-merge-split"
          icon="📑"
        />
        <FeatureCard
          title={t('common.pdfCompress')}
          description="减小PDF文件大小，便于邮件发送和存储"
          link="/pdf-compress"
          icon="📦"
        />
        <FeatureCard
          title={t('common.imageToPdf')}
          description="将多张图片转换为单个PDF文件，方便整理和分享"
          link="/image-to-pdf"
          icon="🖼️"
        />
        <FeatureCard
          title={t('common.pdfEdit')}
          description="旋转、删除PDF页面，调整文档结构"
          link="/pdf-edit"
          icon="✏️"
        />
        <FeatureCard
          title={t('common.ocr')}
          description="将扫描件转换为可编辑的文本，支持多种语言"
          link="/ocr"
          icon="🔍"
        />
        <FeatureCard
          title={t('common.pdfEncryptDecrypt')}
          description="为PDF文件添加密码保护或解除密码限制"
          link="/pdf-encrypt-decrypt"
          icon="🔒"
        />
      </section>

      <AdSense />

      <section className="card">
        <h2>
          为什么选择PDFKing？
        </h2>
        <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
          <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#10b981', marginRight: '0.5rem' }}>✓</span>
            <span>{t('home.feature1')}</span>
          </li>
          <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#10b981', marginRight: '0.5rem' }}>✓</span>
            <span>文件处理在本地完成，保护您的隐私</span>
          </li>
          <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#10b981', marginRight: '0.5rem' }}>✓</span>
            <span>支持多种文件格式，满足各种需求</span>
          </li>
          <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#10b981', marginRight: '0.5rem' }}>✓</span>
            <span>{t('home.feature3')}</span>
          </li>
          <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#10b981', marginRight: '0.5rem' }}>✓</span>
            <span>响应式设计，支持电脑、平板和手机</span>
          </li>
        </ul>
      </section>
    </div>
  )
}

interface FeatureCardProps {
  title: string
  description: string
  link: string
  icon: string
}

function FeatureCard({ title, description, link, icon }: FeatureCardProps) {
  return (
    <Link href={link}>
      <div className="card">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
        <h3>{title}</h3>
        <p style={{ color: '#6b7280' }}>{description}</p>
      </div>
    </Link>
  )
}

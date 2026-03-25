"use client"

import { useState } from 'react'
import AdSense from '../../components/AdSense'
import { useTranslations } from 'next-intl'

// SEO元数据
export const metadata = {
  title: 'PDF转Word - 免费在线转换工具 | PDFKing',
  description: '将PDF文件免费转换为可编辑的Word文档，保留原始格式和布局，转换过程安全快速。',
  keywords: ['PDF转Word', 'PDF转换', 'Word文档', '免费PDF工具', '在线转换'],
  openGraph: {
    title: 'PDF转Word - 免费在线转换工具 | PDFKing',
    description: '将PDF文件免费转换为可编辑的Word文档，保留原始格式和布局，转换过程安全快速。',
  },
}

export default function PdfToWord() {
  const t = useTranslations('pdfToWord')
  const [file, setFile] = useState<File | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [convertedFile, setConvertedFile] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile)
        setError(null)
      } else {
        setError('请上传PDF文件')
        setFile(null)
      }
    }
  }

  const handleConvert = async () => {
    if (!file) {
      setError('请先选择PDF文件')
      return
    }

    setIsConverting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/pdf/convert-to-word', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '转换失败')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setConvertedFile(url)
    } catch (err) {
      setError('转换失败，请重试')
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div className="container">
      <h1>
        {t('title')}
      </h1>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            {t('upload')}
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
          />
          {error && (
            <p className="error">{error}</p>
          )}
          {file && (
            <p className="success">已选择文件: {file.name}</p>
          )}
        </div>

        <button
          onClick={handleConvert}
          disabled={!file || isConverting}
          style={{ width: '100%' }}
        >
          {isConverting ? '转换中...' : t('convert')}
        </button>

        {convertedFile && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3>
              转换完成
            </h3>
            <a
              href={convertedFile}
              download={`${file?.name.replace('.pdf', '.docx') || 'converted'}.docx`}
              style={{ 
                display: 'block', 
                backgroundColor: '#10b981', 
                color: 'white', 
                fontWeight: 'bold', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '0.375rem', 
                textAlign: 'center', 
                marginTop: '1rem',
                textDecoration: 'none'
              }}
            >
              {t('download')}
            </a>
          </div>
        )}
      </div>

      <AdSense />

      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <h2>
          功能说明
        </h2>
        <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>• 支持将PDF文件转换为可编辑的Word文档</li>
          <li style={{ marginBottom: '0.5rem' }}>• 保留原始文档的格式和布局</li>
          <li style={{ marginBottom: '0.5rem' }}>• 转换过程在本地完成，保护您的隐私</li>
          <li style={{ marginBottom: '0.5rem' }}>• 支持多种PDF版本和格式</li>
        </ul>
      </div>
    </div>
  )
}

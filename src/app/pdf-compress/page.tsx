"use client"

import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

export default function PdfCompress() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressedFile, setCompressedFile] = useState<string | null>(null)
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

  const handleCompress = async () => {
    if (!file) {
      setError('请先选择PDF文件')
      return
    }

    setIsCompressing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('level', compressionLevel)

      const response = await fetch('/api/pdf/compress', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '压缩失败')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setCompressedFile(url)
    } catch (err) {
      setError('压缩失败，请重试')
    } finally {
      setIsCompressing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-600 dark:text-blue-400">
        {t('pdfCompress.title')}
      </h1>

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            {t('pdfCompress.upload')}
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          {error && (
            <p className="text-red-500 mt-2">{error}</p>
          )}
          {file && (
            <p className="text-green-500 mt-2">已选择文件: {file.name}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            压缩级别
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="compressionLevel"
                value="low"
                checked={compressionLevel === 'low'}
                onChange={() => setCompressionLevel('low')}
                className="mr-2"
              />
              <span>低（质量优先）</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="compressionLevel"
                value="medium"
                checked={compressionLevel === 'medium'}
                onChange={() => setCompressionLevel('medium')}
                className="mr-2"
              />
              <span>中（平衡）</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="compressionLevel"
                value="high"
                checked={compressionLevel === 'high'}
                onChange={() => setCompressionLevel('high')}
                className="mr-2"
              />
              <span>高（大小优先）</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleCompress}
          disabled={!file || isCompressing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isCompressing ? '压缩中...' : t('pdfCompress.compress')}
        </button>

        {compressedFile && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
              压缩完成
            </h3>
            <a
              href={compressedFile}
              download={`${file?.name.replace('.pdf', '-compressed') || 'compressed'}.pdf`}
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 text-center"
            >
              {t('pdfCompress.download')}
            </a>
          </div>
        )}
      </div>

      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">
          功能说明
        </h2>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li>• 减小PDF文件大小，便于邮件发送和存储</li>
          <li>• 支持三种压缩级别：低（质量优先）、中（平衡）、高（大小优先）</li>
          <li>• 压缩过程在本地完成，保护您的隐私</li>
          <li>• 支持多种PDF版本和格式</li>
        </ul>
      </div>
    </div>
  )
}

"use client"

import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

export default function PdfEncryptDecrypt() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedFile, setProcessedFile] = useState<string | null>(null)
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

  const handleEncrypt = async () => {
    if (!file) {
      setError('请先选择PDF文件')
      return
    }

    if (!password) {
      setError('请输入密码')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('password', password)

      const response = await fetch('/api/pdf/encrypt', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '加密失败')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setProcessedFile(url)
    } catch (err) {
      setError('加密失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDecrypt = async () => {
    if (!file) {
      setError('请先选择PDF文件')
      return
    }

    if (!password) {
      setError('请输入密码')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('password', password)

      const response = await fetch('/api/pdf/decrypt', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '解密失败')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setProcessedFile(url)
    } catch (err) {
      setError('解密失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-600 dark:text-blue-400">
        {t('pdfEncryptDecrypt.title')}
      </h1>

      <div className="max-w-2xl mx-auto">
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('encrypt')}
            className={`px-4 py-2 ${activeTab === 'encrypt' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            PDF加密
          </button>
          <button
            onClick={() => setActiveTab('decrypt')}
            className={`px-4 py-2 ${activeTab === 'decrypt' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            PDF解密
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              {t('pdfEncryptDecrypt.upload')}
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
              {activeTab === 'encrypt' ? '设置密码' : '输入密码'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={activeTab === 'encrypt' ? '请设置加密密码' : '请输入解密密码'}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <button
            onClick={activeTab === 'encrypt' ? handleEncrypt : handleDecrypt}
            disabled={!file || !password || isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? `${activeTab === 'encrypt' ? '加密' : '解密'}中...` : activeTab === 'encrypt' ? t('pdfEncryptDecrypt.encrypt') : t('pdfEncryptDecrypt.decrypt')}
          </button>

          {processedFile && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                {activeTab === 'encrypt' ? '加密' : '解密'}完成
              </h3>
              <a
                href={processedFile}
                download={`${file?.name.replace('.pdf', activeTab === 'encrypt' ? '-encrypted' : '-decrypted') || activeTab === 'encrypt' ? 'encrypted' : 'decrypted'}.pdf`}
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 text-center"
              >
                {t('pdfEncryptDecrypt.download')}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">
          功能说明
        </h2>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li>• PDF加密：为PDF文件添加密码保护，防止未授权访问</li>
          <li>• PDF解密：解除PDF文件的密码限制，需要输入正确的密码</li>
          <li>• 处理过程在本地完成，保护您的隐私</li>
          <li>• 支持多种PDF版本和格式</li>
        </ul>
      </div>
    </div>
  )
}

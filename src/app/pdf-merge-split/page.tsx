"use client"

import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

type SplitFile = {
  filename: string
  data: string
}

export default function PdfMergeSplit() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'merge' | 'split'>('merge')
  const [mergeFiles, setMergeFiles] = useState<File[]>([])
  const [splitFile, setSplitFile] = useState<File | null>(null)
  const [splitRange, setSplitRange] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedFile, setProcessedFile] = useState<string | null>(null)
  const [splitFiles, setSplitFiles] = useState<SplitFile[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleMergeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf')
    if (pdfFiles.length > 0) {
      setMergeFiles(prev => [...prev, ...pdfFiles])
      setError(null)
    } else {
      setError('请上传PDF文件')
    }
  }

  const handleSplitFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setSplitFile(selectedFile)
        setError(null)
      } else {
        setError('请上传PDF文件')
        setSplitFile(null)
      }
    }
  }

  const removeMergeFile = (index: number) => {
    setMergeFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleMerge = async () => {
    if (mergeFiles.length < 2) {
      setError('请至少选择2个PDF文件进行合并')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      mergeFiles.forEach((file, index) => {
        formData.append(`files`, file)
      })

      const response = await fetch('/api/pdf/merge', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '合并失败')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setProcessedFile(url)
      setSplitFiles([])
    } catch (err) {
      setError('合并失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSplit = async () => {
    if (!splitFile) {
      setError('请选择PDF文件进行拆分')
      return
    }

    if (!splitRange) {
      setError('请输入拆分范围')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', splitFile)
      formData.append('range', splitRange)

      const response = await fetch('/api/pdf/split', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '拆分失败')
      }

      const data = await response.json()
      setSplitFiles(data.files || [])
      setProcessedFile(null)
    } catch (err) {
      setError('拆分失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadFile = (file: SplitFile) => {
    const binaryString = atob(file.data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAllFiles = () => {
    splitFiles.forEach((file, index) => {
      setTimeout(() => {
        downloadFile(file)
      }, index * 500)
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-600 dark:text-blue-400">
        {t('pdfMergeSplit.title')}
      </h1>

      <div className="max-w-2xl mx-auto">
        <div className="flex border-b mb-6">
          <button
            onClick={() => {
              setActiveTab('merge')
              setSplitFiles([])
              setProcessedFile(null)
            }}
            className={`px-4 py-2 ${activeTab === 'merge' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            PDF合并
          </button>
          <button
            onClick={() => {
              setActiveTab('split')
              setSplitFiles([])
              setProcessedFile(null)
            }}
            className={`px-4 py-2 ${activeTab === 'split' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            PDF拆分
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {activeTab === 'merge' ? (
            <div>
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  选择PDF文件（至少2个）
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleMergeFileChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                {error && (
                  <p className="text-red-500 mt-2">{error}</p>
                )}
                {mergeFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      已选择的文件：
                    </h4>
                    <ul className="space-y-2">
                      {mergeFiles.map((file, index) => (
                        <li key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {file.name}
                          </span>
                          <button
                            onClick={() => removeMergeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            删除
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={handleMerge}
                disabled={mergeFiles.length < 2 || isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? '合并中...' : t('pdfMergeSplit.merge')}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  选择PDF文件
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleSplitFileChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                {error && (
                  <p className="text-red-500 mt-2">{error}</p>
                )}
                {splitFile && (
                  <p className="text-green-500 mt-2">已选择文件: {splitFile.name}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  拆分范围（例如：1-3,5-7 或 1,2,3）
                </label>
                <input
                  type="text"
                  value={splitRange}
                  onChange={(e) => setSplitRange(e.target.value)}
                  placeholder="输入页码范围"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <button
                onClick={handleSplit}
                disabled={!splitFile || !splitRange || isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? '拆分中...' : t('pdfMergeSplit.split')}
              </button>
            </div>
          )}

          {processedFile && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                处理完成
              </h3>
              <a
                href={processedFile}
                download={`${activeTab === 'merge' ? 'merged' : 'split'}.pdf`}
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 text-center"
              >
                {t('pdfMergeSplit.download')}
              </a>
            </div>
          )}

          {splitFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                拆分完成 - {splitFiles.length} 个文件
              </h3>
              <button
                onClick={downloadAllFiles}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 mb-4"
              >
                下载所有文件
              </button>
              <div className="space-y-2">
                {splitFiles.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => downloadFile(file)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 text-left"
                  >
                    📄 {file.filename}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">
          功能说明
        </h2>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li>• PDF合并：将多个PDF文件合并为一个文件</li>
          <li>• PDF拆分：根据页码范围将PDF文件拆分为多个文件</li>
          <li>• 拆分后可以单独下载每个文件，也可以一键下载所有</li>
          <li>• 支持多种PDF版本和格式</li>
          <li>• 处理过程在本地完成，保护您的隐私</li>
        </ul>
      </div>
    </div>
  )
}

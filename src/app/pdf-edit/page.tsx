"use client"

import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

export default function PdfEdit() {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState<'rotate' | 'delete'>('rotate')
  const [rotatePages, setRotatePages] = useState('')
  const [rotateAngle, setRotateAngle] = useState<'90' | '180' | '270'>('90')
  const [deletePages, setDeletePages] = useState('')
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

  const handleRotate = async () => {
    if (!file) {
      setError('请先选择PDF文件')
      return
    }

    if (!rotatePages) {
      setError('请输入要旋转的页码')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('pages', rotatePages)
      formData.append('angle', rotateAngle)

      const response = await fetch('/api/pdf/rotate', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '旋转失败')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setProcessedFile(url)
    } catch (err) {
      setError('旋转失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!file) {
      setError('请先选择PDF文件')
      return
    }

    if (!deletePages) {
      setError('请输入要删除的页码')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('pages', deletePages)

      const response = await fetch('/api/pdf/delete-pages', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '删除失败')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setProcessedFile(url)
    } catch (err) {
      setError('删除失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-600 dark:text-blue-400">
        {t('pdfEdit.title')}
      </h1>

      <div className="max-w-2xl mx-auto">
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('rotate')}
            className={`px-4 py-2 ${activeTab === 'rotate' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            旋转页面
          </button>
          <button
            onClick={() => setActiveTab('delete')}
            className={`px-4 py-2 ${activeTab === 'delete' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            删除页面
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              {t('pdfEdit.upload')}
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

          {activeTab === 'rotate' ? (
            <div>
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  页码（例如：1,3,5 或 1-3）
                </label>
                <input
                  type="text"
                  value={rotatePages}
                  onChange={(e) => setRotatePages(e.target.value)}
                  placeholder="输入要旋转的页码"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  旋转角度
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rotateAngle"
                      value="90"
                      checked={rotateAngle === '90'}
                      onChange={() => setRotateAngle('90')}
                      className="mr-2"
                    />
                    <span>90度</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rotateAngle"
                      value="180"
                      checked={rotateAngle === '180'}
                      onChange={() => setRotateAngle('180')}
                      className="mr-2"
                    />
                    <span>180度</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rotateAngle"
                      value="270"
                      checked={rotateAngle === '270'}
                      onChange={() => setRotateAngle('270')}
                      className="mr-2"
                    />
                    <span>270度</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleRotate}
                disabled={!file || !rotatePages || isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? '旋转中...' : t('pdfEdit.edit')}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  页码（例如：1,3,5 或 1-3）
                </label>
                <input
                  type="text"
                  value={deletePages}
                  onChange={(e) => setDeletePages(e.target.value)}
                  placeholder="输入要删除的页码"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <button
                onClick={handleDelete}
                disabled={!file || !deletePages || isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? '删除中...' : t('pdfEdit.edit')}
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
                download={`${file?.name.replace('.pdf', '-edited') || 'edited'}.pdf`}
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 text-center"
              >
                {t('pdfEdit.download')}
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
          <li>• 旋转页面：选择页码和旋转角度（90度、180度、270度）</li>
          <li>• 支持多个页码旋转（如 1,3,5）或页码范围（如 1-3）</li>
          <li>• 删除页面：输入要删除的页码，支持单个页码（如 1）或页码范围（如 1-3）</li>
          <li>• 处理过程在本地完成，保护您的隐私</li>
          <li>• 支持多种PDF版本和格式</li>
        </ul>
      </div>
    </div>
  )
}

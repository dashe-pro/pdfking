"use client"

import { useState } from 'react'

export default function Ocr() {
  const [file, setFile] = useState<File | null>(null)
  const [language, setLanguage] = useState('chi_sim') // 简体中文
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [recognizedText, setRecognizedText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf') {
        setFile(selectedFile)
        setError(null)
      } else {
        setError('请上传图片或PDF文件')
        setFile(null)
      }
    }
  }

  const handleRecognize = async () => {
    if (!file) {
      setError('请先选择文件')
      return
    }

    setIsRecognizing(true)
    setError(null)
    setRecognizedText('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('language', language)

      const response = await fetch('/api/ocr/recognize', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '识别失败')
      }

      const data = await response.json()
      setRecognizedText(data.text)
    } catch (err) {
      setError('识别失败，请重试')
    } finally {
      setIsRecognizing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-600 dark:text-blue-400">
        OCR文字识别
      </h1>

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            选择文件（图片或PDF）
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
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
            语言
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="chi_sim">简体中文</option>
            <option value="chi_tra">繁体中文</option>
            <option value="eng">英语</option>
            <option value="jpn">日语</option>
            <option value="kor">韩语</option>
          </select>
        </div>

        <button
          onClick={handleRecognize}
          disabled={!file || isRecognizing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isRecognizing ? '识别中...' : '开始识别'}
        </button>

        {recognizedText && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
              识别结果
            </h3>
            <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-700 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                {recognizedText}
              </pre>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(recognizedText)}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
            >
              复制结果
            </button>
          </div>
        )}
      </div>

      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">
          功能说明
        </h2>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li>• 将扫描件或图片转换为可编辑的文本</li>
          <li>• 支持多种语言：简体中文、繁体中文、英语、日语、韩语</li>
          <li>• 支持图片和PDF文件</li>
          <li>• 识别过程在本地完成，保护您的隐私</li>
        </ul>
      </div>
    </div>
  )
}

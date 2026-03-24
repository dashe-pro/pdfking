"use client"

import { useState } from 'react'

export default function ImageToPdf() {
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const [convertedFile, setConvertedFile] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'))
    if (imageFiles.length > 0) {
      setImages(prev => [...prev, ...imageFiles])
      
      // 生成图片预览
      const previews = imageFiles.map(file => URL.createObjectURL(file))
      setImagePreviews(prev => [...prev, ...previews])
      
      setError(null)
    } else {
      setError('请上传图片文件')
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleConvert = async () => {
    if (images.length === 0) {
      setError('请先选择图片文件')
      return
    }

    setIsConverting(true)
    setError(null)

    try {
      const formData = new FormData()
      images.forEach((file, index) => {
        formData.append(`images`, file)
      })

      const response = await fetch('/api/pdf/image-to-pdf', {
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-600 dark:text-blue-400">
        图片转PDF
      </h1>

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            选择图片文件（支持多张）
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          {error && (
            <p className="text-red-500 mt-2">{error}</p>
          )}
        </div>

        {imagePreviews.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              已选择的图片：
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={images.length === 0 || isConverting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isConverting ? '转换中...' : '开始转换'}
        </button>

        {convertedFile && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
              转换完成
            </h3>
            <a
              href={convertedFile}
              download="images-to-pdf.pdf"
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 text-center"
            >
              下载PDF文件
            </a>
          </div>
        )}
      </div>

      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">
          功能说明
        </h2>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li>• 将多张图片转换为单个PDF文件</li>
          <li>• 支持多种图片格式：JPG、PNG、GIF等</li>
          <li>• 图片将按照上传顺序排列</li>
          <li>• 处理过程在本地完成，保护您的隐私</li>
        </ul>
      </div>
    </div>
  )
}

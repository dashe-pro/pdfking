import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const range = formData.get('range') as string

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: '请上传PDF文件' }, { status: 400 })
    }

    if (!range) {
      return NextResponse.json({ error: '请输入拆分范围' }, { status: 400 })
    }

    const pdfBytes = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const pageCount = pdfDoc.getPageCount()

    const pageRanges = parseRanges(range, pageCount)
    if (pageRanges.length === 0) {
      return NextResponse.json({ error: '无效的拆分范围' }, { status: 400 })
    }

    const splitFiles: Array<{ filename: string; data: string }> = []

    for (let i = 0; i < pageRanges.length; i++) {
      const rangeIndices = pageRanges[i]
      const splitPdf = await PDFDocument.create()
      const pages = await splitPdf.copyPages(pdfDoc, rangeIndices)
      pages.forEach(page => splitPdf.addPage(page))

      const splitPdfBytes = await splitPdf.save()
      const base64Data = Buffer.from(splitPdfBytes).toString('base64')
      
      const pageNumbers = rangeIndices.map(idx => idx + 1).join('-')
      splitFiles.push({
        filename: `split-part-${i + 1}-pages-${pageNumbers}.pdf`,
        data: base64Data
      })
    }

    return NextResponse.json({ files: splitFiles }, { status: 200 })
  } catch (error) {
    console.error('拆分失败:', error)
    return NextResponse.json({ error: '拆分失败，请重试' }, { status: 500 })
  }
}

function parseRanges(range: string, pageCount: number): Array<number[]> {
  const ranges: Array<number[]> = []
  const parts = range.split(',')

  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(Number)
      if (!isNaN(start) && !isNaN(end) && start <= end && start > 0) {
        const indices: number[] = []
        for (let i = start - 1; i < end; i++) {
          if (i < pageCount) {
            indices.push(i)
          }
        }
        if (indices.length > 0) {
          ranges.push(indices)
        }
      }
    } else {
      const page = Number(trimmed)
      if (!isNaN(page) && page > 0) {
        const index = page - 1
        if (index < pageCount) {
          ranges.push([index])
        }
      }
    }
  }

  return ranges
}

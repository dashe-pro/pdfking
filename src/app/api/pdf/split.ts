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

    // 读取PDF文件
    const pdfBytes = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const pageCount = pdfDoc.getPageCount()

    // 解析拆分范围
    const pageIndices = parseRange(range, pageCount)
    if (pageIndices.length === 0) {
      return NextResponse.json({ error: '无效的拆分范围' }, { status: 400 })
    }

    // 创建新的PDF文档并添加指定页面
    const splitPdf = await PDFDocument.create()
    const pages = await splitPdf.copyPages(pdfDoc, pageIndices)
    pages.forEach(page => splitPdf.addPage(page))

    // 生成拆分后的PDF文件
    const splitPdfBytes = await splitPdf.save()

    return new NextResponse(Buffer.from(splitPdfBytes), {
      headers: {
        'Content-Disposition': 'attachment; filename="split.pdf"',
        'Content-Type': 'application/pdf',
      },
    })
  } catch (error) {
    console.error('拆分失败:', error)
    return NextResponse.json({ error: '拆分失败，请重试' }, { status: 500 })
  }
}

// 解析页码范围（例如：1-3,5-7）
function parseRange(range: string, pageCount: number): number[] {
  const indices = new Set<number>()
  const parts = range.split(',')

  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.includes('-')) {
      // 处理范围（如 1-3）
      const [start, end] = trimmed.split('-').map(Number)
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start - 1; i < end; i++) {
          if (i < pageCount) {
            indices.add(i)
          }
        }
      }
    } else {
      // 处理单个页码（如 5）
      const page = Number(trimmed)
      if (!isNaN(page) && page > 0) {
        const index = page - 1
        if (index < pageCount) {
          indices.add(index)
        }
      }
    }
  }

  return Array.from(indices).sort((a, b) => a - b)
}

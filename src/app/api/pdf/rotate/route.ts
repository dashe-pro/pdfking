import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, degrees } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const pagesStr = formData.get('pages') as string
    const angleStr = formData.get('angle') as string

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: '请上传PDF文件' }, { status: 400 })
    }

    if (!pagesStr) {
      return NextResponse.json({ error: '请输入要旋转的页码' }, { status: 400 })
    }

    const angle = parseInt(angleStr, 10)

    if (![90, 180, 270].includes(angle)) {
      return NextResponse.json({ error: '请选择有效的旋转角度' }, { status: 400 })
    }

    const pdfBytes = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const pageCount = pdfDoc.getPageCount()

    const pageIndices = parsePages(pagesStr, pageCount)
    if (pageIndices.length === 0) {
      return NextResponse.json({ error: '无效的页码' }, { status: 400 })
    }

    pageIndices.forEach((pageIndex) => {
      const pdfPage = pdfDoc.getPage(pageIndex)
      pdfPage.setRotation(degrees(angle))
    })

    const rotatedPdfBytes = await pdfDoc.save()

    return new NextResponse(Buffer.from(rotatedPdfBytes), {
      headers: {
        'Content-Disposition': 'attachment; filename="rotated.pdf"',
        'Content-Type': 'application/pdf',
      },
    })
  } catch (error) {
    console.error('旋转失败:', error)
    return NextResponse.json({ error: '旋转失败，请重试' }, { status: 500 })
  }
}

function parsePages(pagesStr: string, pageCount: number): number[] {
  const pages = new Set<number>()
  const parts = pagesStr.split(',')

  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(Number)
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start - 1; i < end; i++) {
          if (i < pageCount) {
            pages.add(i)
          }
        }
      }
    } else {
      const page = Number(trimmed)
      if (!isNaN(page) && page > 0) {
        const index = page - 1
        if (index < pageCount) {
          pages.add(index)
        }
      }
    }
  }

  return Array.from(pages)
}

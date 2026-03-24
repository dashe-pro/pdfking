import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const pagesStr = formData.get('pages') as string

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: '请上传PDF文件' }, { status: 400 })
    }

    if (!pagesStr) {
      return NextResponse.json({ error: '请输入要删除的页码' }, { status: 400 })
    }

    // 读取PDF文件
    const pdfBytes = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const pageCount = pdfDoc.getPageCount()

    // 解析要删除的页码
    const pagesToDelete = parsePages(pagesStr, pageCount)
    if (pagesToDelete.length === 0) {
      return NextResponse.json({ error: '无效的页码' }, { status: 400 })
    }

    // 按降序排序，避免删除页面后索引变化
    pagesToDelete.sort((a, b) => b - a)

    // 删除指定页面
    for (const pageIndex of pagesToDelete) {
      pdfDoc.removePage(pageIndex)
    }

    // 生成删除页面后的PDF文件
    const modifiedPdfBytes = await pdfDoc.save()

    return new NextResponse(Buffer.from(modifiedPdfBytes), {
      headers: {
        'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '-modified')}.pdf"`,
        'Content-Type': 'application/pdf',
      },
    })
  } catch (error) {
    console.error('删除失败:', error)
    return NextResponse.json({ error: '删除失败，请重试' }, { status: 500 })
  }
}

// 解析页码字符串（例如：1,3,5 或 1-3）
function parsePages(pagesStr: string, pageCount: number): number[] {
  const pages = new Set<number>()
  const parts = pagesStr.split(',')

  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.includes('-')) {
      // 处理范围（如 1-3）
      const [start, end] = trimmed.split('-').map(Number)
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start - 1; i < end; i++) {
          if (i < pageCount) {
            pages.add(i)
          }
        }
      }
    } else {
      // 处理单个页码（如 5）
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

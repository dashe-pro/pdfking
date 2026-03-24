import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const level = formData.get('level') as string

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: '请上传PDF文件' }, { status: 400 })
    }

    // 读取PDF文件
    const pdfBytes = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(pdfBytes)

    // 根据压缩级别设置不同的保存选项
    const saveOptions = getSaveOptions(level)

    // 保存PDF文件（模拟压缩）
    const compressedPdfBytes = await pdfDoc.save(saveOptions)

    return new NextResponse(Buffer.from(compressedPdfBytes), {
      headers: {
        'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '-compressed')}.pdf"`,
        'Content-Type': 'application/pdf',
      },
    })
  } catch (error) {
    console.error('压缩失败:', error)
    return NextResponse.json({ error: '压缩失败，请重试' }, { status: 500 })
  }
}

// 根据压缩级别获取保存选项
function getSaveOptions(level: string) {
  switch (level) {
    case 'low':
      return {
        useObjectStreams: true,
      }
    case 'medium':
      return {
        useObjectStreams: true,
        linearized: true,
      }
    case 'high':
      return {
        useObjectStreams: true,
        linearized: true,
        // 注意：pdf-lib不直接支持图片压缩
        // 实际项目中可能需要使用其他库来处理图片压缩
      }
    default:
      return {
        useObjectStreams: true,
      }
  }
}

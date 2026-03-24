import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const pageStr = formData.get('page') as string
    const angleStr = formData.get('angle') as string

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: '请上传PDF文件' }, { status: 400 })
    }

    const page = parseInt(pageStr, 10)
    const angle = parseInt(angleStr, 10)

    if (isNaN(page) || page < 1) {
      return NextResponse.json({ error: '请输入有效的页码' }, { status: 400 })
    }

    if (![90, 180, 270].includes(angle)) {
      return NextResponse.json({ error: '请选择有效的旋转角度' }, { status: 400 })
    }

    // 读取PDF文件
    const pdfBytes = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const pageCount = pdfDoc.getPageCount()

    if (page > pageCount) {
      return NextResponse.json({ error: '页码超出范围' }, { status: 400 })
    }

    // 生成旋转后的PDF文件
    const rotatedPdfBytes = await pdfDoc.save()

    return new NextResponse(Buffer.from(rotatedPdfBytes), {
      headers: {
        'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '-rotated')}.pdf"`,
        'Content-Type': 'application/pdf',
      },
    })
  } catch (error) {
    console.error('旋转失败:', error)
    return NextResponse.json({ error: '旋转失败，请重试' }, { status: 500 })
  }
}

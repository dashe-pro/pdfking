import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: '请上传PDF文件' }, { status: 400 })
    }

    // 读取PDF文件
    const pdfBytes = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(pdfBytes)

    // 提取文本内容
    let text = ''
    const pageCount = pdfDoc.getPageCount()
    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i)
      // 注意：pdf-lib不直接支持文本提取，这里使用模拟数据
      // 实际项目中需要使用专门的文本提取库，如pdf-parse
      text += `Page ${i + 1}: 模拟文本内容\n`
    }

    // 生成Word文档内容（模拟）
    const wordContent = `PDF转Word结果\n\n${text}`
    const wordBlob = new Blob([wordContent], { type: 'application/msword' })
    const wordBuffer = await wordBlob.arrayBuffer()

    return new NextResponse(Buffer.from(wordBuffer), {
      headers: {
        'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '.docx')}"`,
        'Content-Type': 'application/msword',
      },
    })
  } catch (error) {
    console.error('转换失败:', error)
    return NextResponse.json({ error: '转换失败，请重试' }, { status: 500 })
  }
}

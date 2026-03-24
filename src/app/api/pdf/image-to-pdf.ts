import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const images = formData.getAll('images') as File[]

    if (images.length === 0) {
      return NextResponse.json({ error: '请至少选择一张图片' }, { status: 400 })
    }

    // 创建新的PDF文档
    const pdfDoc = await PDFDocument.create()

    // 遍历所有图片并添加到PDF中
    for (const imageFile of images) {
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json({ error: '请上传图片文件' }, { status: 400 })
      }

      const imageBytes = await imageFile.arrayBuffer()
      const image = await pdfDoc.embedPng(imageBytes)
      const { width, height } = image.scale(1)

      // 创建新页面并添加图片
      const page = pdfDoc.addPage([width, height])
      page.drawImage(image, {
        x: 0,
        y: 0,
        width,
        height,
      })
    }

    // 生成PDF文件
    const pdfBytes = await pdfDoc.save()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Disposition': 'attachment; filename="images-to-pdf.pdf"',
        'Content-Type': 'application/pdf',
      },
    })
  } catch (error) {
    console.error('转换失败:', error)
    return NextResponse.json({ error: '转换失败，请重试' }, { status: 500 })
  }
}

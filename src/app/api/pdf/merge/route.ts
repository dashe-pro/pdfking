import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (files.length < 2) {
      return NextResponse.json({ error: '请至少选择2个PDF文件进行合并' }, { status: 400 })
    }

    const mergedPdf = await PDFDocument.create()

    for (const file of files) {
      if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: '请上传PDF文件' }, { status: 400 })
      }

      const pdfBytes = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(pdfBytes)
      const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
      pages.forEach(page => mergedPdf.addPage(page))
    }

    const mergedPdfBytes = await mergedPdf.save()

    return new NextResponse(Buffer.from(mergedPdfBytes), {
      headers: {
        'Content-Disposition': 'attachment; filename="merged.pdf"',
        'Content-Type': 'application/pdf',
      },
    })
  } catch (error) {
    console.error('合并失败:', error)
    return NextResponse.json({ error: '合并失败，请重试' }, { status: 500 })
  }
}

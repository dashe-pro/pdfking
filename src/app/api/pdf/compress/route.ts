import { NextRequest, NextResponse } from 'next/server'
import shrinkPdf from 'pdf-shrink'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const level = formData.get('level') as string

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: '请上传PDF文件' }, { status: 400 })
    }

    const pdfBytes = await file.arrayBuffer()
    
    const shrunkPdfBuffer = await shrinkPdf(pdfBytes)
    
    const finalPdfDoc = await PDFDocument.load(shrunkPdfBuffer)
    const saveOptions = getSaveOptions(level)
    const finalPdfBytes = await finalPdfDoc.save(saveOptions)

    return new NextResponse(Buffer.from(finalPdfBytes), {
      headers: {
        'Content-Disposition': 'attachment; filename="compressed.pdf"',
        'Content-Type': 'application/pdf',
      },
    })
  } catch (error) {
    console.error('压缩失败:', error)
    return NextResponse.json({ error: '压缩失败，请重试' }, { status: 500 })
  }
}

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
      }
    default:
      return {
        useObjectStreams: true,
      }
  }
}

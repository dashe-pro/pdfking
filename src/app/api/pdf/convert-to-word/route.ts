import { NextRequest, NextResponse } from 'next/server'
import PDFParser from 'pdf2json'
import { Document, Packer, Paragraph, TextRun } from 'docx'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: '请上传PDF文件' }, { status: 400 })
    }

    const pdfBytes = await file.arrayBuffer()
    const buffer = Buffer.from(pdfBytes)

    const text = await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser()
      
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(new Error(errData.parserError))
      })
      
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        let extractedText = ''
        const pages = pdfData.Pages || []
        
        pages.forEach((page: any) => {
          const texts = page.Texts || []
          texts.forEach((text: any) => {
            const textContent = text.R?.[0]?.T || ''
            extractedText += decodeURIComponent(textContent) + ' '
          })
          extractedText += '\n\n'
        })
        
        resolve(extractedText)
      })
      
      pdfParser.parseBuffer(buffer)
    })

    const paragraphs: Paragraph[] = []
    const lines = text.split('\n')
    
    lines.forEach(line => {
      if (line.trim()) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                font: 'Arial',
                size: 24,
              }),
            ],
            spacing: {
              after: 200,
            },
          })
        )
      }
    })

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    })

    const docxBuffer = await Packer.toBuffer(doc)

    return new NextResponse(docxBuffer, {
      headers: {
        'Content-Disposition': 'attachment; filename="converted.docx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
    })
  } catch (error) {
    console.error('转换失败:', error)
    return NextResponse.json({ error: '转换失败，请重试' }, { status: 500 })
  }
}

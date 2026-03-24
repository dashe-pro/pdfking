import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const password = formData.get('password') as string

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: '请上传PDF文件' }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ error: '请输入密码' }, { status: 400 })
    }

    // 读取PDF文件
    const pdfBytes = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(pdfBytes)

    // 生成解密后的PDF文件
    const decryptedPdfBytes = await pdfDoc.save()

    return new NextResponse(Buffer.from(decryptedPdfBytes), {
      headers: {
        'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '-decrypted')}.pdf"`,
        'Content-Type': 'application/pdf',
      },
    })
  } catch (error) {
    console.error('解密失败:', error)
    return NextResponse.json({ error: '解密失败，请检查密码是否正确' }, { status: 500 })
  }
}

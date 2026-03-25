import { NextRequest, NextResponse } from 'next/server'
import Tesseract from 'tesseract.js'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const language = formData.get('language') as string

    if (!file) {
      return NextResponse.json({ error: '请上传文件' }, { status: 400 })
    }

    const fileBytes = await file.arrayBuffer()
    const blob = new Blob([fileBytes])
    const url = URL.createObjectURL(blob)

    const { data: { text } } = await Tesseract.recognize(
      url,
      language || 'chi_sim',
      {
        logger: (info) => console.log(info),
      }
    )

    URL.revokeObjectURL(url)

    return NextResponse.json({ text }, { status: 200 })
  } catch (error) {
    console.error('识别失败:', error)
    return NextResponse.json({ error: '识别失败，请重试' }, { status: 500 })
  }
}

import Link from 'next/link'

export default function Header() {
  return (
    <header>
      <div className="container header-content">
        <Link href="/" className="logo">
          PDFKing
        </Link>
        <nav>
          <ul>
            <li><Link href="/pdf-to-word">PDF转Word</Link></li>
            <li><Link href="/pdf-merge-split">PDF合并/拆分</Link></li>
            <li><Link href="/pdf-compress">PDF压缩</Link></li>
            <li><Link href="/image-to-pdf">图片转PDF</Link></li>
            <li><Link href="/pdf-edit">PDF编辑</Link></li>
            <li><Link href="/ocr">OCR识别</Link></li>
            <li><Link href="/pdf-encrypt-decrypt">PDF加密/解密</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return Response.json({ error: 'File too large, max 5MB' }, { status: 400 })
  }

  const fileName = file.name.toLowerCase()
  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    let text = ''

    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      text = buffer.toString('utf-8')
    } else if (fileName.endsWith('.pdf')) {
      text = await extractPDFText(buffer)
    } else if (fileName.endsWith('.docx')) {
      text = await extractDocxText(buffer)
    } else if (fileName.endsWith('.doc')) {
      return Response.json({ error: '暂不支持 .doc 格式，请转换为 .docx 后上传' }, { status: 400 })
    } else {
      return Response.json({ error: '不支持的文件格式，请上传 PDF、DOCX、TXT 或 Markdown 文件' }, { status: 400 })
    }

    if (!text.trim()) {
      return Response.json({ error: '未能从文件中提取到文本内容' }, { status: 400 })
    }

    return Response.json({ text: text.substring(0, 50000) })
  } catch (error) {
    console.error('File extract error:', error)
    return Response.json({ error: '文件解析失败，请确认文件内容正常' }, { status: 500 })
  }
}

async function extractPDFText(buffer: Buffer): Promise<string> {
  try {
    const pdfParseModule = await import('pdf-parse')
    // @ts-expect-error - pdf-parse export is tricky between CJS and ESM
    const parseFn = typeof pdfParseModule === 'function' ? pdfParseModule : (pdfParseModule.default || pdfParseModule)
    const data = await parseFn(buffer)
    return data.text || ''
  } catch {
    return ''
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(buffer)
    const docXml = await zip.file('word/document.xml')?.async('string')
    if (!docXml) return ''

    const paragraphs = docXml.split(/<\/w:p>/)
    const lines: string[] = []

    for (const para of paragraphs) {
      const tMatches = para.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || []
      if (tMatches.length > 0) {
        const line = tMatches
          .map((m: string) => {
            const content = m.match(/<w:t[^>]*>([^<]+)<\/w:t>/)
            return content ? content[1] : ''
          })
          .join('')
        if (line.trim()) lines.push(line)
      }
    }

    return lines.join('\n')
  } catch {
    return ''
  }
}

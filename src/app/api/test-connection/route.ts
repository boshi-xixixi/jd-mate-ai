export async function POST(req: Request) {
  try {
    const body = await req.json()
    const llmConfig = body?.llmConfig

    const apiKey = llmConfig?.apiKey || process.env.LLM_API_KEY
    if (!apiKey) {
      return Response.json({ error: '请提供 API Key' }, { status: 400 })
    }

    const baseURL = llmConfig?.baseURL || process.env.LLM_BASE_URL || 'https://api.openai.com/v1'
    const model = llmConfig?.model || process.env.LLM_MODEL || 'doubao-seed-2-0-lite-260215'
    const url = `${baseURL.replace(/\/$/, '')}/chat/completions`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Say "OK" in one word.' }],
        max_tokens: 10,
      }),
    })

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status}`
      try {
        const errData = await res.json()
        errorMsg = errData?.error?.message || errData?.message || errorMsg
      } catch {}
      return Response.json({ error: errorMsg }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error: unknown) {
    let message = '连接失败'
    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }
    return Response.json({ error: message }, { status: 500 })
  }
}

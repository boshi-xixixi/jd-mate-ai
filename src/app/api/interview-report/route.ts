import { createModel } from '@/lib/llm'
import { generateText } from 'ai'
import { INTERVIEW_REPORT_PROMPT } from '@/lib/prompts'

function extractJSON(text: string): string {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    try {
      JSON.parse(jsonMatch[1])
      return jsonMatch[1]
    } catch {}
  }

  const braceMatch = text.match(/\{[\s\S]*\}/)
  if (braceMatch) {
    try {
      JSON.parse(braceMatch[0])
      return braceMatch[0]
    } catch {}
  }

  return text
}

export async function POST(req: Request) {
  const { messages, jd, llmConfig } = await req.json()
  console.log('[API:interview-report] 收到请求, 消息数:', messages?.length, '有JD:', !!jd, 'LLM配置:', { model: llmConfig?.model, baseURL: llmConfig?.baseURL, hasApiKey: !!llmConfig?.apiKey })

  if (!messages || !Array.isArray(messages)) {
    console.warn('[API:interview-report] 消息为空或非数组')
    return Response.json({ error: 'Messages required' }, { status: 400 })
  }

  try {
    const messagesText = messages
      .map((m: { role: string; content: string }) => `[${m.role}]: ${m.content}`)
      .join('\n')

    const prompt = INTERVIEW_REPORT_PROMPT(messagesText, jd || '') +
      '\n\n请以纯 JSON 格式返回结果，包含以下字段：' +
      '\n- dimensions: 考察维度数组，每项包含 name(维度名)、score(0-100)、feedback(反馈)' +
      '\n- highlights: 面试亮点字符串数组' +
      '\n- improvements: 需改进之处字符串数组' +
      '\n- suggestions: 学习建议字符串数组' +
      '\n\n只返回 JSON，不要包含其他文字。'

    console.log('[API:interview-report] 开始调用LLM生成报告...')
    const result = await generateText({
      model: createModel(llmConfig),
      prompt,
    })
    console.log('[API:interview-report] LLM返回文本长度:', result.text?.length)

    const jsonStr = extractJSON(result.text)
    const parsed = JSON.parse(jsonStr)

    if (!parsed.dimensions || !Array.isArray(parsed.dimensions)) {
      console.error('[API:interview-report] 返回结构无效, 缺少dimensions数组')
      throw new Error('Invalid response structure from LLM')
    }

    console.log('[API:interview-report] 报告生成成功, 维度数:', parsed.dimensions.length)
    return Response.json(parsed)
  } catch (error) {
    console.error('Interview report error:', error)
    const message = error instanceof Error ? error.message : 'Report generation failed'
    if (message.includes('API key') || message.includes('401') || message.includes('AuthenticationError') || message.includes('Unauthorized')) {
      return Response.json({ error: 'API Key 无效或格式不正确，请检查设置中的 API Key 配置' }, { status: 401 })
    }
    return Response.json({ error: message }, { status: 500 })
  }
}

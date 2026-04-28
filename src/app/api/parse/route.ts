import { createModel } from '@/lib/llm'
import { generateText } from 'ai'
import { PARSE_JD_PROMPT } from '@/lib/prompts'

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
  const { jd, llmConfig } = await req.json()
  console.log('[API:parse] 收到请求, JD长度:', jd?.length, 'LLM配置:', { model: llmConfig?.model, baseURL: llmConfig?.baseURL, hasApiKey: !!llmConfig?.apiKey })

  if (!jd || typeof jd !== 'string') {
    console.warn('[API:parse] JD文本为空或非字符串')
    return Response.json({ error: 'JD text required' }, { status: 400 })
  }

  try {
    const prompt = PARSE_JD_PROMPT(jd) +
      '\n\n请以纯 JSON 格式返回结果，包含以下字段：' +
      '\n- skills: 技能数组，每项包含 name(技能名) 和 category(technical/business/experience)' +
      '\n- summary: 岗位核心要求摘要' +
      '\n- level: 经验级别(如 Junior/Mid/Senior)' +
      '\n\n只返回 JSON，不要包含其他文字。'

    console.log('[API:parse] 开始调用LLM解析JD...')
    const result = await generateText({
      model: createModel(llmConfig),
      prompt,
    })
    console.log('[API:parse] LLM返回文本长度:', result.text?.length)

    const jsonStr = extractJSON(result.text)
    const parsed = JSON.parse(jsonStr)

    if (!parsed.skills || !Array.isArray(parsed.skills)) {
      console.error('[API:parse] 返回结构无效, 缺少skills数组')
      throw new Error('Invalid response structure from LLM')
    }

    console.log('[API:parse] 解析成功, 技能数:', parsed.skills.length)
    return Response.json(parsed)
  } catch (error) {
    console.error('Parse JD error:', error)
    const message = error instanceof Error ? error.message : 'JD parse failed, please retry'
    if (message.includes('API key') || message.includes('401') || message.includes('AuthenticationError') || message.includes('Unauthorized')) {
      return Response.json({ error: 'API Key 无效或格式不正确，请检查设置中的 API Key 配置' }, { status: 401 })
    }
    return Response.json({ error: message }, { status: 500 })
  }
}

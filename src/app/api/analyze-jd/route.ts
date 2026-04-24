import { createModel } from '@/lib/llm'
import { generateText } from 'ai'
import { ANALYZE_JD_PROMPT } from '@/lib/prompts'

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

  if (!jd || typeof jd !== 'string') {
    return Response.json({ error: 'JD text required' }, { status: 400 })
  }

  try {
    const prompt = ANALYZE_JD_PROMPT(jd) +
      '\n\n请以纯 JSON 格式返回结果，包含以下字段：' +
      '\n- overview: 对象，包含 title(岗位名称)、level(级别)、summary(核心摘要)、keyRequirements(核心要求字符串数组)' +
      '\n- skills: 对象，包含 required(必须技能数组，每项含name和description)、bonus(加分技能数组，每项含name和description)、hidden(隐性要求数组，每项含keyword和meaning)' +
      '\n- hiddenMessages: 数组，每项含 phrase(JD原文措辞)、interpretation(潜台词解读)、advice(应对建议)' +
      '\n- competitiveness: 对象，包含 difficulty(难度等级1-5)、scarcity(稀缺度1-5)、analysis(分析说明)' +
      '\n- interviewStrategy: 对象，包含 focusAreas(重点方向数组，每项含area和reason)、highFreqTopics(高频考点字符串数组)、preparationTips(准备建议字符串数组)' +
      '\n- learningPath: 数组，每项含 stage(阶段名)、skills(技能数组)、estimatedTime(预计时间)、resources(学习资源建议)' +
      '\n\n只返回 JSON，不要包含其他文字。'

    const result = await generateText({
      model: createModel(llmConfig),
      prompt,
    })

    const jsonStr = extractJSON(result.text)
    const parsed = JSON.parse(jsonStr)

    if (!parsed.overview || !parsed.skills) {
      throw new Error('Invalid response structure from LLM')
    }

    return Response.json(parsed)
  } catch (error) {
    console.error('Analyze JD error:', error)
    const message = error instanceof Error ? error.message : 'JD analysis failed'
    if (message.includes('API key') || message.includes('401') || message.includes('AuthenticationError') || message.includes('Unauthorized')) {
      return Response.json({ error: 'API Key 无效或格式不正确，请检查设置中的 API Key 配置' }, { status: 401 })
    }
    return Response.json({ error: message }, { status: 500 })
  }
}

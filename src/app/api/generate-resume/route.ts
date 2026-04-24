import { createModel } from '@/lib/llm'
import { generateText } from 'ai'
import { GENERATE_RESUME_PROMPT } from '@/lib/prompts'

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
  const { userProfile, jd, parsedJD, llmConfig } = await req.json()

  if (!userProfile || !jd) {
    return Response.json({ error: 'User profile and JD required' }, { status: 400 })
  }

  try {
    const profileStr = JSON.stringify(userProfile, null, 2)
    const parsedJDStr = JSON.stringify(parsedJD, null, 2)

    const prompt = GENERATE_RESUME_PROMPT(profileStr, jd, parsedJDStr) +
      '\n\n请以纯 JSON 格式返回结果，包含以下字段：' +
      '\n- content: 简历内容（Markdown 格式）' +
      '\n- skillGaps: 技能缺口分析数组，每项包含 skill(技能名)、status(matched/partial/missing)、suggestion(改进建议)' +
      '\n- matchScore: JD 匹配度评分(0-100)' +
      '\n- suggestions: 优化建议字符串数组' +
      '\n\n只返回 JSON，不要包含其他文字。'

    const result = await generateText({
      model: createModel(llmConfig),
      prompt,
    })

    const jsonStr = extractJSON(result.text)
    const parsed = JSON.parse(jsonStr)

    if (!parsed.content || typeof parsed.matchScore !== 'number') {
      throw new Error('Invalid response structure from LLM')
    }

    return Response.json({
      content: parsed.content,
      skillGaps: parsed.skillGaps || [],
      matchScore: parsed.matchScore,
      suggestions: parsed.suggestions || [],
    })
  } catch (error) {
    console.error('Generate resume error:', error)
    const message = error instanceof Error ? error.message : 'Resume generation failed'
    if (message.includes('API key') || message.includes('401') || message.includes('AuthenticationError') || message.includes('Unauthorized')) {
      return Response.json({ error: 'API Key 无效或格式不正确，请检查设置中的 API Key 配置' }, { status: 401 })
    }
    return Response.json({ error: message }, { status: 500 })
  }
}

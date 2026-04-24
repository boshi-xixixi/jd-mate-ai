import { createModel } from '@/lib/llm'
import { generateText } from 'ai'

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
  const { sectionTitle, sectionContent, jd, llmConfig } = await req.json()

  if (!sectionTitle || !sectionContent) {
    return Response.json({ error: 'Section title and content required' }, { status: 400 })
  }

  try {
    const prompt = [
      '你是一位资深猎头和简历优化专家。请对以下简历的某个章节内容进行润色优化。',
      '',
      `章节标题：${sectionTitle}`,
      '',
      '当前内容：',
      sectionContent,
      '',
      jd ? `目标岗位 JD（供参考）：\n${jd}` : '',
      '',
      '润色要求：',
      '1. 使用 STAR 法则（情境-任务-行动-结果）重写工作经历和项目经历',
      '2. 用更专业、有力的动词开头，如"主导"、"设计"、"优化"、"推动"',
      '3. 量化成果，添加具体数字和指标（如果原文没有，合理推测补充）',
      '4. 保持 Markdown 格式不变（保留标题层级、列表符号等）',
      '5. 不要改变内容的结构和章节标题',
      '6. 语言精炼，避免空话套话，每条描述控制在1-2行',
      '7. 突出与目标岗位的匹配度',
      '',
      '请以纯 JSON 格式返回结果，包含以下字段：',
      '- content: 润色后的章节内容（保持原有 Markdown 格式）',
      '',
      '只返回 JSON，不要包含其他文字。',
    ].filter(Boolean).join('\n')

    const result = await generateText({
      model: createModel(llmConfig),
      prompt,
    })

    const jsonStr = extractJSON(result.text)
    const parsed = JSON.parse(jsonStr)

    if (!parsed.content) {
      throw new Error('Invalid response structure from LLM')
    }

    return Response.json({ content: parsed.content })
  } catch (error) {
    console.error('Polish section error:', error)
    const message = error instanceof Error ? error.message : 'Polish failed'
    if (message.includes('API key') || message.includes('401') || message.includes('AuthenticationError') || message.includes('Unauthorized')) {
      return Response.json({ error: 'API Key 无效或格式不正确，请检查设置中的 API Key 配置' }, { status: 401 })
    }
    return Response.json({ error: message }, { status: 500 })
  }
}

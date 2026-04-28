import { createModel } from '@/lib/llm'
import { generateText } from 'ai'
import { GENERATE_QUESTIONS_PROMPT } from '@/lib/prompts'

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
  const { skills, level, summary, llmConfig } = await req.json()
  console.log('[API:generate] 收到请求, 技能数:', skills?.length, '级别:', level, 'LLM配置:', { model: llmConfig?.model, baseURL: llmConfig?.baseURL, hasApiKey: !!llmConfig?.apiKey })

  if (!skills || !Array.isArray(skills)) {
    console.warn('[API:generate] skills为空或非数组')
    return Response.json({ error: 'Skills required' }, { status: 400 })
  }

  try {
    const skillNames = skills.map((s: { name: string }) => s.name)

    const prompt = GENERATE_QUESTIONS_PROMPT(skillNames, level, summary) +
      '\n\n请以纯 JSON 格式返回结果，包含以下字段：' +
      '\n- questions: 面试题数组，每项包含：' +
      '\n  - id: 唯一ID' +
      '\n  - type: 题目类型(single-choice/multiple-choice/true-false/short-answer/coding)' +
      '\n  - question: 题目文本' +
      '\n  - options: 选择题选项数组(每项含 label 和 text)，非选择题不需要' +
      '\n  - codeSnippet: 编程题代码片段(可选)' +
      '\n  - difficulty: 难度(easy/medium/hard)' +
      '\n  - skillTag: 关联技能标签' +
      '\n  - points: 分值' +
      '\n\n只返回 JSON，不要包含其他文字。'

    console.log('[API:generate] 开始调用LLM生成题目...')
    const result = await generateText({
      model: createModel(llmConfig),
      prompt,
    })
    console.log('[API:generate] LLM返回文本长度:', result.text?.length)

    const jsonStr = extractJSON(result.text)
    const parsed = JSON.parse(jsonStr)

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      console.error('[API:generate] 返回结构无效, 缺少questions数组')
      throw new Error('Invalid response structure from LLM')
    }

    console.log('[API:generate] 生成成功, 题目数:', parsed.questions.length)
    return Response.json(parsed)
  } catch (error) {
    console.error('Generate questions error:', error)
    const message = error instanceof Error ? error.message : 'Question generation failed'
    if (message.includes('API key') || message.includes('401') || message.includes('AuthenticationError') || message.includes('Unauthorized')) {
      return Response.json({ error: 'API Key 无效或格式不正确，请检查设置中的 API Key 配置' }, { status: 401 })
    }
    return Response.json({ error: message }, { status: 500 })
  }
}

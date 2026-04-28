import { createModel } from '@/lib/llm'
import { generateText } from 'ai'
import { EVALUATE_PROMPT } from '@/lib/prompts'

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
  const { questions, answers, skills, llmConfig } = await req.json()
  console.log('[API:evaluate] 收到请求, 题目数:', questions?.length, '答案数:', answers?.length, '技能数:', skills?.length, 'LLM配置:', { model: llmConfig?.model, baseURL: llmConfig?.baseURL, hasApiKey: !!llmConfig?.apiKey })

  if (!questions || !answers) {
    console.warn('[API:evaluate] 缺少题目或答案')
    return Response.json({ error: 'Questions and answers required' }, { status: 400 })
  }

  try {
    const qaPairs = questions.map((q: Record<string, unknown>) => {
      const answer = answers.find((a: Record<string, unknown>) => a.questionId === q.id)
      return {
        question: q,
        userAnswer: answer?.answer || answer?.selectedOptions?.join(', ') || 'no answer',
      }
    })

    const skillNames = skills.map((s: { name: string }) => s.name)
    const questionsText = JSON.stringify(qaPairs, null, 2)

    const prompt = EVALUATE_PROMPT(questionsText, '', skillNames.join(', ')) +
      '\n\n请以纯 JSON 格式返回结果，包含以下字段：' +
      '\n- evaluations: 评分数组，每项包含 questionId、score(0-100)、maxScore、feedback、keyPoints(数组)、blindSpots(数组)' +
      '\n- radarData: 雷达图数据数组，每项包含 skill、score(0-100)、fullMark(100)' +
      '\n- totalScore: 总分(0-100)' +
      '\n- overallFeedback: 总体反馈' +
      '\n\n只返回 JSON，不要包含其他文字。'

    console.log('[API:evaluate] 开始调用LLM评分...')
    const result = await generateText({
      model: createModel(llmConfig),
      prompt,
    })
    console.log('[API:evaluate] LLM返回文本长度:', result.text?.length)

    const jsonStr = extractJSON(result.text)
    const parsed = JSON.parse(jsonStr)

    if (!parsed.evaluations || !Array.isArray(parsed.evaluations)) {
      console.error('[API:evaluate] 返回结构无效, 缺少evaluations数组')
      throw new Error('Invalid response structure from LLM')
    }

    console.log('[API:evaluate] 评分成功, 评估数:', parsed.evaluations.length, '总分:', parsed.totalScore)
    return Response.json(parsed)
  } catch (error) {
    console.error('Evaluate error:', error)
    const message = error instanceof Error ? error.message : 'Evaluation failed'
    if (message.includes('API key') || message.includes('401') || message.includes('AuthenticationError') || message.includes('Unauthorized')) {
      return Response.json({ error: 'API Key 无效或格式不正确，请检查设置中的 API Key 配置' }, { status: 401 })
    }
    return Response.json({ error: message }, { status: 500 })
  }
}

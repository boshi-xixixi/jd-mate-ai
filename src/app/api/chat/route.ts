import { createModel } from '@/lib/llm'
import { streamText } from 'ai'
import { CHAT_SYSTEM_PROMPT } from '@/lib/prompts'

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages, jd, parsedJD, llmConfig } = await req.json()
  console.log('[API:chat] 收到请求, 消息数:', messages?.length, '有JD:', !!jd, 'LLM配置:', { model: llmConfig?.model, baseURL: llmConfig?.baseURL, hasApiKey: !!llmConfig?.apiKey })

  if (!messages || !Array.isArray(messages)) {
    console.warn('[API:chat] 消息为空或非数组')
    return Response.json({ error: 'Messages required' }, { status: 400 })
  }

  try {
    const jdContext = jd
      ? `Target JD: ${jd}\n${parsedJD ? `Core skills: ${parsedJD.skills?.map((s: { name: string }) => s.name).join(', ')}\nLevel: ${parsedJD.level}` : ''}`
      : 'General technical interview'

    console.log('[API:chat] 开始流式生成...')
    const result = streamText({
      model: createModel(llmConfig),
      system: `${CHAT_SYSTEM_PROMPT}\n\n${jdContext}`,
      messages,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Chat error:', error)
    return Response.json({ error: 'Chat failed' }, { status: 500 })
  }
}

import { createModel } from '@/lib/llm'
import { streamText } from 'ai'
import { CHAT_SYSTEM_PROMPT } from '@/lib/prompts'

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages, jd, parsedJD, llmConfig } = await req.json()

  if (!messages || !Array.isArray(messages)) {
    return Response.json({ error: 'Messages required' }, { status: 400 })
  }

  try {
    const jdContext = jd
      ? `Target JD: ${jd}\n${parsedJD ? `Core skills: ${parsedJD.skills?.map((s: { name: string }) => s.name).join(', ')}\nLevel: ${parsedJD.level}` : ''}`
      : 'General technical interview'

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

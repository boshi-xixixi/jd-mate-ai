import { createOpenAI } from '@ai-sdk/openai'

interface LLMRequestConfig {
  apiKey?: string
  baseURL?: string
  model?: string
}

function extractJSON(text: string): string {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      JSON.parse(jsonMatch[0])
      return jsonMatch[0]
    } catch {
      const arrayMatch = text.match(/\[[\s\S]*\]/)
      if (arrayMatch) {
        try {
          JSON.parse(arrayMatch[0])
          return arrayMatch[0]
        } catch {}
      }
    }
  }
  return text
}

const NOISE_PATTERNS = [
  /^\[HMR\]/,
  /^\[WDS\]/,
  /React DevTools/,
  /react-devtools/,
  /forward-look-shared/,
  /Download the React/,
  /Hot Module Replacement/,
  /webpack compiled/,
  /webpack updated/,
  /Fast Refresh/,
]

function isNoiseLine(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false
  return NOISE_PATTERNS.some((p) => p.test(trimmed))
}

function sanitizeStream(chunk: string): string {
  try {
    const lines = chunk.split('\n')
    return lines
      .map((line) => {
        if (isNoiseLine(line)) return ''
        if (!line.startsWith('data: ') || line === 'data: [DONE]') return line
        try {
          const json = JSON.parse(line.slice(6))
          if (json.choices) {
            json.choices = json.choices.map((choice: Record<string, unknown>) => {
              if (choice.delta && typeof choice.delta === 'object') {
                const delta = choice.delta as Record<string, unknown>
                if ('reasoning_content' in delta) {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { reasoning_content: _, ...rest } = delta
                  delete (rest as Record<string, unknown>).reasoning_content
                  choice.delta = rest
                }
              }
              if (choice.message && typeof choice.message === 'object') {
                const message = choice.message as Record<string, unknown>
                if ('reasoning_content' in message) {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { reasoning_content: _, ...rest } = message
                  delete (rest as Record<string, unknown>).reasoning_content
                  choice.message = rest
                }
              }
              return choice
            })
          }
          return `data: ${JSON.stringify(json)}`
        } catch {
          return line
        }
      })
      .filter((l) => l !== '')
      .join('\n')
  } catch {
    return chunk
  }
}

function sanitizeResponseObject(obj: Record<string, unknown>): Record<string, unknown> {
  if (obj.output && Array.isArray(obj.output) && !obj.choices) {
    const messageContent = obj.output
      .filter((item: Record<string, unknown>) => item.type === 'message')
      .flatMap((item: Record<string, unknown>) => {
        const content = item.content as Array<Record<string, unknown>> | undefined
        return content
          ? content
              .filter((c: Record<string, unknown>) => c.type === 'output_text')
              .map((c: Record<string, unknown>) => c.text as string)
              .join('')
          : ''
      })
      .join('')

    const reasoningContent = obj.output
      .filter((item: Record<string, unknown>) => item.type === 'reasoning')
      .flatMap((item: Record<string, unknown>) => {
        const summary = item.summary as Array<Record<string, unknown>> | undefined
        return summary ? summary.map((s: Record<string, unknown>) => s.text as string).join('') : ''
      })
      .join('')

    const fullContent = reasoningContent
      ? reasoningContent + messageContent
      : messageContent

    const usage = obj.usage as Record<string, unknown> | undefined

    const mappedUsage = usage
      ? {
          ...usage,
          prompt_tokens: Number(usage.input_tokens || 0),
          completion_tokens: Number(usage.output_tokens || 0),
          total_tokens: Number(usage.input_tokens || 0) + Number(usage.output_tokens || 0),
        }
      : undefined

    return {
      id: obj.id,
      object: 'chat.completion',
      created: obj.created_at,
      model: obj.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: extractJSON(fullContent),
          },
          finish_reason: obj.status === 'completed' ? 'stop' : 'length',
        },
      ],
      usage: mappedUsage,
    }
  }

  if (obj.choices && Array.isArray(obj.choices)) {
    obj.choices = obj.choices.map((choice: Record<string, unknown>) => {
      if (choice.message && typeof choice.message === 'object') {
        const message = choice.message as Record<string, unknown>
        if ('reasoning_content' in message) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { reasoning_content: _, ...rest } = message
          delete (rest as Record<string, unknown>).reasoning_content
          if (typeof rest.content === 'string') {
            rest.content = extractJSON(rest.content)
          }
          choice.message = rest
        }
      }
      return choice
    })
  }

  return obj
}

function createSanitizingFetch(): typeof globalThis.fetch {
  return async (input, init) => {
    const response = await globalThis.fetch(input, init)
    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('text/event-stream')) {
      const reader = response.body?.getReader()
      if (!reader) return response

      const stream = new ReadableStream({
        async pull(controller) {
          try {
            const { done, value } = await reader.read()
            if (done) {
              controller.close()
              return
            }
            const text = new TextDecoder().decode(value)
            controller.enqueue(new TextEncoder().encode(sanitizeStream(text)))
          } catch (e) {
            controller.error(e)
          }
        },
        cancel() {
          reader.cancel()
        },
      })

      return new Response(stream, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      })
    }

    if (contentType.includes('application/json')) {
      try {
        const json = await response.json()
        const sanitized = sanitizeResponseObject(json)
        return new Response(JSON.stringify(sanitized), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        })
      } catch {
        return response
      }
    }

    return response
  }
}

export function createModel(config?: LLMRequestConfig) {
  const modelName = config?.model || process.env.LLM_MODEL || 'doubao-seed-2-0-lite-260215'
  const baseURL = config?.baseURL || process.env.LLM_BASE_URL
  const apiKey = config?.apiKey || process.env.LLM_API_KEY

  const isCustomProvider = !!baseURL && !baseURL.includes('api.openai.com')

  const client = createOpenAI({
    apiKey: apiKey || undefined,
    baseURL: baseURL || undefined,
    name: isCustomProvider ? 'custom' : undefined,
    fetch: isCustomProvider ? createSanitizingFetch() : undefined,
  })

  return client.chat(modelName)
}

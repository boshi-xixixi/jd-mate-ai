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
  const { text, llmConfig } = await req.json()
  console.log('[API:extract-profile] 收到请求, 文本长度:', text?.length, 'LLM配置:', { model: llmConfig?.model, baseURL: llmConfig?.baseURL, hasApiKey: !!llmConfig?.apiKey })

  if (!text || typeof text !== 'string') {
    console.warn('[API:extract-profile] 文本为空或非字符串')
    return Response.json({ error: 'Text content required' }, { status: 400 })
  }

  try {
    const prompt = [
      '你是一位资深猎头和简历解析专家。请从以下文本中提取用户的个人信息，生成结构化的简历数据。',
      '',
      '文本内容：',
      text,
      '',
      '请提取以下信息：',
      '- name: 姓名',
      '- title: 目标职位或当前职位',
      '- email: 邮箱',
      '- phone: 电话',
      '- location: 城市/地点',
      '- summary: 个人简介/自我评价',
      '- education: 教育背景（一行文字描述）',
      '- skills: 技能标签数组',
      '- workExperience: 工作经历数组，每项包含 id(自动生成)、company(公司)、role(职位)、duration(时间段)、description(工作描述)',
      '- projects: 项目经历数组，每项包含 id(自动生成)、name(项目名)、techStack(技术栈)、description(项目描述)、highlights(项目亮点)',
      '',
      '注意：',
      '1. 如果某些信息原文中没有，对应字段留空字符串或空数组',
      '2. id 字段使用时间戳格式，如 "w_' + Date.now() + '"',
      '3. 尽可能从文本中推断和提取信息',
      '4. 工作描述和项目描述要保留原文的关键信息',
      '',
      '请以纯 JSON 格式返回结果，只返回 JSON，不要包含其他文字。',
    ].join('\n')

    console.log('[API:extract-profile] 开始调用LLM提取信息...')
    const result = await generateText({
      model: createModel(llmConfig),
      prompt,
    })
    console.log('[API:extract-profile] LLM返回文本长度:', result.text?.length)

    const jsonStr = extractJSON(result.text)
    const parsed = JSON.parse(jsonStr)

    if (!parsed.name && parsed.workExperience?.length === 0 && parsed.projects?.length === 0) {
      throw new Error('无法从文本中提取有效信息')
    }

    const now = Date.now()
    const profile = {
      name: parsed.name || '',
      title: parsed.title || '',
      email: parsed.email || '',
      phone: parsed.phone || '',
      location: parsed.location || '',
      summary: parsed.summary || '',
      education: parsed.education || '',
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      workExperience: Array.isArray(parsed.workExperience)
        ? parsed.workExperience.map((w: Record<string, string>, i: number) => ({
            id: w.id || `w_${now + i}`,
            company: w.company || '',
            role: w.role || '',
            duration: w.duration || '',
            description: w.description || '',
          }))
        : [],
      projects: Array.isArray(parsed.projects)
        ? parsed.projects.map((p: Record<string, string>, i: number) => ({
            id: p.id || `p_${now + i}`,
            name: p.name || '',
            techStack: p.techStack || '',
            description: p.description || '',
            highlights: p.highlights || '',
          }))
        : [],
    }

    return Response.json(profile)
  } catch (error) {
    console.error('Extract profile error:', error)
    const message = error instanceof Error ? error.message : 'Profile extraction failed'
    if (message.includes('API key') || message.includes('401') || message.includes('AuthenticationError') || message.includes('Unauthorized')) {
      return Response.json({ error: 'API Key 无效或格式不正确，请检查设置中的 API Key 配置' }, { status: 401 })
    }
    return Response.json({ error: message }, { status: 500 })
  }
}

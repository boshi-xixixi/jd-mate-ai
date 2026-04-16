# JD 智能出题器 (JD-to-Interview Generator) 方案设计

## 1. 项目愿景 (Overview)
一个专为求职者与学生打造的开源 AI 面试辅导工具。通过输入目标岗位的 JD（Job Description），系统利用大语言模型自动解析核心技能栈，并生成高相关性的定制化面试题库。配合沉浸式的答题体验与 AI 判卷反馈，帮助用户精准备考。

## 2. 目标用户 (Target Audience)
- **求职者/候选人**：需要针对特定岗位进行考前突击与真实模拟。
- **在校学生**：了解大厂岗位要求，通过测验检验自身技术栈的薄弱环节。

## 3. 核心功能 MVP (Features)
- **JD 智能解析 (Parse)**：
  - 用户粘贴 JD 文本。
  - AI 提取并结构化输出：核心技能 (如 React, Node.js)、业务场景 (如 高并发, SaaS)、经验要求。
- **动态组卷出题 (Generate)**：
  - 基于解析出的技能标签，AI 动态生成：
    - 5 道高频基础知识题（单选/多选/判断）
    - 3 道情景应用简答题
    - 1 道代码实现/SQL 思路题
- **沉浸式刷题体验 (Practice)**：
  - 极简卡片式（Flashcard）交互或分步表单。
  - 支持代码高亮与 Markdown 渲染，降低视觉疲劳。
- **AI 智能判卷与反馈 (Evaluate)**：
  - 提交答案后，AI 给出综合评分（0-100 分）。
  - 提供详细的“得分点”、“知识盲区”高亮，以及能力雷达图。

## 4. 技术栈选型 (Tech Stack)
采用 **全栈 Serverless 流派**，主打高颜值与极简开源部署：
- **框架**：Next.js (App Router) - 全栈同构，利于一键部署
- **视觉/UI**：Tailwind CSS + Shadcn UI (Vercel/Linear 极简暗黑风格)
- **AI 集成**：Vercel AI SDK (提供丝滑的流式打字机效果)
- **状态/存储**：初期采用纯前端 LocalStorage 或 Zustand 进行状态管理，降低开源 Fork 门槛；后期可无缝接入 Supabase。
- **部署**：Vercel (一键部署，天然支持 Serverless Functions)

## 5. 数据流向 (Data Flow)
1. `User` -> `JD Text` -> `Next.js API Route`
2. `API Route` -> `LLM (Prompt: 提取技能关键词)` -> `Structured JSON`
3. `API Route` -> `LLM (Prompt: 根据 JSON 生成题目)` -> `Stream Response (题目数组)`
4. `Frontend` -> 渲染题目卡片 -> `User` 填写答案
5. `User Answers` -> `API Route` -> `LLM (Prompt: 评分与解析)` -> `Feedback Data`

## 6. 演进路线 (Roadmap)
- **Phase 1 (MVP)**：跑通文本 JD 解析、生成纯净题目、实现答题与评分 UI。
- **Phase 2**：加入用户账号体系（Clerk/Auth.js）、保存历史成绩雷达图。
- **Phase 3**：引入真实面经 RAG（检索增强生成），提升出题的真实感与难度梯度。
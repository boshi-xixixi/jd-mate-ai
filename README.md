# JD Mate AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-6.0-blue)](https://sdk.vercel.ai/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

**AI-powered interview preparation platform.** Paste any job description (JD), and JD Mate generates tailored interview questions, optimizes your resume, runs AI mock interviews, and produces detailed analysis reports.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📋 **JD Deep Analysis** | AI-powered deep parsing of job descriptions — uncover hidden requirements, decode corporate jargon, assess competitiveness, and get personalized learning paths |
| ❓ **Smart Question Generation** | 9 meticulously crafted interview questions per JD, covering fundamentals to advanced topics, categorized by difficulty |
| 📄 **Resume Workshop** | AI-rewrites your resume using the STAR method, scores JD matching degree, and highlights improvement areas |
| 🎯 **Mock Interview** | AI interviewer conducts multi-round Q&A, adapts follow-up questions based on your answers, simulates real interview scenarios |
| 📊 **Dashboard** | Visualize your performance with radar charts, track answering progress, and identify knowledge gaps |
| 📝 **Interview Report** | After mock interviews, receive a structured复盘 report with dimension scores, highlights, and improvement suggestions |

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 8 (or npm / yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/boshi-xixixi/jd-mate-ai.git
cd jd-mate-ai

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your LLM API credentials (see below)

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Configuration

JD Mate supports any LLM provider compatible with the OpenAI format. Set your credentials in `.env.local`:

| Variable | Description | Example |
|---|---|---|
| `LLM_BASE_URL` | API endpoint URL | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `LLM_API_KEY` | Your API key | `sk-xxxxx` |
| `LLM_MODEL` | Model name | `qwen-plus` |

**Supported providers** (any OpenAI-compatible API):
- OpenAI / Azure OpenAI
- 阿里云百炼 / DashScope
- 火山引擎 / Doubao
- 智谱 AI / GLM
- Moonshot / Kimi
- DeepSeek
- Google Gemini (via compatible gateway)
- Self-hosted: vLLM, Ollama, llama.cpp

## 🏗️ Architecture

```
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # Backend API routes
│   │   │   ├── analyze-jd/    # JD deep analysis
│   │   │   ├── chat/          # Streaming chat
│   │   │   ├── evaluate/      # Answer evaluation
│   │   │   ├── interview-report/ # Interview report
│   │   │   ├── parse/         # JD parsing
│   │   │   ├── resume/        # Resume generation
│   │   │   └── ...
│   ├── components/       # React components
│   │   ├── jd-analysis.tsx    # JD analysis page
│   │   ├── mock-interview.tsx # Mock interview
│   │   ├── resume-builder.tsx # Resume builder
│   │   ├── dashboard.tsx      # Dashboard
│   │   └── ...
│   └── lib/              # Utilities
│       ├── api.ts             # API client
│       ├── llm.ts             # LLM abstraction layer
│       ├── prompts.ts         # AI prompts
│       ├── store.ts           # Zustand store
│       └── types.ts           # TypeScript types
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS 4, shadcn/ui, Framer Motion |
| **State** | Zustand with localStorage persistence |
| **AI** | Vercel AI SDK (`ai`), OpenAI-compatible SDK |
| **Charts** | Recharts (radar charts) |
| **PDF** | jsPDF + html2canvas |

## 🌐 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/boshi-xixixi/jd-mate-ai)

1. Import your forked repository to Vercel
2. Add environment variables in Vercel Dashboard:
   - `LLM_BASE_URL`
   - `LLM_API_KEY`
   - `LLM_MODEL`
3. Deploy!

### Docker

```bash
docker build -t jd-mate-ai .
docker run -p 3000:3000 \
  -e LLM_BASE_URL=https://api.openai.com/v1 \
  -e LLM_API_KEY=sk-xxxxx \
  -e LLM_MODEL=gpt-4o-mini \
  jd-mate-ai
```

### Self-Hosted (Node.js)

```bash
pnpm build
LLM_BASE_URL=... LLM_API_KEY=... LLM_MODEL=... pnpm start
```

## 📸 Screenshots

*(Screenshots coming soon — contributions welcome!)*

## 🤝 Contributing

We welcome contributions of all kinds! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Good first issues:**
- [ ] Add more resume templates
- [ ] Improve JD analysis prompt
- [ ] Add i18n support
- [ ] Write unit tests
- [ ] Improve mobile responsiveness

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vercel AI SDK](https://sdk.vercel.ai/) — Streaming AI integration
- [shadcn/ui](https://ui.shadcn.com/) — Beautiful component library
- [Framer Motion](https://www.framer.com/motion/) — Smooth animations
- [Lucide](https://lucide.dev/) — Icon library

---

Made with ❤️ for job seekers everywhere.

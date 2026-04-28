<div align="center">

# JD Mate AI

🤖 **AI-Powered Interview Preparation Platform**

Paste any job description (JD), and JD Mate generates tailored interview questions, optimizes your resume, runs AI mock interviews, and produces detailed analysis reports.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-6.0-blue)](https://sdk.vercel.ai/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Star](https://img.shields.io/github/stars/boshi-xixixi/jd-mate-ai?style=social)](https://github.com/boshi-xixixi/jd-mate-ai/stargazers)

[Features](#-features) · [Quick Start](#-quick-start) · [Deployment](#-deployment) · [Tech Stack](#️-tech-stack) · [Contributing](#-contributing) · [中文](README.md)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📋 **JD Deep Analysis** | AI-powered deep parsing of job descriptions — uncover hidden requirements, decode corporate jargon, assess competitiveness, and get personalized learning paths |
| ❓ **Smart Question Generation** | 9 meticulously crafted interview questions per JD, covering fundamentals to advanced topics, categorized by difficulty |
| 📄 **Resume Workshop** | AI-rewrites your resume using the STAR method, scores JD matching degree, and highlights improvement areas |
| 🎯 **Mock Interview** | AI interviewer conducts multi-round Q&A, adapts follow-up questions based on your answers, simulates real interview scenarios |
| 📊 **Dashboard** | Visualize your performance with radar charts, track answering progress, and identify knowledge gaps |
| 📝 **Interview Report** | After mock interviews, receive a structured review report with dimension scores, highlights, and improvement suggestions |

---

## 🔄 Workflow

```
Input JD  →  AI Analysis  →  Choose Module
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
       Smart Q&A          Resume           Mock Interview
      9 Questions        STAR Rewrite      AI Multi-round
      Score & Review     JD Match Score    Review Report
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 8 (or npm / yarn)

### Installation

```bash
git clone https://github.com/boshi-xixixi/jd-mate-ai.git
cd jd-mate-ai
pnpm install
cp .env.example .env.local
# Edit .env.local with your LLM API credentials
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Configuration

JD Mate supports any LLM provider compatible with the OpenAI format. **Two configuration methods** are available:

#### Method 1: In-App Settings (Recommended)

Click the ⚙️ **Model Settings** button in the top-right corner after launching:

- 🏷️ **Provider Presets**: One-click selection for OpenAI / DeepSeek / Doubao / DashScope / GLM / Custom
- 🔑 **API Key**: Enter your key with show/hide toggle
- 🌐 **Base URL**: Auto-filled or manually entered
- 🤖 **Model Name**: Auto-suggested default models
- ✅ **Connection Test**: One-click verification
- 💾 **Data Import/Export**: Backup and migrate all your data

> 💡 In-app settings are saved in browser localStorage — no file editing required.

#### Method 2: Environment Variables

For deployment scenarios (Vercel / Docker etc.), set in `.env.local`:

| Variable | Description | Example |
|---|---|---|
| `LLM_BASE_URL` | API endpoint URL | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `LLM_API_KEY` | Your API key | `sk-xxxxx` |
| `LLM_MODEL` | Model name | `qwen-plus` |

> ⚠️ In-app configuration takes priority over environment variables.

**Supported providers**: OpenAI, Azure OpenAI, DashScope, Doubao, GLM, Moonshot, DeepSeek, Google Gemini (via compatible gateway), vLLM, Ollama, llama.cpp

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS 4, shadcn/ui, Framer Motion |
| **State** | Zustand with localStorage persistence |
| **AI** | Vercel AI SDK (`ai`), OpenAI-compatible SDK |
| **Charts** | Recharts (radar charts) |
| **PDF** | jsPDF + html2canvas |

---

## 🌐 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/boshi-xixixi/jd-mate-ai)

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

---

## 🤝 Contributing

We welcome contributions of all kinds! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Issues for beginners:**
- [ ] Add more resume templates
- [ ] Improve JD analysis prompts
- [ ] Add i18n support
- [ ] Write unit tests
- [ ] Improve mobile responsiveness

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Vercel AI SDK](https://sdk.vercel.ai/) — Streaming AI integration
- [shadcn/ui](https://ui.shadcn.com/) — Beautiful component library
- [Framer Motion](https://www.framer.com/motion/) — Smooth animations
- [Lucide](https://lucide.dev/) — Icon library

---

<div align="center">
Built with ❤️ for every job seeker
</div>

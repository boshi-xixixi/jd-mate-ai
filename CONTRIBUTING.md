# Contributing to JD Mate AI

We welcome contributions of all kinds — code, documentation, design, or ideas!

---

## 中文

### 如何贡献

1. **Fork** 本仓库到你的 GitHub 账号下
2. **Clone** 到本地：`git clone https://github.com/boshi-xixixi/jd-mate-ai.git`
3. **创建分支**：`git checkout -b feature/your-feature-name`
4. **开发并提交**：
   - 遵循现有代码风格
   - 使用 Conventional Commits 规范（如 `feat: add resume template`）
   - 提交前运行 `pnpm lint` 和 `pnpm build` 确保无误
5. **提交 PR**：推送到你的 fork，然后在 GitHub 上发起 Pull Request

### 开发环境

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你的 LLM API 信息

# 启动开发服务器
pnpm dev
```

### 代码规范

- **TypeScript**：所有新代码使用 TypeScript
- **组件**：使用函数式组件 + Hooks
- **样式**：使用 Tailwind CSS，优先使用 utility classes
- **状态管理**：使用 Zustand，复杂状态使用 store
- **提交信息**：遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范

### 提交 PR 前请确认

- [ ] 代码通过 `pnpm lint` 检查
- [ ] 代码通过 `pnpm build` 编译
- [ ] 新增功能有相应的使用说明
- [ ] 更新相关文档（README / 组件注释等）

### 寻求帮助

遇到问题可以在 Issues 中提问，或者直接发起 Discussion。

---

## English

### How to Contribute

1. **Fork** this repository to your GitHub account
2. **Clone** locally: `git clone https://github.com/boshi-xixixi/jd-mate-ai.git`
3. **Create a branch**: `git checkout -b feature/your-feature-name`
4. **Develop and commit**:
   - Follow the existing code style
   - Use Conventional Commits (e.g., `feat: add resume template`)
   - Run `pnpm lint` and `pnpm build` before committing
5. **Open a PR**: Push to your fork and create a Pull Request on GitHub

### Development Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your LLM API credentials

# Start the dev server
pnpm dev
```

### Code Guidelines

- **TypeScript**: All new code should use TypeScript
- **Components**: Functional components with Hooks
- **Styling**: Tailwind CSS, prefer utility classes
- **State**: Zustand, use stores for complex state
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/)

### Before Submitting a PR

- [ ] Code passes `pnpm lint`
- [ ] Code passes `pnpm build`
- [ ] New features have usage documentation
- [ ] Related docs are updated (README / component comments, etc.)

### Getting Help

Feel free to open an Issue or start a Discussion if you have questions.

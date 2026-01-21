# Mermaid Preview

A modern, full-stack application for creating, editing, and sharing Mermaid diagrams with AI-powered syntax assistance.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)

## Features

- **Live Preview Editor** — Monaco-based code editor with real-time Mermaid diagram rendering
- **AI Syntax Fix** — Automatic error detection with AI-powered suggestions (supports Gemini, GPT, Claude)
- **Project Organization** — Organize diagrams into projects for better management
- **Sharing** — Toggle diagram visibility and share via public links
- **Export** — Download diagrams as PNG or SVG
- **Auto-save** — Changes are automatically saved with visual status indicators
- **Authentication** — Secure user authentication via Supabase Auth

## Tech Stack

| Category  | Technology               |
| --------- | ------------------------ |
| Framework | Next.js 16 (App Router)  |
| Language  | TypeScript 5.8+          |
| Styling   | Tailwind CSS + shadcn/ui |
| Database  | Supabase (PostgreSQL)    |
| State     | TanStack Query v5        |
| AI        | Vercel AI SDK            |
| Editor    | Monaco Editor            |
| Diagrams  | Mermaid.js               |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account
- AI provider API key (Google, OpenAI, or Anthropic)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/mermaid-preview-app.git
   cd mermaid-preview-app
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your credentials:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   SUPABASE_SECRET_KEY=sb_secret_...

   # AI Provider (choose one)
   AI_PROVIDER=google
   GOOGLE_GENERATIVE_AI_API_KEY=your-api-key
   ```

4. **Set up the database**

   ```bash
   # Push migrations to Supabase
   npx supabase db push

   # Generate TypeScript types
   pnpm gen
   ```

5. **Start the development server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `pnpm dev`        | Start development server |
| `pnpm build`      | Build for production     |
| `pnpm start`      | Start production server  |
| `pnpm lint`       | Run ESLint               |
| `pnpm test`       | Run tests                |
| `pnpm test:watch` | Run tests in watch mode  |
| `pnpm gen`        | Generate Supabase types  |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard
│   └── share/             # Public sharing routes
├── actions/               # Server Actions
├── components/            # Shared components
│   └── ui/               # shadcn/ui primitives
├── features/             # Feature modules
│   ├── editor/           # Diagram editor
│   ├── navigation/       # Navigation
│   └── sharing/          # Sharing functionality
├── hooks/                # Shared hooks
├── lib/                  # Utilities
│   ├── ai/              # AI configuration
│   └── supabase/        # Database clients
└── types/               # TypeScript definitions
```

## Environment Variables

| Variable                               | Required           | Description                                     |
| -------------------------------------- | ------------------ | ----------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Yes                | Supabase project URL                            |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes                | Supabase publishable key                        |
| `SUPABASE_SECRET_KEY`                  | Yes                | Supabase secret key                             |
| `AI_PROVIDER`                          | Yes                | AI provider: `google`, `openai`, or `anthropic` |
| `GOOGLE_GENERATIVE_AI_API_KEY`         | If using Google    | Gemini API key                                  |
| `OPENAI_API_KEY`                       | If using OpenAI    | OpenAI API key                                  |
| `ANTHROPIC_API_KEY`                    | If using Anthropic | Claude API key                                  |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Add environment variables in project settings
4. Deploy

### Other Platforms

Build the production bundle:

```bash
pnpm build
pnpm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

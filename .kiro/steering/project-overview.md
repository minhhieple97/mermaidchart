# Mermaid Preview App - Project Overview

This is a Next.js 16 application for creating, editing, and sharing Mermaid diagrams with AI-powered syntax fixing capabilities.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5.8+
- **Styling**: Tailwind CSS 3 + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **State Management**: TanStack Query v5 + React Hook Form
- **AI Integration**: Vercel AI SDK with multi-provider support (Google Gemini, OpenAI, Anthropic)
- **Editor**: Monaco Editor
- **Diagrams**: Mermaid.js

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (dashboard)/       # Protected dashboard pages
│   └── share/             # Public diagram sharing
├── actions/               # Server Actions
├── components/            # Shared UI components
│   └── ui/               # shadcn/ui primitives
├── features/             # Feature modules
│   ├── editor/           # Diagram editor feature
│   ├── navigation/       # Navigation components
│   └── sharing/          # Sharing functionality
├── hooks/                # Shared React hooks
├── lib/                  # Utilities and configurations
│   ├── ai/              # AI provider setup
│   └── supabase/        # Supabase client setup
├── providers/           # React context providers
└── types/               # TypeScript type definitions
```

## Key Features

1. **Project Management**: Create, edit, delete projects
2. **Diagram Editor**: Monaco-based code editor with live Mermaid preview
3. **AI Syntax Fix**: Automatic error detection and AI-powered fixes
4. **Sharing**: Public/private visibility toggle with shareable links
5. **Export**: PNG and SVG export capabilities
6. **Auto-save**: Debounced auto-save with status indicators

## Database Schema

- `projects`: User projects (id, name, user_id, timestamps)
- `diagrams`: Mermaid diagrams (id, project_id, name, code, is_public, timestamps)

## Environment Variables

Required:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Supabase publishable key
- `SUPABASE_SECRET_KEY` - Supabase secret key

AI Provider (choose one):

- `AI_PROVIDER` - Provider selection: "google", "openai", or "anthropic"
- `GOOGLE_GENERATIVE_AI_API_KEY` - For Gemini models
- `OPENAI_API_KEY` - For GPT models
- `ANTHROPIC_API_KEY` - For Claude models

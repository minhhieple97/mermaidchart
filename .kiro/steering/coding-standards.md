# Coding Standards

## TypeScript Guidelines

- Use strict TypeScript with no `any` types
- Prefer `interface` for object shapes, `type` for unions/intersections
- Export types from dedicated `*.types.ts` files
- Use Zod for runtime validation in Server Actions

## React Patterns

### Component Structure

```tsx
'use client'; // Only when needed

import { memo, useCallback } from 'react';
// External imports first, then internal

interface ComponentProps {
  // Props interface above component
}

export const Component = memo(function Component({ prop }: ComponentProps) {
  // Hooks at top
  // Callbacks with useCallback
  // Memoized values with useMemo
  // Effects last

  return <div />;
});
```

### Performance Rules

- Use `memo()` for components receiving object/array props
- Use `useCallback` for event handlers passed to children
- Use `useMemo` for expensive computations
- Dynamic import heavy components (Monaco, diff viewers)
- Hoist static objects/styles outside components

### Server vs Client Components

- Default to Server Components
- Add `'use client'` only for:
  - Event handlers (onClick, onChange)
  - Hooks (useState, useEffect)
  - Browser APIs (localStorage, window)
- Keep client components small and leaf-level

## File Naming

- Components: `kebab-case.tsx` (e.g., `code-editor.tsx`)
- Hooks: `use-*.ts` (e.g., `use-diagram-editor.ts`)
- Types: `*.types.ts` (e.g., `editor.types.ts`)
- Actions: `*.actions.ts` or `*.ts` in actions folder
- Tests: `*.test.ts` or `*.test.tsx`

## Feature Module Structure

```
features/
└── feature-name/
    ├── actions/       # Server actions
    ├── components/    # Feature components
    ├── hooks/         # Feature hooks
    ├── types/         # Feature types
    ├── utils/         # Feature utilities
    └── index.ts       # Public exports
```

## Import Order

1. React/Next.js imports
2. External library imports
3. Internal absolute imports (`@/`)
4. Relative imports
5. Type imports (with `type` keyword)

## Error Handling

- Use `next-safe-action` for Server Actions with Zod validation
- Return `{ success: boolean, error?: string, data?: T }` from actions
- Show toast notifications for user-facing errors
- Log errors server-side, never expose internal details to client

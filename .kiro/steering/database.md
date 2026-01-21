# Database Guidelines

## Supabase Setup

This project uses Supabase for authentication and PostgreSQL database.

## Query Layer Architecture

All Supabase queries are centralized in the `src/queries/` folder for clean separation:

```
src/queries/
├── index.ts              # Public exports
├── projects.queries.ts   # Project CRUD operations
├── diagrams.queries.ts   # Diagram CRUD operations
└── credits.queries.ts    # Credit management operations
```

### Benefits

- **Server-only**: All queries use server Supabase client
- **Reusable**: Shared across Server Actions and Server Components
- **Type-safe**: Strongly typed with database types
- **Testable**: Easy to mock and test
- **Maintainable**: Single source of truth for data access

## Type System (Single Source of Truth)

The type system follows a strict hierarchy:

1. **`src/types/database.types.ts`** - Auto-generated from Supabase schema (DO NOT EDIT)
2. **`src/types/database.ts`** - Re-exports and convenience aliases from database.types.ts

### Using Types

```typescript
// Import from database.ts (not database.types.ts directly)
import type { Project, Diagram, UserCredits } from '@/types/database';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';

// For feature-specific types, import from feature module
import type { UserCredits, DeductCreditsResult } from '@/features/credits';
```

### Regenerating Types

After schema changes, regenerate types:

```bash
pnpm gen
```

This updates `src/types/database.types.ts` with the latest schema.

## Using the Query Layer

### In Server Actions

```typescript
'use server';

import { authAction, ActionError } from '@/lib/safe-action';
import { getProjects, createProject } from '@/queries';

export const createProjectAction = authAction
  .inputSchema(schema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    try {
      const project = await createProject(user.id, parsedInput.name);
      return { success: true, project };
    } catch (error) {
      throw new ActionError(error.message);
    }
  });
```

### In Server Components

```typescript
import { getPublicDiagram } from '@/queries';

export default async function SharePage({ params }) {
  try {
    const diagram = await getPublicDiagram(params.diagramId);
    return <DiagramViewer diagram={diagram} />;
  } catch {
    return <NotFoundState />;
  }
}
```

### In Client Components (via Server Actions)

Client components should never import from `@/queries` directly. Use Server Actions instead:

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { getProjectsAction } from '@/actions/projects';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const result = await getProjectsAction({});
      return result.data;
    },
  });
}
```

## Migrations

Migrations are located in `supabase/migrations/`. Run them in order:

```bash
# Apply migrations via Supabase CLI
supabase db push
```

## Schema

### Projects Table

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Diagrams Table

```sql
CREATE TABLE diagrams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code TEXT DEFAULT 'graph TD\n    A[Start] --> B[End]',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### User Credits Table

```sql
CREATE TABLE user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 50 CHECK (balance >= 0),
  lifetime_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Credit Transactions Table

```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Negative for usage, positive for additions
  balance_after INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'ai_fix', 'purchase', 'bonus', 'refund', 'initial'
  reference_id UUID, -- Optional: link to diagram_id or other entity
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Credit Database Functions

- `initialize_user_credits(p_user_id)` - Creates credit record with 50 initial credits
- `deduct_credits(p_user_id, p_amount, p_transaction_type, p_reference_id, p_metadata)` - Atomic credit deduction
- `add_credits(p_user_id, p_amount, p_transaction_type, p_reference_id, p_metadata)` - Add credits (purchases, bonuses)

## Row Level Security (RLS)

All tables have RLS enabled. Users can only access their own data:

```sql
-- Projects: users see only their own
CREATE POLICY "Users can CRUD own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id);

-- Diagrams: users see own, public diagrams visible to all
CREATE POLICY "Users can CRUD own diagrams"
  ON diagrams FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Public diagrams are viewable"
  ON diagrams FOR SELECT
  USING (is_public = true);

-- Credits: users can only view their own credit data
CREATE POLICY "Users can view own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);
```

## User Credits Auto-Initialization

User credits are automatically initialized via database trigger:

1. **Database trigger**: When a new user signs up, the `on_auth_user_created` trigger automatically creates a credit record with 50 initial credits
2. **On first access**: If the trigger fails or credits don't exist, the `getUserCredits` query function will initialize them on first access
3. **Fallback in queries**: All credit query functions handle missing records gracefully

The trigger is defined in `supabase/migrations/004_ensure_rls_policies.sql`.

## Best Practices

- **Always use query layer**: Never call Supabase directly in actions/components
- **Handle errors**: All query functions throw errors - wrap in try/catch
- **Type safety**: Import types from `@/types/database`
- **Server-only**: Query layer is server-only, use Server Actions for client access
- **Leverage RLS**: Trust RLS policies instead of manual auth checks
- **Use transactions**: For multi-table operations, use database functions

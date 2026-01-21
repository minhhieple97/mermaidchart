# Database Guidelines

## Supabase Setup

This project uses Supabase for authentication and PostgreSQL database.

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

## Type Generation

After schema changes, regenerate types:

```bash
pnpm gen
```

This updates `src/types/database.types.ts` with the latest schema. Then update `src/types/database.ts` if new tables were added.

## User Credits Auto-Initialization

User credits are automatically initialized in two ways:

1. **On signup**: The `signUpAction` calls `initialize_user_credits` after successful registration
2. **Database trigger**: A trigger on `auth.users` auto-creates credits for new users
3. **On first access**: `getUserCreditsAction` initializes credits if they don't exist

## Query Patterns

### Server-side (Server Actions)

```typescript
const supabase = await createClient(); // from @/lib/supabase/server
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .order('updated_at', { ascending: false });
```

### Client-side (React Query)

```typescript
const supabase = createClient(); // from @/lib/supabase/client
const { data, error } = await supabase
  .from('diagrams')
  .select('*')
  .eq('project_id', projectId);
```

## Best Practices

- Always handle errors from Supabase queries
- Use `.single()` when expecting one row
- Use `.select()` to specify columns and reduce payload
- Leverage RLS instead of manual auth checks in queries
- Use transactions for multi-table operations

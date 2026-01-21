# Database Guidelines

## Supabase Setup

This project uses Supabase for authentication and PostgreSQL database.

## Migrations

Migrations are located in `supabase/migrations/`. Run them in order:

```bash
# Apply migrations via Supabase CLI
supabase db push

# Generate TypeScript types after schema changes
pnpm gen
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
```

## Type Generation

After schema changes, regenerate types:

```bash
pnpm gen
```

This updates `src/types/database.types.ts` with the latest schema.

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

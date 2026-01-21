# Testing Guidelines

## Test Framework

- **Runner**: Vitest
- **DOM Testing**: @testing-library/react
- **Assertions**: @testing-library/jest-dom

## Running Tests

```bash
pnpm test        # Run all tests once
pnpm test:watch  # Run tests in watch mode
```

## Test File Location

Place test files next to the code they test:

```
components/
├── button.tsx
└── button.test.tsx

hooks/
├── use-export.ts
└── use-export.test.ts
```

## Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Component onClick={onClick} />);
    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

## What to Test

### Components

- Renders expected content
- Handles user interactions
- Shows correct states (loading, error, empty)
- Accessibility (roles, labels)

### Hooks

- Returns correct initial state
- Updates state correctly
- Handles edge cases

### Utils

- Pure function input/output
- Edge cases and error handling

## Mocking

```typescript
// Mock modules
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// Mock hooks
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));
```

## Test Coverage Focus

Prioritize testing:

1. Server Actions (business logic)
2. Custom hooks (state management)
3. Utility functions (pure logic)
4. Complex component interactions

Skip testing:

- Simple presentational components
- Third-party library wrappers
- Styling/layout

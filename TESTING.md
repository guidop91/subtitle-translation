# Testing Guide

This project uses **Vitest** as the testing framework for both frontend and backend code.

## Installation

All testing dependencies are already installed:

- `vitest` - Test runner
- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - Custom Jest matchers
- `@testing-library/user-event` - User interaction simulation
- `jsdom` - DOM implementation for Node
- `supertest` - HTTP endpoint testing

## Test Scripts

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Project Structure

```
subtitle-translation/
├── src/
│   ├── test/
│   │   └── setup.ts           # Test setup (globals, cleanup)
│   ├── components/
│   │   └── __tests__/
│   │       └── FileUpload.test.tsx
│   └── App.test.tsx
├── routes/
│   └── __tests__/
│       ├── aggregate.test.js
│       └── split.test.js
├── utils/
│   └── __tests__/
│       └── constants.test.js
└── server.test.js
```

## Writing Tests

### Frontend (React Components)

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const mockFn = vi.fn();

    render(<MyComponent onClick={mockFn} />);

    await user.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalled();
  });
});
```

### Backend (Express Routes)

```js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import myRouter from './myRouter.js';

describe('My Router', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(myRouter);
  });

  it('returns success response', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'test' })
      .expect(200);

    expect(response.body.message).toBe('Success');
  });
});
```

### Utility Functions

```js
import { describe, it, expect } from 'vitest';
import { myUtil } from './myUtil.js';

describe('myUtil', () => {
  it('calculates correctly', () => {
    const result = myUtil(2, 2);
    expect(result).toBe(4);
  });
});
```

## Available Matchers

With `@testing-library/jest-dom`, you get custom matchers:

```tsx
// DOM presence
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();

// Visibility
expect(element).toBeVisible();
expect(element).toBeDisabled();

// Content
expect(element).toHaveTextContent('Hello');
expect(element).toHaveAttribute('href', '/home');

// Form elements
expect(input).toHaveValue('text');
expect(checkbox).toBeChecked();
```

## Best Practices

1. **Test user behavior, not implementation**

   ```tsx
   // Good
   expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();

   // Avoid
   expect(container.querySelector('.submit-btn')).toBeInTheDocument();
   ```

2. **Use `await` for async operations**

   ```tsx
   await user.click(button);
   expect(await screen.findByText('Success')).toBeInTheDocument();
   ```

3. **Mock external dependencies**

   ```tsx
   vi.mock('./api', () => ({
     fetchData: vi.fn(() => Promise.resolve({ data: 'mock' })),
   }));
   ```

4. **Clean up after tests**
   - The test setup file handles cleanup automatically
   - Use `beforeEach`/`afterEach` for custom setup/teardown

## Running Individual Tests

```bash
# Run specific test file
npx vitest src/components/FileUpload.test.tsx

# Run tests matching a pattern
npx vitest --grep "FileUpload"

# Run tests in a specific directory
npx vitest routes/
```

## Debugging Tests

```bash
# Run with debug output
npx vitest --debug

# Use console.log (works in Vitest)
console.log('Debug:', variable)

# Use the UI for interactive debugging
npm run test:ui
```

## CI/CD Integration

For CI pipelines:

```bash
npm run test:run
```

For coverage requirements:

```bash
npm run test:coverage
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

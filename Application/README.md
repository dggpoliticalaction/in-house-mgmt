This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Testing

This project uses [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/react) for unit and component testing.

### Running Tests

```bash
# Run tests in watch mode (development)
npm test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage
```

### Writing Tests

Test files should be placed next to the code they test with a `.test.ts` or `.test.tsx` extension.

For unit tests:
```typescript
import { describe, it, expect } from 'vitest';

describe('myFunction', () => {
  it('returns expected value', () => {
    expect(1 + 1).toBe(2);
  });
});
```

For component tests, use the custom render from `test-utils/render.tsx` which includes MantineProvider:

```tsx
<<<<<<< HEAD
import { render, screen } from '../../test-utils/render';
=======
import { render, screen } from '../test-utils/render';
>>>>>>> 058e848 (remove bug fixes and ci run)
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Browser Testing (Future)

Browser tests using Vitest browser mode can be set up when needed:

```bash
# View setup instructions
npm run test:browser:setup

# After setup, browser tests use .browser.test.ts suffix
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

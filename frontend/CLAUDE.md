# Frontend — React + Vite + Tailwind + shadcn/ui

## Tech Stack

- **React 19** with TypeScript (strict mode)
- **Vite** for dev server and bundling
- **Tailwind CSS v4** for styling
- **shadcn/ui** for UI components
- **TanStack Query** for server state management
- **React Router v6** for routing
- **Built-in fetch API** for HTTP requests (NO Axios)

## Key Rules

1. **No Axios** — use the built-in fetch API via `src/api/client.ts`
2. **Server state via TanStack Query** — no Redux/Zustand needed
3. **shadcn/ui components** — add via `npx shadcn@latest add <component>`
4. **Type safety** — strict TypeScript, no `any`

## Commands

```bash
npm run dev              # Dev server — http://localhost:5173
npm run build            # Production build
npm run lint             # ESLint check
npm run preview          # Preview production build
npx playwright test      # E2E tests
```

## Project Structure

```text
src/
├── api/               # fetch wrapper + endpoint functions
├── components/ui/     # shadcn/ui components
├── features/          # Domain-specific components (drones/, missions/, etc.)
├── pages/             # Route-level page components
├── hooks/             # TanStack Query hooks
├── types/             # Shared TypeScript types
└── lib/               # Utilities (cn helper, formatters)
```

## API Client

Use `apiGet`, `apiPost`, `apiPatch`, `apiDelete` from `@/api/client.ts`.
Vite proxy forwards `/api` requests to `http://localhost:3000` in development.

## Adding shadcn/ui Components

```bash
npx shadcn@latest add button table card dialog form input select badge
```

Components are installed to `src/components/ui/` and can be customized directly.

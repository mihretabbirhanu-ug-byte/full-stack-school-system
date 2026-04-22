# Server-only modules

Only import these from:

- Server Components (default in `src/app/*`),
- Route handlers (`src/app/**/route.ts`),
- Middleware (`src/middleware.ts`),
- Server Actions.

Do not import server modules from files marked `"use client"`.


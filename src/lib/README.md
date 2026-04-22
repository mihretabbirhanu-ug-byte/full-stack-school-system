# `src/lib` structure

This project is a Next.js App Router app (server + client in one repo). To keep it maintainable:

- `src/lib/server/*`: server-only utilities (DB, auth, password hashing, server actions).
- `src/lib/client/*`: client-safe utilities (no secrets, no DB, no Node-only APIs).
- `src/lib/auth/*`: shared auth helpers used by server + middleware (Edge).

Compatibility shims exist in `src/lib/*` (e.g. `src/lib/prisma.ts`) so existing imports keep working, but prefer importing from `src/lib/server/*` or `src/lib/client/*` for new code.


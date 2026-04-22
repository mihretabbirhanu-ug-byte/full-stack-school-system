# Mire school management system

## Getting Started

Create a `.env` file (see `.env.example`) and set `DATABASE_URL` and `AUTH_SECRET`.
If you use Neon pooled connections, also set `DIRECT_URL` to Neon’s “Direct connection” string (recommended for `prisma migrate`).

If you run the Prisma seed (`prisma/seed.ts`), the default password for seeded users is `Password123!`.

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

## Learn More

To learn more about Next.js, take a look at the following resources:


- [Next.js](https://nextjs.org/learn)

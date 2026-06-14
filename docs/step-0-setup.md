# Step 0 — Dev Environment Setup

Complete this before any coding. Takes about 1–2 hours.

## 1. Install Node.js

Download LTS from https://nodejs.org  
Verify:
```
node --version   # should be 20.x or 22.x
npm --version
```

## 2. Install VS Code

https://code.visualstudio.com/

Install these extensions:
- **ESLint** — JavaScript/TypeScript linting
- **Prettier** — code formatting
- **Tailwind CSS IntelliSense** — autocomplete for Tailwind classes
- **Thunder Client** — API testing inside VS Code (instead of Postman)
- **GitLens** — git history and blame
- **Prisma** (optional) — if using Prisma ORM later

## 3. Install Git

https://git-scm.com/download/win

```
git --version
git config --global user.name "Arjun"
git config --global user.email "shyamanushya@gmail.com"
```

## 4. Create a Supabase project (free)

Go to https://supabase.com → New project
- Name: apnapin
- Region: **ap-south-1 (Mumbai)** — closest to India, lowest latency for Indian users
- Save the following somewhere safe (password manager or secure note):
  - Project URL
  - Anon key (public)
  - Service role key (private — never expose this in frontend code)
  - Database connection string

## 5. Install Supabase CLI

```
npm install -g supabase
supabase --version
```

Link to your project:
```
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

## 6. Set up project folder

```
mkdir C:\Projects\apnapin
cd C:\Projects\apnapin
```

Copy the CLAUDE.md and docs/ folder here.

## 7. Create Next.js project

```
cd C:\Projects\apnapin
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
```

This creates the Next.js 14 App Router project with TypeScript and Tailwind pre-configured.

## 8. Install key dependencies

```
npm install @supabase/supabase-js @supabase/ssr
npm install -D supabase
```

## 9. Set up environment variables

Create `.env.local` in the project root:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Never commit `.env.local` to git.** It is already in `.gitignore` by default.

## 10. Open in Claude Code

```
cd C:\Projects\apnapin
claude
```

Claude Code will read CLAUDE.md automatically and have full context.

---

## Done when

- `node --version` works (20.x or 22.x)
- VS Code opens with ESLint + Prettier active
- Supabase project created, connection string + keys saved
- `C:\Projects\apnapin\` folder exists with CLAUDE.md inside
- Next.js project created (`npm run dev` opens localhost:3000)
- `.env.local` configured with Supabase credentials

---

## Next step after this

→ `step-1-lgd-data.md` — download and inspect LGD data, understand the schema, write the ingestion script

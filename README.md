# Heroes Of Unemployment
A gamified internship tracker for CS students. Internship listings are pulled from two community-maintained GitHub repos, and applying to them earns you XP, levels, and achievement badges. Built for CEN3031 as a group project.

Live theme is RPG / fantasy flavored: you pick up "quests" on the quest board, climb tiers (Rookie, Squire, Knight, Hero, Legend), and show off in the Hall of Heroes.

## Team

| Member | Role |
| --- | --- |
| Andrew Cutshall | Product Owner, Full Stack |
| Liam Gale | Scrum Master, Full Stack |
| Manas Vudugula | Full Stack |

Roadmap on Trello: https://trello.com/b/78EBVSLC/heroes-of-unemployment-roadmap-workload

## What the app does

**For students:**
* Browse ~3,700 internship postings pulled from the SimplifyJobs and vanshb03 Summer 2026 trackers.
* Filter by company, role, location, source, and category. Sort by newest or by deadline.
* Hit "Accept Quest" when you apply. You get XP, a base 10 points, plus bonuses for first-of-company and daily streaks.
* Watch your character level up, earn badges (First Steps, Grind Mode, Hero Ascended, Early Bird and more), and climb the leaderboard.
* Export your application history as a CSV from the profile page.
* Edit your character sheet (school, major, graduation year, bio, website, Twitter) for a completion bonus.

**For admins:**
* Analytics dashboard with applications per day, top companies, cumulative user growth, and level distribution.
* Category management, create, rename, recolor, delete.
* Per-internship deadline editor.

**Gamification under the hood:**
* Quadratic XP curve: `xpForLevel(n) = 50 * n * (n-1)`. Level 2 needs 100 XP, level 10 needs 4,500, level 20 needs 19,000.
* Tier ranges: 1-4 Rookie, 5-9 Squire, 10-19 Knight, 20-29 Hero, 30+ Legend.
* 8 seeded badges, each with its own XP reward. First badge earned also triggers a one-time 50 XP "first badge" bonus.
* XP gain, level up, and badge unlocks all fire toast notifications via sonner, with a confetti animation on level ups.

## Tech stack

* **Next.js 15** with the App Router and Turbopack
* **tRPC 11** for typed client/server calls
* **Prisma** on **SQLite** (local dev file)
* **NextAuth v5** (credentials, JWT sessions)
* **Tailwind v4** for styling
* **Zod** for input validation
* **Vitest** for unit tests
* **Biome** for lint and format
* **Sonner** for toast notifications
* **MedievalSharp** and **Press Start 2P** fonts for the RPG theme

Source lives in `heroes_of_unemployment/`.

## Getting it running locally

Requirements: Node 20+ (18 might work, we test on 20), npm, Git.

```bash
cd heroes_of_unemployment
npm install
cp .env.example .env
```

Open `.env` and set `AUTH_SECRET`. Generate a random one with:

```bash
npx auth secret
```

Then set up the database and seed it:

```bash
npx prisma db push
npm run db:seed
```

The seed fetches internship data from the two source repos and takes about a minute. It also upserts the 8 achievement badges.

Create an admin user so you can hit the `/admin` routes:

```bash
npm run seed:admin -- admin@example.com Pass1234 Admin
```

Start the dev server:

```bash
npm run dev
```

Open http://localhost:3001. The dev server uses port 3001, not the usual 3000.

## Creating regular users

Either register through the UI at `/register`, or insert one directly with Prisma Studio:

```bash
npm run db:studio
```

If you go the Prisma Studio route, passwords need to be bcrypt-hashed. Quick one-liner:

```bash
node -e "console.log(require('bcryptjs').hashSync('YourPassword', 10))"
```

Paste the output into the `password` column.

## Project layout

```
heroes_of_unemployment/
├── prisma/
│   ├── schema.prisma         Prisma models (User, Internship, Badge, UserBadge, Category, ...)
│   ├── seed.ts               Fetches internships + seeds badges
│   ├── seed-admin.ts         Creates or updates an admin user
│   └── seed-badges.ts        Seeds badges only (faster re-seed)
├── src/
│   ├── app/
│   │   ├── page.tsx          Quest board (home)
│   │   ├── login, register   Auth pages
│   │   ├── profile, edit     Character sheet + edit form
│   │   ├── leaderboard       Hall of Heroes
│   │   ├── admin/            Admin-only dashboard, categories, internships
│   │   ├── api/
│   │   │   ├── auth/         NextAuth handler
│   │   │   ├── trpc/         tRPC handler
│   │   │   └── applications/export   CSV export
│   │   └── _components/      All React components
│   ├── server/
│   │   ├── api/
│   │   │   ├── trpc.ts       Public / protected / admin procedures
│   │   │   ├── root.ts       Router composition
│   │   │   └── routers/      application, user, internship, category, analytics
│   │   ├── auth/config.ts    NextAuth configuration
│   │   ├── db.ts             Prisma client singleton
│   │   └── lib/
│   │       ├── leveling.ts   XP curve, tiers, helpers (pure)
│   │       ├── badges.ts     Badge definitions + evaluation (pure)
│   │       ├── csv.ts        CSV escaping helper
│   │       ├── parse-internships.ts   Markdown scraper
│   │       ├── validators.ts Zod schemas
│   │       └── __tests__/    Vitest unit tests
│   └── styles/globals.css    Tailwind + RPG theme (fonts, panels, XP gauge, ...)
└── package.json
```

## Useful scripts

Run from inside `heroes_of_unemployment/`:

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 3001, Turbopack |
| `npm run build` | Production build |
| `npm run preview` | Build then start |
| `npm run start` | Start a built app |
| `npm run test` | Vitest, runs once |
| `npm run test:watch` | Vitest, watch mode |
| `npm run typecheck` | `tsc --noEmit`, no emitted files |
| `npm run check` | Biome lint + format check |
| `npm run check:write` | Biome, auto-fix |
| `npm run db:push` | Push schema to SQLite without a migration |
| `npm run db:migrate` | Apply migrations (production) |
| `npm run db:generate` | `prisma migrate dev` |
| `npm run db:studio` | Open Prisma Studio at :5555 |
| `npm run db:seed` | Full seed: internships + badges |
| `npm run seed:admin` | Create or update an admin user |
| `npm run seed:badges` | Badges only, no internships |

## Testing

The app has Vitest unit tests covering the pure bits:

* `leveling.test.ts`: XP curve, tier boundaries, streak bonus
* `badges.test.ts`: badge evaluation logic
* `csv.test.ts`: CSV escaping edge cases (quotes, commas, newlines)
* `parse-internships.test.ts`: markdown parser

Run them with `npm run test`. There's also a GitHub Actions workflow at `.github/workflows/ci.yml` that runs `prisma generate`, Biome, and Vitest on every push.

## Clicking through the features

Once the dev server is up:

1. Register a new account at `/register`, or sign in as the admin you seeded.
2. Land on `/` and hit "Accept Quest" on a few listings. Watch the XP bar fill up in the nav and the "First Steps" badge toast appear.
3. Visit `/profile` to see your character sheet, tier, XP progress, and locked or unlocked badges.
4. Edit your profile at `/profile/edit`. Filling in bio, school, major, and graduation year awards the "Full Sheet" badge.
5. Download your applications as a CSV from the profile page (`📥 Export Ledger`).
6. Check `/leaderboard` for the Hall of Heroes ranking.
7. As an admin, open `/admin` for analytics, `/admin/categories` to create categories, and `/admin/internships` to set deadlines.

## Data sources

Internship listings come from these community trackers. All credit goes to them.

* https://github.com/SimplifyJobs/Summer2026-Internships
* https://github.com/vanshb03/Summer2026-Internships

## Notes

This is a school project. Security features like rate limiting, password reset, email verification, and strong session hardening are out of scope. Don't deploy this to production without doing that work first.

SQLite is used so the whole thing runs with zero external dependencies. The `dev.db` file lives inside `heroes_of_unemployment/prisma/` and is gitignored.

Ctrl+C in the terminal to stop the dev server.
Useful scripts are located in `Heroes-Of-Unemployment/heroes_of_unemployment/package.json`
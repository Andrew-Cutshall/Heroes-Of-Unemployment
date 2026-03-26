# Heroes Of Unemployment
GitHub page for CEN3031 Group Project.

## Members and Roles
- Andrew Cutshall | Product Owner & Full Stack Developer
- Liam Gale       | Scrum Master & Full Stack Developer
- Manas Vudugula  | Full Stack Developer

## Trello Roadmap
https://trello.com/b/78EBVSLC/heroes-of-unemployment-roadmap-workload

## How to Run (local development)
This project is a T3 Stack app located in the `heroes_of_unemployment` folder. The app uses Next.js, NextAuth, Prisma, Tailwind, and tRPC.

Prerequisites
- Node (v18+ recommended, and important)
- npm
- Git

Quick start
1. Change into the project folder and install dependencies:

```powershell
cd heroes_of_unemployment
npm install
```

2. Create an environment file and populate secrets:

```powershell
cp .env.example .env
# Edit `.env` and set values such as AUTH_SECRET and provider secrets
#npx auth secret in powershell can generate a random string for AUTH_SECRET
```

Database / Prisma
- Generate/apply migrations (local development):

```powershell
npm run db:generate   # prisma migrate dev
npm run db:push       # push schema to DB
npm run db:migrate    # prisma migrate deploy (production)
```

- Open Prisma Studio:

```powershell
npm run db:studio
```

- Seed the DB (if available):

```powershell
npm run db:seed
```

Creating a hashed password
- To create a bcrypt-hashed password for a user (store this value in the `password` field):

```powershell
# from the project folder `heroes_of_unemployment`
node -e "console.log(require('bcryptjs').hashSync('YourPlainPasswordHere', 10))"
```

- Copy the output (the password hash) and add it to the user's `password` field using Prisma Studio:

```powershell
npm run db:studio
# open the user record and paste the hash into `password`
```

Note: `bcryptjs` is included in `heroes_of_unemployment/package.json`; run `npm install` first if you haven't.
Second Note: This is needed to manually create the first admin user, since there is no way to do that through the app.

Run the app
- Development (default port 3001):

```powershell
npm run dev
# open http://localhost:3001
```
Note: Ctr+C in powershell to stop the dev server, or the db server.

- Build and preview:

```powershell
npm run build
npm run preview
```

Useful scripts are located in `Heroes-Of-Unemployment/heroes_of_unemployment/package.json`
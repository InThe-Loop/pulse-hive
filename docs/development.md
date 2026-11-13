# Local development

## Prerequisites

- Docker Desktop or Docker Engine with Docker Compose for the full local stack
- Node.js and pnpm for the web apps and Nest services
- Node.js/npm and Expo tooling for `apps/mobi`

There is no root `package.json` or shared workspace. Install dependencies and run scripts from the package directory you are changing.

## Run the Compose stack

Copy `.env.example` to `.env`, replace the local placeholders as needed, then start the services:

```bash
cp .env.example .env
docker compose up --build
```

For live source synchronization, use `docker compose up --build --watch`. Service ports and Compose limitations are documented in [Docker and orchestration](docker.md).

## Run a component directly

From the relevant app/service folder:

```bash
pnpm install
pnpm run start:dev
```

For the Next.js apps, use `pnpm dev`; production checks can use `pnpm build`. The mobile app uses npm and Expo:

```bash
cd apps/mobi
npm install
npm start
```

Set service URLs to the actual addresses reachable from that process. A host process normally uses `localhost`; a container uses Compose service names. Avoid sending internal service keys to frontend/browser code.

## Database workflow

The canonical Prisma schema and migrations live under `services/db`:

```bash
cd services/db
pnpm install
pnpm prisma:generate
pnpm prisma:migrate:dev
```

The DB package also provides `pnpm prisma:migrate` for applying checked-in migrations, `pnpm prisma:studio`, `pnpm prisma:seed`, and `pnpm products:import:glowavee`. Review seed/import scripts and target database before running them.

Compose runs the DB service's migration deploy command on startup. PostgreSQL's `postgres_data` volume persists across ordinary `docker compose down` operations. Migration and model details are in [Data model and authorization](data-model.md).

## Tests and checks

Use scripts declared by the component's own `package.json`. Current web/admin scripts include build and lint; Nest services declare build/start scripts. The repository has selected service test folders, but it does not define a root test command or a unified CI test matrix.

For documentation-only changes, check Markdown links and run `git diff --check`. For code changes, build/test the affected package and any dependent service/application integration.

## Troubleshooting

- **Missing Compose values:** Compose reads `.env`, not `.env.example`; create the `.env` copy first.
- **Database connection failures:** Inside a container, `DATABASE_URL` should use hostname `postgres`, and its credentials/database must match the Postgres environment.
- **Browser-to-container API failures:** Browser code runs outside the Compose network; it should use published host addresses such as `http://localhost:4000`, while server-side container calls use Compose names.
- **Ozow checkout is not configured in Compose:** The current Compose `web` service does not pass Ozow credentials; see [Docker and orchestration](docker.md).
- **Mobile API errors:** The app remains a demo whose auth and payment calls do not match all current service routes; see [Applications](apps.md).

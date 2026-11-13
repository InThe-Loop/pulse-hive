# Docker and local orchestration

The root `docker-compose.yml` is a development stack definition, not a production deployment specification. It creates the `pulsehive-mesh` bridge network and named volumes for PostgreSQL and RabbitMQ.

## Compose services

| Compose service | Host port | Container/build context | Readiness/start behavior |
| --- | ---: | --- | --- |
| `postgres` | 5432 | `postgres:16-alpine` | `pg_isready` health check; mounts `services/db/config/init.sql` for first initialization |
| `rabbitmq` | 5672, 15672 | `rabbitmq:3-management-alpine` | `rabbitmq-diagnostics ping` health check |
| `db` | 4003 | `services/db` | Waits for healthy PostgreSQL; runs `start:railway` (deploy migrations, then production start) |
| `auth` | 4001 | `services/auth` | Waits for PostgreSQL to be healthy; Compose overrides command to `start:dev` |
| `orders` | 4002 | Repository root with `services/orders/Dockerfile` | Waits for healthy PostgreSQL and healthy Events; Compose runs `start:dev` |
| `events` | 5000 | `services/events` | Waits for healthy RabbitMQ; has an HTTP `/health` check |
| `api` | 4000 | `services/api` | Waits for Auth and Orders to start; uses the Dockerfile production command |
| `web` | 3000 | `apps/web` | Waits for API to start; Compose runs Next.js development server |
| `admin` | 3001 | `apps/admin` | Waits for API to start; Compose runs Next.js development server |

Compose publishes PostgreSQL, RabbitMQ and service ports to the host. Internal callers should use service names such as `http://db:4003`, not `localhost` from inside another container.

Only PostgreSQL and RabbitMQ have named persistent volumes (`postgres_data`, `rabbitmq_data`). `docker compose down` stops and removes containers/network but preserves named volumes. `docker compose down -v` also removes the database and broker data; use that only when intentionally resetting local state.

## Start, watch and stop

```bash
cp .env.example .env
docker compose up --build
```

The Compose file defines `develop.watch` synchronization rules. To activate watch mode with a Docker Compose version that supports it:

```bash
docker compose up --build --watch
```

Stop with `Ctrl+C`, or from another terminal run `docker compose down`.

## Dockerfiles

Each component has a separate Dockerfile:

- `services/api/Dockerfile`: Node 22 Alpine builder and runtime stages; installs with the lockfile, compiles Nest, and starts the compiled gateway.
- `services/auth/Dockerfile`: Node 22 Alpine; installs from the Auth lockfile, compiles and starts production Auth.
- `services/orders/Dockerfile`: Node 22 Alpine with OpenSSL; uses the repository root as its build context, installs Orders dependencies, copies the canonical DB Prisma schema, generates Prisma Client and compiles.
- `services/db/Dockerfile`: Node 22 Alpine with OpenSSL; installs DB dependencies, generates Prisma Client, builds, then runs the migration-and-start script.
- `services/events/Dockerfile`: Node 22 Alpine; builds and starts the Events service.
- `apps/web/Dockerfile`: Node 22 Alpine; builds the storefront and provides a production Next.js start command. Compose overrides it to development mode.
- `apps/admin/Dockerfile`: Node 22 Alpine; installs dependencies and starts the Next.js development server.
- `apps/mobi/Dockerfile`: Node 20 Alpine with npm; intended to start Expo and expose ports 19000–19002. It is not referenced by root Compose, and currently expects a `package-lock.json` that is absent from `apps/mobi/`.

`docker-compose.yml` also defines development sync/rebuild watches for the API, Auth, Orders, DB, Web and Admin services. Events has no `develop.watch` section.

## Environment variables

Compose substitutes values from the shell or the root `.env` file. `.env.example` lists local sample values. The Compose file passes these values into services:

| Variable | Used by | Notes |
| --- | --- | --- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | PostgreSQL, DB URL, health check | Keep the user/password/database consistent with `DATABASE_URL` |
| `DATABASE_URL` | DB and Orders | Use `postgres` as the hostname inside Compose |
| `RABBITMQ_DEFAULT_USER`, `RABBITMQ_DEFAULT_PASS`, `RABBITMQ_URL` | RabbitMQ, Events, Orders | URL must match broker credentials |
| `INTERNAL_SERVICE_KEY` | API, Auth, DB, Orders, Web | Shared internal-service credential; use a strong private value |
| `JWT_SECRET` | API and Auth | Business-user bearer-token signing/validation secret |
| `CUSTOMER_JWT_SECRET`, `CUSTOMER_OTP_SECRET` | Auth | Customer token and OTP secrets |
| `PULSEHIVE_AUTH_SERVICE_URL`, `PULSEHIVE_ORDERS_SERVICE_URL`, `PULSEHIVE_DB_SERVICE_URL`, `PULSEHIVE_EVENTS_SERVICE_URL` | API/Web/Auth | Internal service discovery addresses |
| `PULSEHIVE_TENANT_CODE` | Web | Tenant whose storefront catalogue/checkout is served |
| `NODE_ENV` | API and applications | Development value in the sample configuration |
| `API_PORT`, `ALLOWED_ORIGINS` | API gateway | `API_PORT` is mapped to the gateway's `PORT` |
| `RESEND_API_KEY`, `ADMIN_APP_URL`, `EMAIL_FROM` | Auth | Email verification and invitation URL/configuration |
| `CHOKIDAR_USEPOLLING`, `WATCHPACK_POLLING` | Web/Admin | File watching in container development |

`apps/web` checkout also reads `OZOW_SITE_CODE`, `OZOW_PRIVATE_KEY`, `OZOW_API_KEY`, `OZOW_IS_TEST` and `NEXT_PUBLIC_APP_URL`. These are **not currently included in the Compose `web.environment` list**, so setting them only in `.env` is not enough to make them available to that container. Add the required variables to the Compose service before testing checkout through Docker. Do not commit real credentials.

For running the browser apps outside Compose, the Admin API client uses `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`); the storefront customer-auth client uses `NEXT_PUBLIC_CUSTOMER_AUTH_URL` (default `http://localhost:4001`). These are optional local frontend settings and are not passed by the current Compose services.

Auth's bootstrap reads `CORS_ORIGINS`, while the gateway reads `ALLOWED_ORIGINS`. Compose currently passes only `ALLOWED_ORIGINS` to the gateway and does not pass `CORS_ORIGINS` to Auth; Auth therefore uses its built-in localhost:3000 defaults.

## Root `.dockerignore`

The root ignore file excludes VCS/IDE files, local environment files, node_modules, build output, Compose/Docker files and README/license files from Docker build contexts. Service contexts and app contexts are independently rooted, except Orders, which deliberately builds from the repository root to access the DB schema.

Before deploying, replace local secrets, restrict allowed origins, configure payment/email providers, review port exposure and health/dependency checks, and define production image tags, data backups, TLS and secret management. These production controls are not supplied by this Compose file.

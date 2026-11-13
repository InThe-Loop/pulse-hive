# PulseHive

PulseHive is a multi-tenant commerce and operations platform. The repository currently contains a customer storefront, a business admin portal, an Expo mobile prototype, and backend services for API routing, authentication, orders, persistence, and payment events.

This root README is the main project overview. The detailed, code-based documentation is in [`docs/`](docs/architecture.md).

## Repository map

| Path | Responsibility |
| --- | --- |
| [`apps/web/`](docs/apps.md) | Next.js customer storefront, product catalogue, checkout and Ozow integration |
| [`apps/admin/`](docs/apps.md) | Next.js tenant administration, dashboard, orders, payments and reconciliation |
| [`apps/mobi/`](docs/apps.md) | Expo / React Native mobile demonstration app |
| [`services/api/`](docs/services.md) | HTTP gateway, JWT validation and tenant-scoped routing |
| [`services/auth/`](docs/services.md) | Business-user authentication, invitations, email verification and customer OTP |
| [`services/orders/`](docs/services.md) | Order and payment queries, checkout persistence and fulfilment lifecycle |
| [`services/db/`](docs/data-model.md) | PostgreSQL/Prisma persistence, tenant access, identity, customer and product APIs |
| [`services/events/`](docs/services.md) | RabbitMQ event publisher |
| [`docker-compose.yml`](docs/docker.md) | Local development stack for infrastructure, services and web apps |

## Quick start

Requirements: Docker with Docker Compose, and a root `.env` file based on [`.env.example`](.env.example). Replace placeholder secrets before using any non-local environment.

```bash
cp .env.example .env
docker compose up --build
```

The Compose stack publishes:

| Component | Local address |
| --- | --- |
| Storefront | http://localhost:3000 |
| Admin portal | http://localhost:3001 |
| API gateway | http://localhost:4000 |
| Auth service | http://localhost:4001 |
| Orders service | http://localhost:4002 |
| Database service | http://localhost:4003 |
| Events service | http://localhost:5000 |
| PostgreSQL | `localhost:5432` |
| RabbitMQ AMQP / management | `localhost:5672` / http://localhost:15672 |

Compose starts the web applications and several services in development mode. Source watch is enabled separately with `docker compose up --build --watch`. The stack does not include the mobile app. See [Docker and local orchestration](docs/docker.md) for startup behavior, environment variables, ports, volumes and the individual Dockerfiles.

## Documentation

- [Architecture and request/event flows](docs/architecture.md)
- [Applications: storefront, admin and mobile](docs/apps.md)
- [Backend services and HTTP routes](docs/services.md)
- [Data model, access control and migrations](docs/data-model.md)
- [Docker, Compose and container builds](docs/docker.md)
- [Local development and validation](docs/development.md)
- [Implemented behavior and known gaps](docs/implementation.md)
- [Roadmap](docs/roadmap.md)

## Current integration notes

- PostgreSQL/Prisma is the persistence layer; `services/db/prisma/schema.prisma` is the canonical schema.
- Ozow notification callbacks are verified by the storefront server route and forwarded through RabbitMQ events to the Orders consumer.
- The legacy Expo app is a demo and its API expectations do not fully match the current gateway/service contracts.
- The Compose file does not currently pass Ozow credentials into the storefront container. Configure the integration explicitly before expecting checkout payments to work in Compose.
- Capitec integration, a production mobile release, and other not-yet-built work are not described as implemented features.


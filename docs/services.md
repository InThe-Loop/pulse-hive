# Backend services

All backend services are separate NestJS applications. The gateway is the intended browser-facing HTTP entry point; service endpoints and internal headers should not be exposed as public client contracts.

## API gateway — `services/api`

Fastify-based Nest application on port 4000. It accepts GET, POST, PUT, PATCH and DELETE requests and forwards them according to their first path segment:

| Path prefix | Destination |
| --- | --- |
| `/auth` | Auth service |
| `/orders` | Orders service |
| `/payments` | Orders service payments controller |
| `/tenants`, `/users`, `/products` | DB service |

The gateway validates bearer JWTs for protected requests, injects the internal service key, and overwrites identity headers with verified user identity. It authorizes tenant-scoped order reads (`orders.read`), payment reads (`payments.read`) and fulfilment writes (`orders.manage`) through the DB service. A missing tenant selection, invalid token, denied permission or unavailable downstream is returned as an HTTP error rather than silently forwarded.

Public gateway auth operations are `POST /auth/signup`, `POST /auth/signin`, `POST /auth/email/verify`, and `POST /auth/email/resend`. All other gateway requests require a bearer token. Gateway configuration includes `AUTH_SERVICE_URL`, `ORDER_SERVICE_URL`, `DB_SERVICE_URL`, `JWT_SECRET`, `INTERNAL_SERVICE_KEY`, `PORT` and `ALLOWED_ORIGINS`.

## Auth — `services/auth`

Nest/Express service on port 4001. It provides business-user signup/signin/signout, profile management, email verification, memberships and invitations. Authentication uses bcrypt and JWT/passport strategies. Customer authentication is separate: request/verify OTP, customer JWT identity, and tenant-specific customer profile read/update. SMS delivery is development-only: the current provider logs OTP values in development and throws in production until a real SMS provider is configured.

Business-user persistence, tenant memberships and invitation/verification records are delegated to the DB service using its internal service key. Email configuration uses `RESEND_API_KEY`, `EMAIL_FROM` and `ADMIN_APP_URL`. Relevant secrets include `JWT_SECRET`, `CUSTOMER_JWT_SECRET` and `CUSTOMER_OTP_SECRET`; configure unique values outside local development.

Business-user routes include `GET /auth/health`; `POST /auth/signup`, `/auth/signin`, `/auth/signout`, `/auth/onboard`, `/auth/email/verify`, `/auth/email/resend`, `/auth/invitations`, `/auth/invitations/accept`, and `/auth/invitations/:id/revoke`; `GET` and `PATCH /auth/profile`; `GET /auth/memberships`; and tenant member/invitation list routes under `/auth/tenants/:tenantId/`. Customer routes are `POST /customer/auth/request-otp`, `POST /customer/auth/verify-otp`, `GET /customer/auth/me`, and `GET`/`PATCH /customer/profile`.

## Orders — `services/orders`

Nest/Fastify service on port 4002. All order and payment controllers use the internal-service guard.

| Method and route | Behavior |
| --- | --- |
| `GET /health` | Service health |
| `GET /orders` | Tenant-scoped orders with related payments/fulfilment |
| `POST /orders` | Create pending Ozow checkout order and payment |
| `PATCH /orders/:orderId/payment-request` | Store payment request metadata |
| `PATCH /orders/:orderId/fulfilment` | Update tenant-scoped fulfilment with an audit history |
| `GET /payments` | Tenant-scoped payment listing |

Order creation requires a tenant, customer and shipping details, product IDs, transaction reference, UUID idempotency key and Ozow provider. It re-reads active products owned by that tenant, calculates totals from database prices using integer cents, checks submitted totals, and creates the order and pending payment in a database transaction. It rejects unsupported providers and invalid or changed product prices.

Fulfilment updates use explicit lifecycle transitions, preserve delivery metadata, timestamp milestones and record an actor/history entry transactionally. Payment event handling subscribes to `payment.completed` and `payment.status_updated`.

The current payments controller is a read endpoint. The old project description's separate payments service and payment matching/write API are not present in this repository's current service layout.

## DB service — `services/db`

Internal Nest/Fastify API on port 4003, backed by PostgreSQL and Prisma. It owns tenant, product, business identity, membership/invitation, customer identity/profile and OTP challenge persistence. It provides health checks, tenant onboarding/lookup, product catalogue queries, identity operations and the guarded tenant-access API. See [Data model and authorization](data-model.md) for entities and constraints.

Important route groups:

- `GET /health`
- `GET /products/tenant/:tenantCode` with optional `section`, `limit`, `cursor` and `search`
- `POST /tenants/onboard`; `GET /tenants/code/:tenantCode`
- `/users/*`: `POST /users`, `GET /users/by-email`, `GET /users/:id`, `PATCH /users/:id/profile`, and email-verification-token issue/verify routes
- `/customers/*`: OTP challenge create/verify and tenant customer profile get/upsert routes
- `/internal/access/*`: membership list and authorization; invitation create/accept/revoke/list; tenant member list; and membership role/status changes

Internal controllers use the `INTERNAL_SERVICE_KEY` guard. The public tenant-code lookup is not protected by that controller guard; do not treat it as a place to expose sensitive tenant data.

`services/db/prisma/schema.prisma` is the canonical Prisma model and migration source. `services/orders/Dockerfile` copies this schema to generate the Orders Prisma client.

## Events — `services/events`

Nest/Fastify service on port 5000. `GET /health` reports service health. `POST /events/publish` accepts a typed domain event and returns HTTP 202 after publishing.

Events uses RabbitMQ's durable topic exchange `pulsehive.events`, persistent JSON messages, message IDs and publisher confirms. The event envelope contains `eventId`, `eventType`, `version`, `occurredAt` and `data`. It reconnects with capped exponential backoff if RabbitMQ disconnects. The currently documented payment event names are `payment.completed` and `payment.status_updated`.

## API boundaries and known limitations

- The `/payments` gateway prefix maps to Orders, not an independent Payments service.
- The gateway mapping has no `/customer` prefix; storefront customer authentication calls the Auth service address directly.
- The gateway mapping has no `/events` prefix; payment notification publishing calls the Events service directly from the storefront server route.
- The mobile demo's payment write/matching helpers are not implemented by the current Orders payment controller.
- There is no root workspace manifest; install and run each app/service from its own directory.

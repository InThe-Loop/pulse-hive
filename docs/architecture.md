# Architecture

PulseHive is a multi-application, service-oriented repository. The system combines a customer storefront and an administrative portal with separately deployed NestJS services, PostgreSQL, and RabbitMQ.

## Components

| Component | Role | Local port |
| --- | --- | ---: |
| `apps/web` | Customer storefront and server-side storefront API routes | 3000 |
| `apps/admin` | Tenant-facing administration portal | 3001 |
| `apps/mobi` | Expo / React Native operations demo; not part of Compose | Expo defaults |
| `services/api` | HTTP gateway, bearer-token checks and tenant authorization | 4000 |
| `services/auth` | Business-user and customer authentication | 4001 |
| `services/orders` | Orders, associated payments and fulfilment | 4002 |
| `services/db` | Internal API over PostgreSQL/Prisma data | 4003 |
| `services/events` | Domain event publisher backed by RabbitMQ | 5000 |
| PostgreSQL | Relational persistence | 5432 |
| RabbitMQ | Durable topic exchange and queues | 5672; management UI 15672 |

`docker-compose.yml` puts these components on the `pulsehive-mesh` bridge network. Containers use Compose service names for internal addresses; browser clients use the published `localhost` ports.

## Synchronous request paths

### Admin requests

The admin portal calls the API gateway (default browser URL `http://localhost:4000`). The gateway routes `/auth/*` to Auth, `/orders/*` to Orders, `/payments/*` to the Orders service's payments controller, and `/tenants/*`, `/users/*`, and `/products/*` to the DB service.

For authenticated requests, the gateway validates the bearer JWT, discards client-supplied identity/internal-service headers, and injects trusted internal headers. The gateway also asks the DB service to authorize the selected tenant for order listing, payment listing, and fulfilment updates. The verified `x-tenant-id` is forwarded only after authorization succeeds.

Only signup, signin, email verification, and verification-email resend are public auth routes through the gateway. Other gateway requests require a valid bearer token.

### Storefront requests

- The storefront's `/api/products` route reads `PULSEHIVE_TENANT_CODE`, calls the DB service's tenant catalogue endpoint, and sends the internal service key.
- The checkout server route verifies configuration and request data, resolves the tenant and catalogue products, creates the pending order/payment with Orders, then requests a payment URL from Ozow.
- Customer profile/OTP requests are handled by Auth's customer endpoints. The storefront's customer-auth API base is configured with `NEXT_PUBLIC_CUSTOMER_AUTH_URL` (default `http://localhost:4001`).

The storefront-to-service calls are server-side where they carry the internal key. Do not expose internal service credentials to browser code.

## Payment event path

1. Ozow sends a notification to the storefront's `/api/checkout/ozow/notify` route.
2. The route validates the configured site code, required fields, amount/currency formats, test mode and Ozow SHA-512 notification hash.
3. It resolves the tenant from the transaction reference and publishes `payment.completed` or `payment.status_updated` to the Events service.
4. Events publishes persistent messages to RabbitMQ's durable `pulsehive.events` topic exchange and waits for publisher confirmation.
5. Orders consumes those event types from `pulsehive.orders` and updates the related payment/order state.

Only a `Complete` Ozow status becomes `payment.completed`. Other recognized statuses are published as `payment.status_updated`; they must not be interpreted as a successful payment.

## Trust boundaries

- The gateway validates business-user JWTs and creates trusted user/tenant context.
- Internal service endpoints require `INTERNAL_SERVICE_KEY`; access authorization uses the separate internal access guard.
- Customer identities use a customer JWT path distinct from the admin/business-user JWT.
- The database is accessed through the DB service by the gateway and other services. Orders also uses Prisma for domain writes and reads.
- The Orders HTTP controllers are guarded by the internal service key; the gateway is the intended public entry point for admin traffic.

See [Services and HTTP routes](services.md), [Data model and authorization](data-model.md), and [Docker and Compose](docker.md) for implementation details.

# Implementation status

This is a snapshot of behavior found in the repository. It distinguishes working application/service code from prototype or future work; it is not a release-readiness certification.

## Applications

### Storefront (`apps/web`)

- Product storefront pages and tenant-selected catalogue requests.
- Product/category filtering support through the DB service API.
- Cart and checkout UI with customer/shipping details, idempotency key and server-side Ozow payment initiation.
- Ozow notification route validates request fields and notification hash before publishing a domain event.
- Customer account pages and customer OTP/profile integration with Auth.
- Informational, policy, account, cart, order and checkout pages.

Ozow functionality requires credentials and URL configuration. The root Compose `web` service currently does not pass the Ozow environment variables to its container.

### Admin (`apps/admin`)

- Business-user auth, onboarding, email verification/invitation routes and workspace selection UI.
- Order-derived dashboard metrics, analytics and recent activity.
- Tenant-scoped order, payment and reconciliation screens.
- Profile, team, notifications, billing, support and public information routes.
- API client attaches saved bearer token and selected tenant context to applicable requests.

Backend-backed features depend on the corresponding gateway routes, tenant membership and configured email provider.

### Mobile (`apps/mobi`)

- Expo demo entry screen and tab navigation for dashboard, orders, payments and reconciliation.
- API helper functions exist, but the login screen is demo-only and API calls are not fully aligned with current server authorization and payment endpoints.
- Not included in the root Compose stack.

## Services and infrastructure

- **API:** Nest/Fastify reverse proxy with bearer JWT verification, internal identity header handling, tenant authorization for key list/update operations, and mapped Auth/Orders/DB service paths.
- **Auth:** Business-user credentials/JWT, profile, membership, invitations, email verification, and separate customer OTP/JWT/profile flows.
- **Orders:** Tenant-aware order/payment queries; pending Ozow checkout creation with server-verified catalogue prices, transaction/idempotency validation, and fulfilment history/state transitions.
- **DB:** Prisma-backed tenant, user, membership, invitation, customer, catalogue and access-control operations.
- **Events:** RabbitMQ durable topic publishing with publisher confirmation and connection recovery.
- **Payment event path:** verified Ozow notification → Events service → RabbitMQ → Orders consumer, for completed and non-completed status updates.
- **Compose:** local PostgreSQL, RabbitMQ, services and two web apps; only PostgreSQL and RabbitMQ have persistent named volumes.

The customer SMS provider is not production-ready: in development it logs the OTP, and in production it throws until an SMS provider is configured.

## Not implemented or not established by this repository

- A dedicated Payments service, payment matching/write API, or full bank transaction feed. The `/payments` gateway prefix currently maps to the Orders service's payment listing endpoint.
- Capitec Business OAuth, webhooks, balance synchronization or bank transaction matching.
- A production-ready mobile authentication/data flow, offline synchronization, or app-store release.
- Production deployment manifests, release automation, a root test command or a unified CI test matrix.
- Production operational configuration such as secret management, TLS termination, backup/restore procedures, monitoring and deployment-specific hardening.

See [Applications](apps.md), [Backend services](services.md) and [Docker](docker.md) for implementation boundaries and configuration.

# Data model, persistence and access

## Persistence boundary

PostgreSQL 16 is the relational store. Prisma schema and checked-in migrations live in `services/db/prisma/`. The DB service exposes internal APIs for data access and access control. Orders has a generated Prisma client for order/payment domain operations; its container build takes the canonical schema from the DB service.

`services/db/config/init.sql` is mounted into PostgreSQL's initialization directory. It runs only when PostgreSQL initializes an empty data directory. Later schema changes are applied through Prisma migrations, not by rerunning that init script.

## Main entities

| Domain | Entities | Purpose |
| --- | --- | --- |
| Tenant access | `Tenant`, `User`, `UserTenant`, `TenantInvitation`, `EmailVerificationToken` | Tenant identity, business users, roles/status, invitation lifecycle and email verification |
| Customer identity | `CustomerIdentity`, `CustomerOtpChallenge`, `Customer` | Global phone identity/OTP challenge and per-tenant customer profile |
| Catalogue | `Product` | Tenant-owned active/inactive products with product/combo/reseller-pack classification |
| Orders | `Order`, `OrderItem`, `OrderFulfilment`, `OrderFulfilmentHistory` | Tenant order, immutable line snapshots, delivery lifecycle and audit history |
| Payments | `Payment` | Tenant payment status/provider/reference and optional gateway metadata |

Tenant-owned records reference `Tenant`. Catalogue product lookup is tenant-scoped and excludes inactive products. Order references and idempotency keys are unique within a tenant. A customer identity can have profiles in multiple tenants; a tenant cannot have duplicate profiles for the same non-null identity.

The schema defines order lifecycle states (`PENDING_PAYMENT`, `PAID`, `PROCESSING`, `READY_TO_SHIP`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`), payment states (`PENDING`, `COMPLETED`, `FAILED`, `CANCELLED`, `REFUNDED`), payment providers (`OZOW`, `PAYFAST`, `PAYSTACK`, `MANUAL`), and fulfilment lifecycle states.

## Tenant and authorization model

Tenant membership roles are `OWNER`, `ADMIN`, `MEMBER` and `VIEWER`; membership states are `ACTIVE`, `SUSPENDED` and `REMOVED`. The exact role-to-permission policy is implemented in `services/db/src/access/policies/tenant-permissions.ts`.

For tenant-scoped admin operations, the gateway:

1. Verifies the business-user JWT using `JWT_SECRET`.
2. Requires the client-selected tenant ID for the protected order/payment/fulfilment operations.
3. Calls `POST /internal/access/authorize` using `INTERNAL_SERVICE_KEY` and the authenticated user ID.
4. Forwards the tenant context only after the DB service confirms the requested permission.

Orders and internal DB controllers also check the internal service key. Internal credentials must not be sent to a browser or mobile client.

Customer authentication is separate from business-user membership. Customer OTP challenges store a code hash, expiry and attempt/consumption state rather than a plaintext OTP. Customer profiles are resolved using tenant code and verified customer identity.

## Product catalogue query

`GET /products/tenant/:tenantCode` returns active products in deterministic `(createdAt, id)` order. Optional parameters support the `PRODUCT`, `COMBO_SPECIAL`, and `RESELLER_PACK` sections; case-insensitive name/description/SKU search; and cursor pagination. The default page size is 9 and the maximum is 50. When catalogue query parameters are present, results use an `{ items, pageInfo }` shape; a query without those parameters returns a product array.

## Migrations and seed/import tooling

The DB package contains Prisma scripts for client generation, deploy/dev migrations, Prisma Studio, seed data, and a Glowavee product import. The ordered migration history includes the initial schema, tenant codes, tenant memberships/invitations, access roles, email verification, checkout idempotency, fulfilment, catalogue classification/status, schema-drift reconciliation and customer identity. The actual SQL migration files under `services/db/prisma/migrations/` are authoritative.

Use the DB service scripts from `services/db`; see [Local development](development.md) for commands. Back up persistent data before applying production migrations.

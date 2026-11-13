# Applications

The repository has two Next.js applications and one Expo mobile demonstration app. Each application has its own package manifest; there is no root JavaScript workspace. The mobile app currently has no checked-in npm lockfile.

## Customer storefront — `apps/web`

The storefront uses Next.js App Router, React 19, TypeScript, and Tailwind CSS. Its tenant catalogue is selected through `PULSEHIVE_TENANT_CODE`.

### Routes and capabilities

| Route | Purpose |
| --- | --- |
| `/` | Product storefront and catalogue |
| `/cart` | Cart |
| `/checkout` | Customer/shipping details and Ozow checkout |
| `/checkout/success`, `/checkout/cancel`, `/checkout/error` | Checkout return states |
| `/orders` | Customer order area |
| `/signin`, `/signup`, `/account` | Customer account pages |
| `/about`, `/contact`, `/guides`, `/privacy-policy`, `/terms-and-conditions`, `/refunds-cancellations-returns` | Store information and policies |
| `/api/products` | Server-side catalogue proxy to the DB service |
| `/api/checkout/ozow` | Validates checkout, creates order/payment, and initiates Ozow payment |
| `/api/checkout/ozow/notify` | Validates and publishes Ozow payment notifications |

The catalogue supports product, combo-special and reseller-pack sections, search and cursor-based pagination through the DB service. Cart/checkout data is held in browser storage. Checkout keeps an idempotency key in session storage for retry protection and sends the customer to the validated Ozow payment URL.

### Configuration and scripts

The app's `package.json` defines `pnpm dev`, `pnpm build`, `pnpm start` and `pnpm lint`.

Relevant environment values:

- `PULSEHIVE_TENANT_CODE`
- `PULSEHIVE_DB_SERVICE_URL`
- `PULSEHIVE_ORDERS_SERVICE_URL`
- `PULSEHIVE_EVENTS_SERVICE_URL`
- `INTERNAL_SERVICE_KEY`
- `OZOW_SITE_CODE`, `OZOW_PRIVATE_KEY`, `OZOW_API_KEY`, `OZOW_IS_TEST`
- `NEXT_PUBLIC_CUSTOMER_AUTH_URL` for customer identity requests from the browser
- `NEXT_PUBLIC_APP_URL` for externally visible callback/return URL generation

Compose currently passes tenant/service URLs and the internal key to `web`, but it does not pass the Ozow variables. Add them to the Compose `web.environment` before using Ozow checkout in that stack. See [Docker and Compose](docker.md).

## Admin portal — `apps/admin`

The admin portal is a Next.js 14 App Router application using React 18 and TypeScript. Its API helper in `lib/api-client.ts` sends the saved bearer token to the gateway, remembers the selected tenant in local storage, and attaches `x-tenant-id` to tenant-scoped order/payment reads and fulfilment changes.

### Routes and capabilities

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/auth/login`, `/auth/onboarding`, `/auth/verify-email`, `/auth/accept-invitation`, `/auth/workspaces` | Business-user authentication and tenant onboarding/membership flows |
| `/dashboard` | Order-derived metrics, analytics and recent activity |
| `/orders` | Tenant orders and fulfilment operations |
| `/payments` | Tenant payment list and payment details |
| `/reconciliation` | Reconciliation ledger built from orders and associated gateway payments |
| `/profile`, `/team`, `/notifications`, `/billing`, `/support` | Account and operational areas |
| `/about`, `/contact`, `/pricing` | Public information pages |

Dashboard and reconciliation data refresh on a one-minute interval while active. Reconciliation reuses the authorized Orders endpoint, whose result includes associated payment information.

### Configuration and scripts

Scripts are `pnpm dev`, `pnpm build`, `pnpm start`, and `pnpm lint` (the package currently invokes `next lint` for the lint script).

`NEXT_PUBLIC_API_URL` configures the gateway base URL; the browser helper falls back to `http://localhost:4000`. Compose publishes the gateway on that port. The admin Dockerfile exposes 3001 and starts Next.js in development mode.

## Mobile prototype — `apps/mobi`

This Expo / React Native app contains a login/demo tenant entry screen and bottom tabs for Dashboard, Orders, Payments and Reconciliation. Its `src/api.js` helper targets the gateway and includes convenience calls for those screens.

The login screen does not authenticate a user: it accepts a tenant string and enters the demo. The API helper's query/body shapes (for example `tenantId` query parameters and payment creation/matching calls) do not fully align with the current gateway and backend contracts. Treat the UI and API integration as a prototype, not a production client.

Run it separately with `npm install` and `npm start` in `apps/mobi`; `API_URL` in the Expo config can select an API base. Android emulator defaults use `10.0.2.2` for a host machine's localhost. The mobile app is not declared as a service in root Compose. Its Dockerfile exposes Expo ports 19000–19002, but Compose does not build it; that Dockerfile currently expects a `package-lock.json` which is not present in the app directory.

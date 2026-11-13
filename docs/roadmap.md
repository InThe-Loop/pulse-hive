# Roadmap

This roadmap is an implementation-oriented set of gaps, not a promise or release schedule. Existing functionality is summarized in [Implementation status](implementation.md).

## Near-term integration work

- Pass Ozow credentials and externally reachable callback/return URLs into the storefront container through an appropriate local/deployment secret mechanism.
- Exercise the storefront → Orders → Ozow → notification → Events → RabbitMQ → Orders flow end-to-end, including retries, duplicate notifications and non-success payment states.
- Reconcile the mobile prototype's auth, tenant-context and payment requests with the current API contracts before treating it as a connected client.
- Define and document the intended public route/auth model for customer endpoints currently accessed directly on Auth.

## Product and operations

- Complete end-to-end order/payment operational workflows where required; the current Orders payment API is read-focused and there is no separate payment-matching service.
- Decide which admin areas (team management, notifications, billing and exports) need persistent backend workflows and complete them accordingly.
- Add mobile production authentication, robust API error handling, offline behavior and release packaging if the mobile client remains in scope.
- Implement Capitec integration only if it remains a product requirement; it is not part of the current code.

## Reliability and delivery

- Establish automated unit, integration and end-to-end checks for the core storefront, auth, tenant authorization, order, fulfilment and payment event flows.
- Add CI workflows and documented release/deployment environments.
- Define production secret handling, TLS, allowed origins, data backups/restoration, migrations, observability and service health/readiness requirements.
- Revisit dependency/version consistency and the Nest package test scripts when defining a supported build matrix.

Prioritize work from verified product requirements; avoid relying on the older aspirational checklist in previous documentation.

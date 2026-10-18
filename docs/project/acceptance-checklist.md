# Testing and acceptance checklist

Application test cases are deferred at the user’s explicit request. Local build, syntax, schema and workflow smoke checks are recorded in [implementation status](implementation-status.md). The unchecked items below remain production acceptance criteria; a passing local smoke check does not establish complete parity or concurrency correctness.

## Future verification approach (test cases deferred)

- Unit tests: price/commission formulas, rounding, code parsing and transition rules with meaningful boundary cases.
- Feature/API tests: permissions, validation, workflow effects, error responses and idempotency.
- Database integration tests: use MariaDB-compatible behavior for locks, unique constraints and concurrent mutations; SQLite alone is insufficient for these guarantees.
- Browser E2E tests: the critical complete buyer/seller/rider/agent/admin journeys.
- Device/manual tests: Android/WebView, Google OAuth, GPS permissions, QR camera, files, printing and notification reception.
- Migration tests: identifier preservation, record relationships, file links, repeatability and financial reconciliation.
- Performance checks: realistic data sizes, simultaneous operations, polling, query counts, memory and job duration.

Use synthetic isolated fixtures for ordinary automated tests. Stub external providers for deterministic failure/retry cases and separately verify the real staging integration. Do not run fixture-writing administrative tests against production.

## Foundation and access

- [ ] Fresh checkout setup is reproducible from documentation.
- [ ] Frontend lint/types/build and backend checks pass in CI.
- [ ] Google login, profile completion, return navigation and logout work.
- [ ] Anonymous pages work without exposing private fields.
- [ ] Ownership, member roles and district restrictions are enforced by the API.
- [ ] Next.js server rendering correctly handles authenticated and expired sessions.
- [ ] Private responses cannot leak between users through caching.

## Marketplace, orders and documents

- [ ] Product management, discounts, public pages, search and sharing match the inventory.
- [ ] Follows, comments, news, phone privacy and blocklists work.
- [ ] Orders and confirmations respect buyer/seller permissions.
- [ ] Cash memos, proof uploads/deletion, printing and parcel conversion work.
- [ ] Unauthorized document access is denied even with a known URL/identifier.
- [ ] External media failures have usable fallbacks.

## Parcels and network operations

- [ ] Direct and order-derived bookings preserve identifiers and pricing.
- [ ] Assignment, batch assignment, cancellation and self-assignment match rules.
- [ ] Pickup/delivery authentication cannot be bypassed or replayed for duplicate effects.
- [ ] Current holder and operational views remain consistent throughout handovers.
- [ ] Full, partial, expired and repeated QR transfers behave correctly.
- [ ] Concurrent receivers cannot obtain the same parcel.
- [ ] Returns and collection handovers update the correct records.
- [ ] Tracking, history, CSV and printable outputs agree with underlying records.

## Finance and administration

- [ ] COD, fees, returns and commission formulas pass boundary and rounding cases.
- [ ] Participant allocations and member/company settlements reconcile.
- [ ] Concurrent/retried settlement requests cannot double-credit wallets.
- [ ] Failed transactions leave no partial balance/ledger updates.
- [ ] Historical settlement/credit discrepancies are reported explicitly.
- [ ] Rider/agent totals, filters and details reconcile with source records.
- [ ] Administrative audit, scan, repair and recovery actions have verified scopes/effects.
- [ ] Test-fixture tools cannot unexpectedly mutate production data.
- [ ] Financial and administrative audit trails include required attribution.

## Communication, location and rides

- [ ] Chat participants, blocking, deletion modes and unread counts match rules.
- [ ] In-app notifications link to authorized resources and mark read correctly.
- [ ] Presence expires and polling stops when no longer needed.
- [ ] FCM registration, delivery, retries, token invalidation and tap behavior work.
- [ ] Coordinates and freshness are validated and appropriately disclosed.
- [ ] Ride matching and repeat booking follow documented rules.
- [ ] Only one driver can accept a ride; invalid cancellations are denied.
- [ ] Ride completion behavior is implemented only if confirmed in scope.

## Migration and release

- [ ] Feature inventory has acceptance evidence for every delivered capability.
- [ ] Database rehearsal preserves IDs, relationships, timestamps and files.
- [ ] Financial reconciliation passes with no unexplained discrepancies.
- [ ] Legacy URLs and current Android flows are verified.
- [ ] Mobile layouts, Bengali text, keyboard/focus and error/loading/empty states are usable.
- [ ] Staging performance fits the intended deployment resources.
- [ ] CI deployment transport, secrets, runtime versions and document roots are verified.
- [ ] Cron/jobs do not overlap or duplicate old worker activity.
- [ ] Backup restoration and schema-compatible rollback have been rehearsed.
- [ ] Remaining limitations and intentional changes are documented and accepted.
- [ ] Production deployment has explicit authorization before execution.

## Reporting completion

Report separately: implemented features, verified features, unresolved issues, migration readiness and deployment status. Keep evidence concise but reproducible. Do not claim complete parity from file count, endpoint count or a passing build alone.

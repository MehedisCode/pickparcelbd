# API design plan

This is a proposed contract outline. No API has been implemented. Final endpoint names and field definitions follow the action inventory and database review.

## Conventions

- Group application endpoints under `/api/v1`; keep OAuth/browser session routes where Laravel authentication requires them.
- Use GET for reads and appropriate mutation verbs for changes. Avoid query-string requests that mutate financial or operational state.
- Validate inputs in form requests and authorize independently in policies/services.
- Return consistent JSON resources and explicit 401, 403, 404, 409, 422 and 5xx behavior.
- Paginate potentially growing lists; bound search, exports and batch sizes.
- Represent money as exact decimal strings or a documented minor-unit format.
- Keep public parcel codes separate from internal database identifiers.
- Accept idempotency identifiers for critical commands where appropriate, bind them to actor/operation/payload and define retention and replay behavior.
- Return request/operation identifiers for support without disclosing internal SQL or secrets.

## Endpoint groups

| Group | Proposed resources and commands |
| --- | --- |
| Public | Product listings/details, seller profiles, permitted tracking details and public content |
| Session/account | Current user, profile completion, preferences, logout and Google OAuth |
| Products | Own product management, prices/discounts and media references |
| Social | Follows, comments, news, sharing and public profile counters |
| Orders | Creation, confirmation, details and permitted visibility/deletion |
| Cash memos | Details, role-specific images/proofs, printable views and parcel conversion |
| Parcels | Direct booking, details, weight/charges, status and messages |
| Assignments | Eligible riders, batch assignment, cancellation and self-assignment |
| Verification | Authorized pickup/delivery code and confirmation operations |
| Transfers/custody | Create/preview/accept, selected items, expiry, history, exports and collection handover |
| Returns | Request/accept and return custody details |
| Finance | Wallet history, commissions, collections, settlements and reconciliation |
| Messaging | Conversations, participant messages, send/read and supported deletion modes |
| Notifications/presence | Unread state, mark-read, device token registration and heartbeats |
| Locations | Authorized coordinate updates and derived location details |
| Ride sharing | Availability, driver requests, bookings, acceptance, cancellation and history |
| Administration | Users, roles, verification, member reports, parcel intervention, rules, audits and recovery |
| Compatibility | Only the legacy routes required by old public links and clients |

## Query and response design

Document every endpoint's actor, fields, nullability, timezone, pagination and error examples in the eventual OpenAPI specification. Browser TypeScript types should derive from or be checked against the contract to prevent drift.

Use scoped queries for list/detail/export consistency. Avoid returning whole model rows; explicitly select public/private fields in API resources. Design aggregate dashboards to avoid running many queries for every rider or parcel.

## Files and downloads

Private proofs and memos need authorized upload and retrieval. Public product/profile assets use public URLs. Define validation, size limits, allowed MIME types, storage naming, replacement cleanup and orphan cleanup. CSV/print outputs require the same access checks as the underlying records.

## Frontend integration

Separate browser and server API clients. Handle CSRF/session setup, unauthorized responses and expired sessions consistently. Use feature-specific request functions and invalidate affected queries after mutations. Do not call Next.js Server Actions as the only API available to mobile clients.

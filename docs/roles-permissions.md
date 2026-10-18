# Roles and permissions plan

## Observed roles and identities

The source includes `rider`, `union_agent`, `upazila_agent`, `district_agent` and `super_admin`. Users also act as buyers, sellers, senders, recipients, passengers and drivers. These activity identities are not necessarily separate stored roles.

The rider/agent management panel checks superadmin status and the administrator's district. Several financial actions also check district scope. Preserve those boundaries while mapping each action; do not assume a role name grants global access.

## Proposed authorization principles

- Authorize on the backend for reads, mutations, exports, uploads and background actions.
- Combine role, ownership, district, participant relationship and current workflow state.
- Do not default an unknown or missing role to elevated operational permissions in new code.
- Prevent arbitrary user IDs, parcel codes or district parameters from escaping the caller's scope.
- Use policies and scoped queries rather than scattered UI-only checks.
- Record sensitive administrative actions with actor, target, reason and resulting changes.

## Capability matrix to finalize

| Actor/context | Expected scope | Discovery required |
| --- | --- | --- |
| Anonymous visitor | Approved public products/profiles/tracking, support and terms | Exact phone/location/message disclosure in public tracking |
| Account holder | Own profile, preferences, messages and notifications | Public field rules and deletion semantics |
| Buyer | Own orders, allowed proof uploads and seller communication | Confirmation, blocked-buyer and memo rules |
| Seller/sender | Own products/orders/bookings and permitted rider assignment | Batch eligibility and cancellation stages |
| Assigned rider | Authorized assignment and pickup/delivery actions | OTP visibility and actor-specific verification rules |
| Current parcel holder | Eligible transfers, custody and return actions | Role/location restrictions and partial receipt semantics |
| Agent | Operational actions permitted by the legacy role/location rules | Differences between union, upazila and district agents |
| Superadmin | Authorized administration with existing district restrictions | Whether any action intentionally has global scope |
| Passenger/accepted driver | Own rides and necessary participant details | Availability, location freshness and cancellation rules |
| Scheduled job | Narrow service operation on eligible records | Actor attribution, retries and duplicate handling |

This is a design checklist, not a final permission grant. Exact capabilities follow per-action source tracing and workflow confirmation.

## Required denial tests

- Another user cannot edit a product, order, memo, conversation or notification by changing an identifier.
- An unassigned/non-holder member cannot verify or transfer an ineligible parcel.
- An unauthorized member cannot preview codes or private documents.
- A district administrator cannot view or mutate another district's restricted financial records.
- A role change takes effect for later actions, including queued administrative requests.
- Exports and aggregate counts do not reveal records hidden in ordinary list views.
- Public pages return only explicitly public fields.
- A driver cannot accept or cancel an unrelated or unavailable ride.

# Parcel lifecycle plan

## Model the separate dimensions

The legacy application tracks parcel source/status, assignments, verification, custody, transfers, returns and money across several tables. Do not compress those dimensions into one status string without validating the consequences.

Document a transition table containing action, allowed prior state, actor, transaction locks, resulting records, tracking event and notifications. Final status names must follow discovery of actual records and behavior.

## Workflow requirements

1. Booking: support marketplace/order-derived requests and independent direct bookings. Preserve code uniqueness, sender/recipient data, weight, charges and COD behavior.
2. Assignment: support sender/batch assignment, eligible self-assignment, automatic batch behavior and allowed cancellations. Prevent conflicting active assignments.
3. Pickup: preserve the intended code/OTP preview, acceptance and verification flows. Confirm which participant can see or submit each code.
4. Custody: maintain the current holder and operational list state, with history explaining how possession changed.
5. Transfer creation: check holder, eligible items, role/location rules and pending-transfer conflicts; generate the QR token and expiry.
6. Transfer acceptance: validate token, recipient, expiry and selected subset under locks. Apply custody changes atomically and preserve handling of unreceived items.
7. Expiry: cancel eligible expired pending batches and restore unreceived parcels to the correct operational state, with a scheduled task plus request-time eligibility checks.
8. Delivery: verify the allowed actor and authentication, write the delivery event and trigger defined financial effects once.
9. Return: preserve request, acceptance, custody restoration and collection/settlement consequences.
10. History: retain assignment, handover, verification, message, return and administrative events with attribution.

## Concurrency and duplicate requests

- Lock the relevant batch, assignment, custody or request records inside a consistent transaction boundary.
- Use unique constraints and idempotent operation identifiers where appropriate; a UI disabled button is insufficient.
- Define a stable lock order for multi-parcel operations and handle deadlocks safely.
- Return a clear conflict for already accepted, expired or otherwise invalid operations.
- Repeated verification must not repeat the associated financial side effects.
- Send notifications after the durable state change commits.

## Acceptance cases

- Direct booking and order-derived booking reach the same expected operational views.
- A parcel completes assignment, pickup, custody transfers, delivery and settlement with a consistent timeline.
- A selected subset is received correctly; the remaining subset follows the documented legacy rule.
- An expired transfer cannot be accepted even if the expiry job has not run yet.
- Two receivers cannot obtain ownership of the same parcel through concurrent requests.
- Returns produce the expected holder, status, money and history.
- Cancellation is rejected after the applicable irreversible stage.
- Administrative reassignment/recovery cannot silently discard custody or financial history.
- Tracking codes retain leading zeros and supported legacy input forms.
- Public tracking does not disclose fields beyond the agreed visibility rules.

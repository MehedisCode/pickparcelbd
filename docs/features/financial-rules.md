# Financial implementation and integrity plan

## Evidence and limits

`superadmin.php` includes collection settlements, return settlements, commission rules/participants, member/company settlements, wallet transactions, delivery confirmations and audit/recovery tools. Existing code uses transactions, row locks and duplicate-credit checks in several operations.

Those mechanisms must be preserved in intent and verified under the new implementation. Static inspection alone does not establish that historical balances or all concurrency paths are correct. Business formulas must be extracted from code and reconciled with actual records before implementation is considered complete.

## Rule catalogue to produce

For every money operation, specify:

- Eligible actor, owner and district.
- Source parcel/order and prerequisite operational state.
- Input amounts and trusted source of each amount.
- Charge, COD, return and commission formula, including rounding points.
- Recipient, company share, responsible member and participant allocation.
- Wallet movement, settlement item and audit/event records.
- Uniqueness/idempotency key and repeated-request response.
- Cancellation, reversal and corrective handling.

## Required invariants

- Use DECIMAL-aware arithmetic or integer minor units; no binary float arithmetic for new money calculations.
- A completed financial operation has its required transaction, settlement and audit records.
- The same business entitlement cannot credit the same wallet twice.
- Repeating a request returns the prior result or a defined conflict without another money movement.
- Any balance update and its corresponding ledger entry commit together.
- Existing paid settlements with missing wallet credit are reconciled according to explicit evidence, without recrediting already credited items.
- Allocation totals reconcile to the commission/settlement total using the documented rounding rule.
- Collection status, transfer collection handover and settlement status remain distinct where the business requires them.
- A notification failure must not roll back a completed money movement or trigger a second credit on retry.
- Corrections retain the original history and an attributable reason; do not silently edit away a previous transaction.

## Validation scenarios

| Scenario | Expected verification |
| --- | --- |
| Successful delivery with COD | Charges, collected amount, commission and eligible settlement agree |
| Delivery without COD | No invented COD amount or collection obligation |
| Return after pickup/transfer | Correct return custody and corresponding receivable/payable effects |
| Multiple commission participants | Allocation and settlement items agree with rules |
| Two settlement submissions | At most one wallet credit for the entitlement |
| Old paid settlement lacking a credit | Only the missing legitimate credit is added |
| Existing credit with different amount | Explicit discrepancy; no automatic extra credit |
| Database failure mid-operation | Full rollback; no partial balance/ledger state |
| Worker retry after commit | No repeated payment or duplicate notification entitlement |
| Cross-district request | Denied or scoped according to the action's verified rules |

## Administrative scans and recovery

Inventory every existing scan, cleanup, fixture/test action and repair action separately. Classify each as read-only, bounded corrective mutation, or test-fixture mutation. Administrative pages must clearly present the intended effects and permissions.

Financial test fixtures run in isolated environments. Production readiness checks must not silently insert test money or delete real records. Preserve existing useful reports while reviewing unsafe implementation assumptions as explicit behavior changes.

## Migration checks

Compare balances, ledger sums, opening balance semantics, outstanding COD, paid/unpaid commissions, settlement items and return obligations before and after migration. Investigate differences by record and business cause. A schema rollback or old-code redeploy is not a valid reversal of financial activity already accepted by the new system.

## Replacement implementation decisions

Money mutations use BCMath decimal arithmetic, database transactions, row locks and unique operation keys. A repeated sender-credit confirmation returns the existing credit; conflicting amounts are rejected. Commissions require delivered status, received collection and an explicit district rule. The rider/agent percentages form one pool shared equally across unique verified handlers; whole minor units go to each participant and the last receives the remainder. Handler role/district snapshots are recorded at pickup, handover and delivery so subsequent account changes do not erase earned allocations. Settlement authorization follows the commission’s district.

Return accountability records store the returning member, expected amount, sender receipt and subsequent company confirmation separately from collected cash. Return confirmation does not create a COD wallet credit. Transfer documents record expected collection, not a claim that cash has already been collected.

Quotes are recalculated server-side and include a fingerprint; checkout rejects changed prices/rates and requires terms acknowledgement. Historical legacy balances, payments and entitlement reconstruction still need a reconciled migration.

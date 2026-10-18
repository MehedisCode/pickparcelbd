> Current implementation: replacement migrations create a separate normalized database. No legacy rows have been imported. `php artisan pickparcel:legacy-schema` can capture columns, indexes and foreign-key metadata using a configured SELECT-only account; its output stays in private ignored storage. It does not implement record transformation or financial reconciliation. Read [implementation status](../project/implementation-status.md) before running any migration.

# Database discovery and migration plan

## Current knowledge

The PHP source uses PDO with MySQL syntax. cPanel reports MariaDB 11.4.13 and one configured database. The actual schema, table sizes, constraints and record integrity have not been inspected.

The source creates or alters several tables during normal requests. These calls are not a complete schema definition: base tables and older compatibility columns may already exist. Production bootstrap must not rely on recreating the database by visiting pages.

## Discovery inventory

- Export schema metadata: tables, engines, columns, defaults, generated values, indexes, uniqueness and foreign keys.
- Record actual row counts, identifier formats, collations and nullable/legacy fields.
- Inspect tables referenced by source even when no CREATE statement is present.
- Identify relations for users/products/orders, both parcel sources, assignments, transfers/custody, returns, collections, commissions, wallets, chats, notifications, device tokens and rides.
- Compare schema creation logic in `index.php`, `superadmin.php` and `ride-share.php` for drift.
- Check transaction-capable storage engines, orphan references and duplicate business identifiers.
- Map files to stored paths, document visibility and owning records.
- Record database/session timezones and the meaning of historical timestamps.

## Migration strategy decision

Choose after discovery:

1. Adopt existing tables with explicit model mappings and additive migrations, or
2. Import into an improved schema while preserving identifiers and maintaining an auditable mapping.

Prefer the smallest safe schema change initially. A clean rebuild of application code does not justify unnecessary conversion of historical financial data. Staging should rehearse the chosen method before production.

## Identity preservation

- Preserve internal user IDs where feasible and public `PP...` identifiers wherever linked externally.
- Preserve parcel codes and their supported `RFD` display form; avoid numeric storage that drops leading zeros.
- Preserve order, memo, transfer and settlement references or provide a durable mapping.
- Keep historical records immutable unless a documented repair is explicitly part of the migration.
- Retain attribution, district scope and timestamps needed to reconstruct custody and financial history.

## Controlled schema changes

- Replace request-time DDL with versioned migrations.
- Use an expand/migrate/contract approach where old and new code temporarily coexist.
- Do not make destructive column changes while the old application still depends on them.
- Validate and clean duplicates before introducing stricter uniqueness constraints.
- Explicitly review migrations for implicit commits, long locks and rollback behavior.
- Separate schema deployment from business-data corrections.

## Data rehearsal

1. Create an isolated representative dataset, with sensitive data access restricted and sanitized when suitable.
2. Run the migration/import on a separate database and separate file storage.
3. Repeat it to verify restartability or clearly enforced single-run behavior.
4. Reconcile counts, identifiers, references, dates, files and financial totals.
5. Exercise the new application against migrated records, including older compatibility cases.
6. Record source snapshot, migration version, duration, failures and reconciliation results.

## Reconciliation requirements

| Area | Required checks |
| --- | --- |
| Accounts | User count, public IDs, Google linkage, role/district mappings |
| Marketplace | Product ownership, prices/discounts, orders and memo references |
| Parcels | Counts by source/status, tracking IDs, assignments and verification timestamps |
| Custody | Current holders, pending transfers, received subsets and return custody |
| Money | Wallet totals, transaction amounts, COD, unpaid/paid commissions and settlement allocations |
| Communication | Participant links, visibility/deletion flags, unread state and notification recipients |
| Files | Referenced files present, appropriate public/private placement and URL compatibility |
| Rides | Request/driver links, status, locations and timestamp interpretation |

Wallet balances must be compared with the applicable ledger and opening balance semantics. A difference must be investigated, not silently overwritten to make totals match.

## Production synchronization

For the initial release, plan a short controlled write pause if a reliable incremental migration is unnecessary or unavailable. Take a fresh backup, synchronize final changes, reconcile and only then enable writes in the replacement. If continuous synchronization becomes necessary, design it explicitly; never let two independent implementations update the same financial/custody workflow without coordination.

Do not commit production dumps or uploaded proof files into this repository. Document secure backup locations and restoration permissions separately from source control.

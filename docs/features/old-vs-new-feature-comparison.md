# Old and new website feature comparison

Reviewed: 18 October 2026 (Asia/Dhaka).

This comparison records the source review of `PickparcelBD_old` against the replacement in `PickparcelBD_new`. The new website implements the main business workflows, but complete feature parity has not been achieved.

“Implemented” means replacement screens, routes or backend services exist. Core workflows have passed some local development checks; this does not establish production, MariaDB concurrency or Android compatibility. See [implementation status](../project/implementation-status.md) for verification evidence and [the legacy action map](../migration/legacy-action-map.md) for the broader action-level cross-reference.

## Feature overview

| Feature area | New website status |
| --- | --- |
| Products, discounts, search and cart | Implemented |
| Orders, seller confirmation and parcel creation | Implemented |
| Cash memos and private buyer/seller/payment images | Implemented |
| Direct booking, weight charges and tracking | Implemented |
| Rider assignment, batch pickup and delivery OTP | Implemented; pickup-specific QR workflow is missing |
| Custody, QR transfers, selected-subset receipt and transfer CSV | Implemented |
| Returns, collections, commissions and wallet settlements | Implemented; specialist reporting remains incomplete |
| Messaging, presence and in-app notifications | Implemented |
| Ride requests, nearby matching and driver acceptance | Implemented; real-device verification is pending |
| Profiles, following, comments, news and buyer blocking | Implemented with the gaps below |
| Admin roles, verification, recovery and audits | Implemented in a simplified form |

## Confirmed missing or incomplete features

These are findings from the inspected source, not claims that the corresponding legacy behavior has been independently validated in production.

| ID | Gap | Old website behavior | Current replacement behavior | Work remaining |
| --- | --- | --- | --- | --- |
| GAP-01 | Detailed rider/agent reporting | Clickable category totals, receivable/payable breakdowns, send/receive figures, financial sorting, role filtering, CSV and print | Simpler member list and parcel/commission report | Restore the complete operational breakdowns, filters, sorting, category drill-downs and member-report exports; verify metric definitions |
| GAP-02 | Pickup OTP QR | Sender displays an OTP QR; rider scans it to preview assigned parcels | Manual anchor parcel code plus OTP entry; transfer QR scanning is implemented separately | Add pickup-specific QR display and scanning, preserving authorized batch preview and selected physical receipt |
| GAP-03 | Followers list | Separate views for people following you and people you follow | Following list and follower count exist; follower-list screen is missing | Add the authenticated follower list and its navigation |
| GAP-04 | Seller catalogue pagination | Public seller page loads all products | Loads the first 12 products without next-page or load-more controls | Make all published seller products reachable through pagination or load more |
| GAP-05 | Parcel quick-message templates | Presets for receipt, weight/charge, pickup readiness, delivery and return, plus custom messages | Custom parcel messages exist; preset selection and automatic template text are missing | Restore templates, including current weight/charge substitution and authorized notification behavior |
| GAP-06 | Fraud-check detail | Bangladesh phone normalization, cancellation figures and risk labels | Exact phone matching and basic parcel totals | Normalize equivalent phone formats; define and implement seller-scoped cancellation figures and explainable risk labels |
| GAP-07 | Combined header search | Live search results include users and products | Product search and separate people lookup exist | Restore the combined search experience with appropriate public-field and access restrictions |
| GAP-08 | Broader safety snapshots and audits | Snapshots capture several related records; specialized operational/security reports are available | Custody-focused snapshots and consolidated scans | Review required snapshot evidence and individual legacy finding definitions; retain safe recovery constraints |
| GAP-09 | Bengali interface coverage | Much of the operational interface is Bengali | Many replacement screens use English | Complete Bengali labels, guidance and operational messages while retaining existing Bengali content |

The existing transfer CSV export is separate from the missing rider/agent management CSV. The existing transfer QR scanner is separate from the missing pickup OTP QR workflow.

## Implemented code awaiting configuration or verification

| Area | Current state | Remaining work |
| --- | --- | --- |
| Google login | OAuth implementation exists; local credentials were unconfigured at review | Configure the target environment and callback, then verify real sign-in, account linking and redirects |
| Firebase push | Token adapter, payload handling, queue and delivery records exist; local credentials were unconfigured at review | Configure private credentials and scheduler, then verify device registration, refresh, delivery, taps and failures |
| Android/WebView and browser hardware | Compatibility adapters and camera/GPS/print interfaces exist | Verify the actual APK, cookies, re-login, deep links, camera, GPS, uploads, downloads and physical printing |
| MariaDB and hosting | Replacement migrations exist; development checks used SQLite | Verify migrations, concurrent operations, query/polling load and host capacity in an isolated staging environment |
| Reverse geocoding | Optional implementation exists and is disabled locally | Configure the provider and verify consent, address results and provider limits |
| Deployment automation | GitHub CI exists; deployment is not configured | Select staging URLs/hosting, configure secrets and deployment transport, and verify the release procedure |

These items must not be counted as missing implementation solely because their live configuration or device verification is pending.

## Production data migration is not implemented

The new application currently uses fictional development records. A production-record importer has not been implemented, and existing production data has not been migrated.

Migration must cover users and public IDs, products and media, private memo documents, orders, parcel codes and history, assignments/custody/returns, wallet opening balances and ledger history, collections, commissions and settlements. Financial totals and record ownership need reconciliation before cutover.

`pickparcel:legacy-schema` reads metadata only. It is not a record importer. See [the database migration plan](../migration/database-migration.md).

## Deliberate behavior differences

- Public tracking hides private contact details and exact addresses.
- Fraud history is restricted to parcels sent by the requesting seller. Restoring phone normalization or risk summaries should preserve this access boundary.
- Parcel state changes use explicit, guarded actions rather than broad generic status writes.
- Terms acknowledgement occurs during booking/checkout and records a timestamp; the old automatic daily terms popup is not reproduced.
- Snapshots and recovery have constrained effects; financial history cannot be silently rolled back.
- Legacy test-data creation and cleanup tools were omitted during the owner's test deferral. No application test suite was added.

These differences should be reviewed separately from accidentally missing screens or controls.

## Suggested completion order

1. Fix seller catalogue pagination so published products remain reachable beyond the first page.
2. Restore pickup OTP QR display and scanning.
3. Restore detailed rider/agent reports, category drill-downs, filters and exports.
4. Restore fraud-phone normalization and agree on seller-scoped history/risk definitions.
5. Complete followers, message templates, combined search and Bengali interface coverage.
6. Compare specialist audit findings and snapshot evidence with actual administrative workflows.
7. Implement and rehearse production data migration, configure integrations, and complete device/MariaDB/staging verification before cutover.

## Source evidence

Legacy paths below refer to the separate old directory, which is not uploaded in the new project's GitHub repository.

| Finding | Legacy evidence | Replacement evidence |
| --- | --- | --- |
| Member reports and export | `rider_agent_management.php:1263` (CSV), `:1400` (management screen), `:1444` (sorting) | [Member report and administration screens](../../frontend/src/features/admin/screens.tsx); [admin report queries](../../backend/app/Http/Controllers/AdminController.php) |
| Pickup OTP QR | `index.php:15338` (display), `:15375` (scanner) | [Batch pickup screen](../../frontend/src/features/parcels/batch-pickup.tsx); [parcel details](../../frontend/src/features/parcels/screens.tsx) |
| Followers | `index.php:11436` | [Following and seller profile screens](../../frontend/src/features/accounts/screens.tsx); [social endpoints](../../backend/app/Http/Controllers/SocialController.php) |
| Seller products | `public-profile.php` loads all seller products | [Seller profile screen](../../frontend/src/features/accounts/screens.tsx); [12-item product pagination](../../backend/app/Http/Controllers/PublicController.php) |
| Message templates | `index.php:3671` and the surrounding message switch | [Parcel messaging service](../../backend/app/Services/ParcelService.php); [parcel screen](../../frontend/src/features/parcels/screens.tsx) |
| Fraud detail | `index.php:4218` | [Fraud endpoint](../../backend/app/Http/Controllers/SocialController.php) |
| Combined search | `index.php:16794` renders user and product search results | [Marketplace screens](../../frontend/src/features/marketplace/catalog.tsx); [people lookup](../../backend/app/Http/Controllers/SocialController.php) |
| Snapshot scope | `superadmin.php:833` and related specialized scan handlers | [Snapshots, audits and recovery](../../backend/app/Http/Controllers/AdminController.php) |
| Daily terms | `index.php:13816` | [Account acknowledgement](../../backend/app/Http/Controllers/AccountController.php); [order validation](../../backend/app/Http/Controllers/OrderController.php) |

This review did not change application behavior. New implementation or verification should update this comparison and the current status document together.

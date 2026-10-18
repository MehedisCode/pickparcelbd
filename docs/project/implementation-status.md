# Implementation status — 18 October 2026

The owner selected cPanel hosting for both `https://staging.pickparcelbd.com` and `https://staging-api.pickparcelbd.com`. Both domains, HTTPS and the isolated release are prepared, with Node.js registered and both applications held in maintenance mode. The staging database and dedicated users are provisioned. Database password entry, authenticated connectivity checks, Google callback configuration and final activation remain pending. See [cPanel staging deployment](../deployment/cpanel-staging.md).

The replacement is running locally in `PickparcelBD_new`. It uses Next.js 16, React 19 and TypeScript with a Laravel 13 API. The development database is separate SQLite storage containing fictional preview accounts. Production targets MariaDB; the legacy database and old website have not been changed.

This is a working implementation for review, not a declaration of complete legacy parity or production readiness. The static action-by-action cross-reference is in [the legacy action map](../migration/legacy-action-map.md). Application test cases were explicitly deferred by the owner. No test suite or fixture-writing administrative test endpoints were added.

The subsequent [old vs new feature comparison](../features/old-vs-new-feature-comparison.md) records nine confirmed gaps, including pickup OTP QR, specialist member reports/exports, followers, seller catalogue pagination and message templates. It separates missing implementation from configuration, migration and device-verification work.

Google-only signup/login has since received callback/error handling, identity conflict protection, safe return/profile-completion navigation and session/CSRF recovery fixes. The owner’s newly created Google credentials are now configured privately for local development; the outgoing Client ID, local callback and OAuth state were verified. The previous client produced `redirect_uri_mismatch`. Successful real-account login with the new client still awaits the owner’s Google sign-in. See [the authentication guide](../architecture/authentication.md).

## Implemented application

| Area | Replacement behavior |
| --- | --- |
| Public marketplace | Responsive refreshed homepage, categories, search, sorting, pagination, product pages, seller profiles, cart and sharing metadata |
| Media | Public image uploads, image failures, YouTube/TikTok/Facebook/Drive embeds or original-link fallbacks; unchanged favicon and APK download asset |
| Accounts | Google OAuth implementation, session/CSRF authentication, profile completion/editing, private/public phone preferences, verification badges, local-only fictional sign-in |
| Locations | Bundled 64 district / 495 upazila names, explicit GPS capture, separate address fields, optional consent-based reverse geocoding with cache and provider rate limits |
| Social | News updates/deletion, follows, comments, profile shares, buyer blocking and seller-scoped delivery-history lookup |
| Products | Owner-only creation/editing, active/inactive visibility, soft deletion, discounts, external media and image uploads |
| Checkout/orders | Server price review, seller splitting, quantities, COD/prepaid selection, terms acknowledgement, price-change rejection, seller confirmation, automatic parcel creation, per-user list hiding and order-linked messaging |
| Cash memos | Buyer/seller/payment image roles, private file retrieval, role-based replacement/removal, printing and one-time conversion to an order/parcel |
| Parcels | Direct/order/memo sources, six-digit RFD codes, snapshots of contact/address details, weight/rate calculation, restricted public tracking, timeline/messages and printable shipping labels with tracking QR |
| Pickup | Sender batch assignment, cancellation, member self-acceptance, sender OTP visibility, member batch preview and selected physical receipt |
| Delivery | Current-holder checks, out-for-delivery transition, delivery OTP, actual collected amount and notifications |
| Custody/transfers | Current holder, separate pickup/custody list organization, QR/link/camera input, hashed transfer token, expiry, selected-subset acceptance, repeat rejection, history, CSV and collection-handover acknowledgement |
| Returns | Request, sender physical-receipt acknowledgement, returning-member accountability, separate company return receipt and repeat protection |
| Finance | Exact decimal calculations, explicit district commission rules, unique verified handlers, role/district snapshots, allocations with remainder handling, separate COD credit, member/company settlements, ledger entries and unique operation keys |
| Financial views | Wallet ledger, paginated collection/commission/settlement history, unpaid totals and historical settlement beneficiaries |
| Messaging | Paginated conversations/history, recipient scope, order context, read/unread status, presence, delete-for-me and sender-controlled shared deletion |
| Notifications | Recipient-scoped in-app records, unread/read handling, active device tokens, database queue, per-token delivery records, bounded retries and invalid-token deactivation |
| Android adapters | Exact token-registration PHP entry point and response, strict configured Origin/session checks, data-only HIGH-priority FCM payload with the original notification_id/title/body/sender_image keys |
| Rides | GPS freshness, driver availability, 3 km matching, request updates, single-driver acceptance, participant cancellation, completion and history |
| District administration | People/roles/verification, member reports, parcel intervention, rates/rules, collections, commissions, activity logs and district scope checks |
| Recovery/audits | Financial/custody/return/accountability/readiness scans, findings/resolution notes, custody snapshots, evidence-based financial credit/delivery/return recovery, constrained restoration, reassignment, pending-transfer cancellation, controlled handover and closed-custody cleanup |
| Operations | Fresh schema migrations, local seed data, setup instructions, scheduler/queue configuration and GitHub CI definition |

The backend currently exposes 83 API endpoints. Routes are listed with `php artisan route:list --path=api`; source locations and startup commands are in the project README.

## Confirmed local evidence

- Frontend TypeScript, ESLint and a production build passed during implementation. The final production build passed after the custody lists, batch cancellation and financial recovery changes.
- PHP syntax passed for all application/configuration/migration/route files. Composer metadata and installed platform requirements passed. Pint formatting was applied.
- All six migrations and the fictional seed completed in a fresh, separate temporary SQLite database; 83 API endpoints booted successfully.
- Local fictional accounts completed booking → assignment → invalid-OTP rejection → batch pickup → QR transfer preview/acceptance → replay rejection → delivery → collection receipt → sender wallet credit → commission calculation → member/company settlement.
- Repeating sender wallet confirmation did not duplicate its credit. Duplicate commission calculation/settlement was rejected. A non-admin could not access district finance. Public tracking excluded private recipient/contact data.
- Server checkout review and order confirmation, conversation sending/inbox/read behavior, sender return acceptance, company return receipt and repeat rejection passed local checks.
- Nearby driver acceptance and completion passed using fictional coordinates submitted directly to the local API. This does not verify physical GPS hardware or permission prompts.
- Buyer/seller memo images uploaded, an unrelated rider was denied document access, conversion created a parcel, and duplicate sending was rejected.
- Pickup readiness, batch assignment cancellation/reassignment, shared-code batch receipt, custody-list changes, pending-transfer guards and selected-subset transfer receipt passed. Parcels omitted from a transfer receipt remained with the sender, and the closed batch rejected reuse.
- Repeating evidence-based repair of an already credited member settlement preserved the wallet balance and recorded the recovery audit.
- The marketplace and authenticated seller workspace were visually inspected in the local browser. Camera scanning, physical printing and real device notification receipt have not been verified.

These were development smoke checks, not an automated application test suite. They do not prove simultaneous-request behavior on MariaDB.

## Remaining work before replacing production

1. **Production data transformation and reconciliation.** Read-only metadata discovery found 61 legacy tables. Replacement schema migrations are implemented, but a production-record importer is not. The `pickparcel:legacy-schema` command captures metadata only. Preserve old public/product/parcel IDs, convert legacy state/OTP/history, map private uploads, establish opening wallet ledger entries, reconcile all collection/commission/settlement totals and rehearse repeatable import from a protected snapshot before cutover.
2. **Action-level parity review.** The inventory covers the legacy feature families. [The static action map](../migration/legacy-action-map.md) now records 55 main, 35 admin and 6 ride actions. Specialist report definitions and step-specific readiness findings are not yet verified one-for-one. The replacement provides constrained, audited operations rather than copying fixture/test or broad SQL-repair handlers. Compare the remaining operational reports and recovery cases against the owner's real workflow before declaring full parity.
3. **Google and Firebase integration.** Configure the new environment's Google OAuth callback and Firebase service-account path privately. The private legacy worker was inspected read-only; no live pushes were sent and no production credentials were copied into the new repository. Verify OAuth, token refresh, notification receipt/tap and failure handling on staging devices. Network acknowledgement ambiguity can still cause a push to be repeated after a process crash; clients should use notification_id for display deduplication.
4. **Android/WebView and browser hardware.** Android source was not supplied. Verify the existing APK's cookies, re-login, redirects/deep links, GPS, camera, uploads, downloads and printing. Legacy PHP sessions are not imported. External media and reverse-geocoding provider behavior also need staging verification.
5. **MariaDB/concurrency and host capacity.** The isolated `kinboame_pp_staging` schema is provisioned on MariaDB 11.4.13: 41 InnoDB/utf8mb4 tables, 63 foreign keys, 23 unique indexes and six recorded migrations were verified. The owner created the runtime and migration users, and their intended scoped cPanel privileges were verified. Private backend configuration, connectivity, effective runtime permission checks and concurrent assignment/transfer/settlement checks remain pending. SQLite ignores or differs from MariaDB row-lock behavior. Verify poll/query load, queue runtime and cPanel's 1 GB memory limit before release. See [staging database setup](../deployment/staging-database.md).
6. **CI/CD activation and deployment.** The project and workflow are uploaded to the private [MehedisCode/pickparcelbd repository](https://github.com/MehedisCode/pickparcelbd). The initial CI run reported PHP formatting differences; these were corrected with an uncached formatter run. Subsequent CI results are visible in the repository Actions tab. The staging database/schema, two subdomains, HTTPS and release files are provisioned, and a production-mode Node app is registered behind maintenance holds. PHP 8.4 was verified for the separate staging backend; the main site configuration and cron were preserved. Private database password entry, Google callback configuration, effective database checks, staging cron and final activation remain pending. See the staging deployment guide before proceeding.

## Deliberate legacy corrections

Public tracking no longer exposes names, phones or exact addresses. Private documents require participant authorization. State transitions require the proper member/holder. Transfers use hashed bearer tokens, close after selected-subset receipt, and expire without moving custody. Delivered/returned/return-pending parcels cannot enter an ordinary new transfer. Recovery cannot silently roll back wallet history.

Checkout uses current server prices and exposes the fee before confirmation. Cash memos use configured delivery rates. A driver can complete an accepted ride. Handler snapshots preserve earned commission eligibility when account roles or addresses later change. Return accountability is separate from money actually collected.

GPS capture is explicit, and address/district changes remain visible to the user. Optional reverse geocoding is disabled until configured; choosing it discloses that coordinates go to the provider. See [data sources](../architecture/data-sources.md), the [Nominatim API](https://nominatim.org/release-docs/latest/api/Reverse/) and [provider policy](https://operations.osmfoundation.org/policies/nominatim/).

## Dependency and verification limits

Composer reported no security advisories at installation/update. npm's complete audit reported five high-severity entries in the ESLint/Next lint dependency chain, rooted in the braces nested-pattern advisory. The registry offered no patched braces version during this session; no forced Next.js downgrade was applied. A separate production-only audit could not complete because the registry connection reset twice. Treat that audit as unavailable, not a clean result. Recheck dependencies before release.

The support page intentionally retains `01XXXXXXXXX`, `support@example.com` and the old support hours, per the owner's answer. Those placeholders should be replaced through environment configuration when the owner chooses actual contacts.

## Local workstation startup repair

Ubuntu 26.04 had no system PHP/Composer. The first preview used an isolated temporary PHP runtime. A subsequent manual example `.env` copy cleared the local key while the earlier preview servers still occupied ports 3000/8000. Those servers were stopped. The previous fictional database was preserved; a separate ignored `database/local-dev.sqlite` database was migrated/seeded with a new local key. Homepage/API/preview sign-in and the launcher duplicate-port guard passed, then both ports were released for the owner’s terminal. The README now includes permanent Ubuntu package installation and setup commands that preserve an existing environment/key. System installation still requires the owner to enter their sudo password locally.

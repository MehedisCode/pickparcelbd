# Implementation plan

## Scope

Deliver the marketplace, parcel delivery network, financial operations, communication tools, ride sharing, public pages and administration currently represented in the old application. A smaller launch may be proposed later, but this plan does not silently drop features.

## Phase 1: Establish the baseline

Tasks:

- Map all PHP pages, GET modes, POST actions, inline AJAX handlers, public links and cron dependencies.
- Trace both successful and failure paths, role restrictions and district scoping.
- Inventory forms, status labels, Bengali messages, CSV outputs, printed documents and uploaded media behavior.
- Inspect the actual database structure, indexes, engines and compatibility columns.
- Inspect the missing notification worker and determine Android/WebView dependencies.
- Translate intended behavior into acceptance cases and distinguish current behavior from confirmed defects.

Deliverables: completed source references in the feature inventory, database map, compatibility map, role matrix and unresolved-decision list.

Exit: every known legacy action belongs to a tracked feature; unknown dependencies are named and their implementation impact is understood. Estimate effort after this phase; no fixed delivery date is justified yet.

## Phase 2: Design and scaffold

Tasks:

- Create `frontend/` and `backend/` with maintained framework versions and committed lockfiles.
- Confirm PHP runtime/extension requirements, database connectivity and local tooling.
- Establish routing, module conventions, configuration, API errors, logging and health endpoints.
- Create isolated local and staging environments with synthetic fixtures.
- Define the database adoption/import approach before writing production migrations.
- Add CI for formatting, linting, types, backend checks and builds.

Deliverables: reproducible local setup, clean builds and a health check reaching an isolated database.

Exit: a fresh checkout can run both applications using documented commands; secrets are supplied outside Git.

## Phase 3: Shared account foundation

Tasks:

- Implement Google OAuth, account linking, profile completion, login/logout and return navigation.
- Implement backend authorization, district scope and a consistent permission vocabulary.
- Integrate cookie/session authentication with browser requests and Next.js server rendering.
- Build responsive navigation, reusable forms/tables, Bengali support, error states and pagination.
- Implement public/private file access and upload validation.

Exit: a user can sign in, complete a profile and access only authorized data. Anonymous public access, admin restrictions and cross-user denial cases pass.

## Phase 4: Marketplace and customer workflows

Tasks:

- Build products, discounts, public profiles, public product sharing and seller listings.
- Build orders, confirmations, cash memos, proof uploads, printing and conversion into parcel requests.
- Build follows, comments, news, sharing, phone privacy, buyer blocklists and fraud checks.
- Preserve help/support and daily terms acknowledgement behavior.

Exit: representative buyer/seller journeys pass through the new interface, including blocked/unauthorized actions and file privacy cases.

## Phase 5: Parcel operations and delivery network

Tasks:

- Build direct bookings, marketplace parcel requests, public tracking and charge/weight rules.
- Build sender assignment, batch assignment, self-assignment and cancellation flows.
- Implement pickup and delivery authentication according to the documented existing rules.
- Build custody, QR transfers, partial receipt, expiry, returns and collection handovers.
- Build rider/agent operational views and preserve history, exports and printing.

Exit: the normal delivery journey and return journey pass, including concurrent acceptance and partial/expired transfer cases.

## Phase 6: Finance and administration

Tasks:

- Implement COD collection accounting, commission rules, participants and calculations.
- Implement member/company settlements, delivery wallet confirmation and reconciliation of previous credits.
- Preserve audit trails and add explicit duplicate-request handling.
- Rebuild administrative scans, recovery tools, safety snapshots, readiness reports and administrative test tools after documenting their exact effects.
- Test destructive or corrective admin tools only against isolated fixtures.

Exit: expected parcel amounts, wallet changes and settlement totals reconcile; repeated settlement attempts never add duplicate credits; district boundaries hold.

## Phase 7: Communication and ride sharing

Tasks:

- Build user chat, order-linked chat, parcel messages and notification read states.
- Preserve conversation/message deletion semantics and blocking restrictions.
- Implement presence and polling with controlled intervals, visibility handling and cleanup.
- Integrate FCM token registration and notification delivery, with retries and deduplication.
- Build ride availability, GPS updates, proximity matching, requests, acceptance, cancellation and history.
- Implement ride completion only after confirming how the existing application exposes it; a database status alone is not a confirmed UI workflow.

Exit: chat and notification journeys pass; two drivers cannot accept the same ride; location disclosure follows participant permissions.

Communication infrastructure may be built earlier when other phases need notifications. Feature completion still requires end-to-end verification.

## Phase 8: Staging, compatibility and performance

Tasks:

- Deploy both applications to staging and run a rehearsal with representative data.
- Verify legacy public URLs, identifiers, media paths, OAuth redirects and Android behavior.
- Check query counts, indexes, polling traffic, memory use and task duration under realistic concurrency.
- Run full buyer/seller/rider/agent/admin journeys and financial reconciliation.
- Exercise backups, release procedures and application rollback with compatible schemas.

Exit: acceptance checklist passes, remaining issues have an explicit disposition and deployment prerequisites are verified.

## Phase 9: Authorized production transition

After an explicit deployment instruction, follow the production runbook: backup, control writes, synchronize data, verify totals, deploy the identified release, run smoke checks and monitor it. Keep a tested rollback route.

## Definition of complete

- Every inventoried capability has an implementation and acceptance evidence, or a user-approved scope change.
- No unresolved critical authorization, financial integrity or custody defect remains.
- Public/mobile compatibility and background jobs are verified in their intended environment.
- Setup, configuration, operations, deployment and rollback documentation match the delivered system.
- Production readiness is reported separately from implementation completion and from actual production deployment.

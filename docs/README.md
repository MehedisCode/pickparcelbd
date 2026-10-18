# PickParcelBD replacement application plan

Planning date: 18 October 2026 (Asia/Dhaka).

Status: the replacement application is implemented locally with a separate development database. See [implementation status](implementation-status.md) for verified workflows, outstanding parity work and production prerequisites. CI configuration is written but has not run on GitHub; production data migration and deployment have not occurred.

## Objective

Rebuild the functionality in `PickparcelBD_old` inside `PickparcelBD_new`, using a maintainable interface and backend. Preserve intended business behavior, existing identities, parcel history, financial records and relevant mobile integrations. Verify the replacement before moving production traffic.

The proposed stack is Next.js with TypeScript for the web interface, Laravel for the API and jobs, and the existing MariaDB database technology. The recommended initial hosting arrangement is a separate Next.js host and the Laravel backend on the existing cPanel account, subject to deployment checks.

## Documentation map

| Document | Purpose |
| --- | --- |
| [Current implementation status](implementation-status.md) | Delivered local code, checks and outstanding work |
| [Implementation plan](implementation-plan.md) | Phases, dependencies, deliverables and completion gates |
| [Legacy action map](legacy-action-map.md) | Cross-reference for 96 inspected legacy actions and deliberate redesigns |
| [Feature inventory](feature-inventory.md) | Existing capabilities and the parity checklist |
| [Architecture](architecture.md) | Application boundaries, authentication, data and hosting decisions |
| [Folder structure](folder-structure.md) | Proposed repository layout and naming conventions |
| [Database migration](database-migration.md) | Schema discovery, identifiers, migration and reconciliation |
| [Roles and permissions](roles-permissions.md) | Authorization model and access verification |
| [Parcel lifecycle](parcel-lifecycle.md) | Booking, assignments, verification, handovers and returns |
| [Financial rules](financial-rules.md) | COD, commissions, settlements, wallets and integrity checks |
| [API design](api-design.md) | Proposed API conventions and endpoint groups |
| [Mobile and legacy compatibility](mobile-compatibility.md) | Android, FCM, OAuth, public URLs and existing files |
| [Testing and acceptance](acceptance-checklist.md) | Meaningful tests, user journeys and release criteria |
| [Decisions and risks](decisions-risks.md) | Evidence, assumptions and unresolved decisions |
| [Deployment plan](deployment/plan.md) | Environments, cPanel prerequisites, jobs and CI/CD |
| [Production runbook](deployment/production-runbook.md) | Future release, validation and rollback procedure |

## Evidence and limits

The plan is based on static inspection of the supplied PHP source and read-only inspection of cPanel. The source contains 14 PHP files, approximately 24,000 lines in total. `index.php` has approximately 17,000 lines and combines request handling, SQL, HTML, CSS and JavaScript. No standalone automated test suite or SQL schema export was found in the supplied directory; administrative test and audit actions do exist in `superadmin.php`.

Read-only cPanel metadata inspection found 61 legacy tables; no production rows were copied or imported. The APK has not been reverse engineered or tested, and Android source was not supplied. The private FCM worker was inspected read-only through cPanel; its data-only Android payload has been preserved. No performance capacity claim or financial correctness certification follows from this review.

The original planning checklists remain release criteria. An unchecked item must not be treated as verified; the current status document records actual implementation evidence. Proposed paths, model names and endpoint names may change after discovery; the required business capabilities remain tracked in the inventory.

## Working constraints

- Keep the old application available while the replacement is built.
- Use separate staging data and file storage; development must not mutate production.
- Never commit credentials, production database dumps, private payment proofs, logs or generated dependencies.
- Keep parcel and financial mutations authoritative in one backend implementation per migrated workflow.
- Record intentional behavior changes instead of silently reproducing or changing suspected defects.
- Make production changes only following the user's explicit deployment instruction.

## First implementation milestone

Finish the source-to-feature map, inspect the database structure and missing dependencies, and turn each feature family into actionable acceptance cases. Then scaffold the applications and build the shared authentication and permission foundation.

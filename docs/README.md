# PickParcelBD documentation

Planning date: 18 October 2026 (Asia/Dhaka).

Status: the replacement application is implemented locally with a separate development database. The separate cPanel staging frontend and API are active. See [staging deployment](deployment/cpanel-staging.md) for the manual-upload procedure and remaining verification. See [implementation status](project/implementation-status.md) for verified workflows, outstanding parity work and production prerequisites, and [the old/new comparison](features/old-vs-new-feature-comparison.md) for confirmed feature gaps. The GitHub CI workflow has run; its latest result is available in repository Actions. Production data migration and deployment have not occurred.

## Objective

Rebuild the functionality in `PickparcelBD_old` inside `PickparcelBD_new`, using a maintainable interface and backend. Preserve intended business behavior, existing identities, parcel history, financial records and relevant mobile integrations. Verify the replacement before moving production traffic.

The proposed stack is Next.js with TypeScript for the web interface, Laravel for the API and jobs, and the existing MariaDB database technology. The owner selected cPanel for both Next.js and Laravel, with a separate staging MariaDB database. Runtime and resource limits are recorded in the staging deployment guide.

## Start here

Read [current implementation status](project/implementation-status.md) for delivered work and verification evidence, then [the old vs new comparison](features/old-vs-new-feature-comparison.md) for the remaining feature gaps.

## Directory guide

```text
docs/
├── README.md          # Documentation index
├── project/           # Plans, current status, risks and acceptance criteria
├── architecture/      # System/API design, permissions, source attribution and layout
├── features/          # Feature inventory, comparison and business workflows
├── migration/         # Legacy mapping, database migration and mobile compatibility
└── deployment/        # Hosting plan and production release runbook
```

Keep new documents in the matching directory and add them to this index. Keep implementation evidence in the status document and feature gaps in the comparison; planning documents describe intended work and release criteria.

## Project

| Document | Purpose |
| --- | --- |
| [Current implementation status](project/implementation-status.md) | Delivered local code, checks and outstanding work |
| [Implementation plan](project/implementation-plan.md) | Phases, dependencies, deliverables and completion gates |
| [Decisions and risks](project/decisions-risks.md) | Evidence, assumptions and unresolved decisions |
| [Testing and acceptance](project/acceptance-checklist.md) | Deferred test cases, user journeys and release criteria |

## Architecture

| Document | Purpose |
| --- | --- |
| [Architecture](architecture/architecture.md) | Application boundaries, authentication, data and hosting decisions |
| [Google authentication](architecture/authentication.md) | Signup/login flow, private configuration, callback mismatch blocker and verification evidence |
| [API design](architecture/api-design.md) | Proposed API conventions and endpoint groups |
| [Folder structure](architecture/folder-structure.md) | Proposed application layout and current documentation organization |
| [Roles and permissions](architecture/roles-permissions.md) | Authorization model and access verification |
| [Data sources](architecture/data-sources.md) | Attribution and origins of bundled data, assets and reference material |

## Features

| Document | Purpose |
| --- | --- |
| [Feature inventory](features/feature-inventory.md) | Existing capabilities and the parity checklist |
| [Old vs new feature comparison](features/old-vs-new-feature-comparison.md) | Implemented workflows, nine confirmed gaps, pending integrations and priorities |
| [Parcel lifecycle](features/parcel-lifecycle.md) | Booking, assignments, verification, handovers and returns |
| [Financial rules](features/financial-rules.md) | COD, commissions, settlements, wallets and integrity checks |

## Migration

| Document | Purpose |
| --- | --- |
| [Database migration](migration/database-migration.md) | Schema discovery, identifiers, migration and reconciliation |
| [Legacy action map](migration/legacy-action-map.md) | Cross-reference for 96 inspected legacy actions and deliberate redesigns |
| [Mobile and legacy compatibility](migration/mobile-compatibility.md) | Android, FCM, OAuth, public URLs and existing files |

## Deployment

| Document | Purpose |
| --- | --- |
| [Staging database](deployment/staging-database.md) | Staging schema, database users and private connection settings |
| [cPanel staging deployment](deployment/cpanel-staging.md) | Manual artifact upload, runtime settings, caches and scheduler |
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

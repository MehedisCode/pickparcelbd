# Future production release and rollback runbook

Status: procedure outline. Exact paths, commands, hosts and release identifiers must be filled in and rehearsed after implementation. This document is not authorization to deploy or mutate production.

## Release prerequisites

- Explicit user instruction to perform the production deployment.
- Identified tested commit and immutable release artifacts for frontend/backend.
- Completed acceptance evidence, compatibility checks and migration reconciliation rehearsal.
- Verified runtime, document root, credentials, deployment transport and file permissions.
- Successful backup/restore rehearsal and an accessible fresh backup.
- Reviewed migration list, schema compatibility and rollback limits.
- Confirmed treatment of legacy sessions, notifications, active transfers/rides and uploads.
- Defined validation owner, observation period and conditions to halt/revert.

## Before the switch

1. Record current code version, runtime, routes, cron configuration and database schema version.
2. Take database/file/configuration backups with restricted access; verify completion and restoration procedure.
3. Pause or otherwise control production writes for the selected cutover strategy.
4. Stop competing old/new notification or migration processes without losing pending work.
5. Perform final data/file synchronization and record the source snapshot/time.
6. Reconcile counts, identifiers, custody and financial totals. Halt on unexplained discrepancies.
7. Stage release files and persistent configuration outside the public document directory.
8. Apply only the reviewed migrations necessary for that release; inspect results.

## Switch and verify

1. Activate backend/frontend releases in the rehearsed compatible order.
2. Verify health, session/CSRF behavior, public pages and private authorization.
3. Verify tracking, uploads, queue/scheduler execution and notification configuration.
4. Use safe predefined smoke checks; never create an uncontrolled live wallet/settlement fixture.
5. Enable production writes only when the selected migration procedure allows it safely.
6. Monitor request failures, job failures, resource usage, latency, custody conflicts and financial discrepancy alerts.
7. Record deployed commit, schema version, migration report, checks and any known limitations.

## Halt/revert conditions

- Unexplained wallet, collection, commission or custody discrepancy.
- Unauthorized access, private document exposure or session isolation failure.
- Failed migrations, missing critical files or broken core mobile/public entry points.
- Sustained resource faults/errors preventing essential workflows.
- Old/new workers competing or producing duplicate delivery effects.

## Rollback procedure

1. Control writes and stop conflicting workers while assessing the failure.
2. Identify whether the previous application can read the current schema and newly written records.
3. If compatible, restore the previous application release/configuration using the rehearsed mechanism.
4. Preserve and reconcile legitimate transactions accepted after the switch.
5. Do not blindly restore a pre-release database over new business activity. Choose a controlled repair, forward fix or explicit recovery procedure based on the data written.
6. Recheck access, custody, money, files and jobs before reopening writes.
7. Document the incident, affected operations and follow-up corrections.

Database rollback and application rollback are different operations. An application rollback must not silently undo delivered parcels, accepted rides or settled money.

## Post-release completion

Retain the old code and required backups until the observation/retention decision is made. Remove compatibility code, old schema columns or legacy workers only in a later planned change after usage and rollback dependencies are reviewed. Update the feature inventory and operations documentation to describe the delivered state.

# cPanel staging database

Provisioning date: 18 October 2026. The owner selected a staging database for a future cPanel-hosted Laravel backend. The Ubuntu app continues to use its existing local SQLite database.

## Current state

| Item | Verified value/state |
| --- | --- |
| Database | `kinboame_pp_staging`, created through cPanel Manage My Databases |
| Server | MariaDB 11.4.13, on the cPanel host |
| Future backend connection | `localhost`, port `3306`; no remote access rule added |
| Database/table collation | `utf8mb4_unicode_ci` |
| Tables | 41, all InnoDB and UTF-8 (`utf8mb4`) |
| Constraints | 63 foreign keys, 23 unique indexes excluding primary keys |
| Laravel migration history | All six current migrations recorded in batch 1 |
| Application records | No seed or legacy import; `users` and `parcels` each verified empty |
| Dedicated accounts/grants | Owner created both users; cPanel privilege settings verified as listed below |
| Backend deployment/connection | Pending; no staging backend is deployed or connected |

The existing production database `kinboame_pickparcelbd` and its database user were not modified. No production rows, local preview accounts, Google secrets or private uploads were imported.

## Schema provenance

The schema was generated offline using the installed Laravel MariaDB grammar and each versioned migration's `up()` method. The exporter used a dry-run connection whose PDO factory rejects actual database connections. It included Laravel's migration repository and six migration records, without running seeders. phpMyAdmin imported it into the confirmed empty staging database, reporting **176 queries successfully executed**. Foreign-key checks remained enabled.

The imported SQL SHA-256 is `a85e84d0500efd97154b0ba685e61f1f48e90ce8d5926f4d49acea6c1c2ca587`. The temporary SQL file is not the schema source and is not committed; `backend/database/migrations/` remains authoritative. Do not re-import this initial SQL into the populated staging database.

Applied migrations:

- `0001_01_01_000000_create_users_table`
- `0001_01_01_000001_create_cache_table`
- `0001_01_01_000002_create_jobs_table`
- `2026_10_18_000001_create_business_tables`
- `2026_10_18_000002_record_return_accountability`
- `2026_10_18_000003_record_custody_lists`

Read-only queries against staging and `information_schema` verified table/engine/collation/constraint counts, six migration records and empty users/parcels. This verifies the schema on MariaDB; it does not verify application connectivity, runtime permissions, concurrent parcel/financial operations or a backup restoration.

## Dedicated database users

The owner created both users through **cPanel → Manage My Databases**. For future accounts, use this interface, so cPanel maintains account/database ownership and backup mappings. The owner must generate, enter, confirm and submit strong unique passwords in cPanel, and retain them in a private password manager. Do not paste passwords into chat or documentation.

Verified accounts, both listed only under `kinboame_pp_staging` in cPanel:

| Purpose | cPanel suffix → full username | Privileges |
| --- | --- | --- |
| Laravel web requests, queue and scheduler | `pp_stg_app` → `kinboame_pp_stg_app` | SELECT, INSERT, UPDATE, DELETE |
| Reviewed deployment migrations | `pp_stg_mig` → `kinboame_pp_stg_mig` | SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES |

Do not select ALL PRIVILEGES or GRANT OPTION. The migration account can change or drop staging tables; keep its credentials separate from the running application's `.env` and use it only for reviewed deployments. Do not attach either account to production. The owner applied the grants. Read-only inspection of each cPanel privileges page confirmed exactly the permissions listed above, with ALL PRIVILEGES and all other displayed options unchecked. The production database lists only its original user. No passwords were inspected, copied or changed during verification. Actual authentication and effective runtime behavior still await backend deployment.

## Backend configuration when hosting is ready

Use `backend/.env.staging.example` as a template **on the future cPanel backend**. Its secrets and URLs are deliberately blank. Do not copy it over Ubuntu's working `.env`.

1. Select staging frontend/API hostnames and configure HTTPS and the backend's `public/` document root. Verify supported PHP web/CLI versions and `pdo_mysql` before deployment.
2. Keep the backend `.env` outside the public document root and Git, with access restricted to the account owner. Add the runtime database password privately. Generate one staging APP_KEY and preserve it between releases; do not reuse the local/production key.
3. Fill APP_URL, FRONTEND_URL, OAuth callback and cookie/stateful domains for the selected hostnames. Keep APP_DEBUG=false and PREVIEW_LOGIN=false. Use separate staging cookie/storage paths. Do not enable the app while required settings are blank.
4. With the migration user's private deployment environment, run `php artisan migrate:status`, review pending migrations, and apply approved changes using `php artisan migrate --force`. The six migrations above should already appear as applied. Never use `migrate:fresh`, `db:wipe`, or the development seeder on this database.
5. Build configuration caches using the runtime account configuration, then verify session creation, signup/login, jobs and ordinary application writes. Confirm the runtime account cannot CREATE/ALTER/DROP tables and neither dedicated account can access production. This validation remains pending.

No externally accessible database connection is needed for a backend hosted beside MariaDB. Remote database access and wildcard host grants were not added.

## Backups and operations before staging use

Confirm that the hosting backup service includes the new database, its retention and off-host recovery options. Make a protected backup before each schema/data migration and rehearse a restore into a separate disposable database. Backup coverage and restore success are **not yet verified**. Never store SQL dumps under a public document root or commit them.

Keep queue processing bounded for the host's limits, monitor failed jobs and database size, and validate financial workflows/concurrency on staging before any production cutover. Existing production cron and runtime settings remain unchanged.

Reference: [cPanel Manage My Databases](https://docs.cpanel.net/cpanel/databases/manage-my-databases/).

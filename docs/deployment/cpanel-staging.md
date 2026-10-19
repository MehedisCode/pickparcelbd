# Manual cPanel upload

The owner selected a simple layout. GitHub Actions builds an artifact; it does **not** deploy. Server settings for the new layout must be verified in cPanel before removing old files. Repository cleanup does not delete cPanel files, alter domains, or change cron jobs.

| Part | Location/settings |
| --- | --- |
| Frontend | `/home/kinboame/pickparcel-staging-simple/frontend/runtime` |
| Node launcher | `/home/kinboame/pickparcel-staging-simple/frontend/app.js` |
| Frontend document root | `/home/kinboame/pickparcel-staging-simple/frontend/public` |
| Backend | `/home/kinboame/pickparcel-staging-simple/backend` |
| API document root | `/home/kinboame/pickparcel-staging-simple/backend/public` |
| Node / PHP | Node 24 Production / PHP 8.4 for both web and CLI |
| Frontend / API | `https://staging.pickparcelbd.com` / `https://staging-api.pickparcelbd.com` |

## Updating code

1. Commit and push changes to `staging`. In GitHub Actions, open **Build staging artifact** and wait for its build to succeed. **Build and source checks** is a separate workflow without release artifacts.
2. Download `staging-<commit>`. Extract the outer ZIP, then the inner `staging-release.tar.gz` on your computer. The SHA256 file checks the inner archive. The archive has `frontend/runtime`, `backend`, and `release.json`.
3. Back up the current application and database privately. Pause staging while replacing files to avoid serving a mixture of versions. Review/remove obsolete code files from the old version, preserving the private data below.
4. Frontend change: replace the contents of the server's `frontend/runtime` with the artifact's `frontend/runtime`. Include hidden `.next`, its `static` folder, `public`, and bundled `node_modules`. Preserve the outer `app.js`, `public/.htaccess`, and cPanel Node environment. Restart only the staging Node application.
5. Backend change: upload the artifact's `backend` contents into the server backend folder. Preserve `.env`, `storage`, and any cPanel-managed `public/.htaccess` handler settings. The artifact excludes credentials, storage, databases and cached PHP configuration.
6. Run the backend commands below; stop on errors. Verify any pending migrations separately before activating incompatible code. Never run `migrate:fresh`, `db:wipe` or the development seeder against staging.
7. Check `/`, `/login`, `/deployment-check`, API `/up`, and Google login. The deployment-check screen should fetch a fresh Bangladesh timestamp when **Check again** is clicked. Keep production `public_html`, its database and original FCM cron unchanged.

Run in cPanel Terminal for a backend upload:

```bash
cd /home/kinboame/pickparcel-staging-simple/backend
mkdir -p resources/views bootstrap/cache storage/app/private storage/app/public
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs
chmod -R 750 storage bootstrap/cache
chmod 600 .env
/opt/cpanel/ea-php84/root/usr/bin/php artisan config:clear
/opt/cpanel/ea-php84/root/usr/bin/php artisan route:clear
/opt/cpanel/ea-php84/root/usr/bin/php artisan package:discover
/opt/cpanel/ea-php84/root/usr/bin/php artisan migrate:status
/opt/cpanel/ea-php84/root/usr/bin/php artisan config:cache
/opt/cpanel/ea-php84/root/usr/bin/php artisan route:cache
/opt/cpanel/ea-php84/root/usr/bin/php artisan view:cache
```

Run commands individually and stop on failure. Pending schema changes need a reviewed database backup and the dedicated migration user; keep the runtime account's restricted privileges. Preserve APP_KEY between uploads. Database details are in [staging database](staging-database.md).

## Frontend launcher

The server's outer `frontend/app.js` should contain:

```javascript
process.env.NODE_ENV = "production";
process.env.HOSTNAME = "127.0.0.1";
process.env.BACKEND_URL = "https://staging-api.pickparcelbd.com";
process.env.NEXT_PUBLIC_SITE_URL = "https://staging.pickparcelbd.com";
require("./runtime/server.js");
```

Register that outer frontend folder in **Setup Node.js App**, startup `app.js`, URL `staging.pickparcelbd.com` with no extra path. Keep `NODE_OPTIONS=--max-old-space-size=256` if already configured. Let cPanel manage PORT. No npm install is needed for this standalone artifact. If an old registration has a missing Node environment, repair/recreate only staging registration through the panel/provider; do not delete unrelated files.

## Scheduler and old installation

Before removing `/home/kinboame/pickparcel-staging`, verify the Node registration, domain document roots, private `.env`, uploads and staging cron no longer depend on it. The previously installed scheduler points at that old directory; it needs a reviewed update to the new backend path. Do not remove old files or edit the production FCM cron as part of a code upload. The production migration/rollback criteria remain in [production runbook](production-runbook.md).

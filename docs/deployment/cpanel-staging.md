# cPanel staging deployment

Date: 18 October 2026. Status: **staging frontend and API activated with owner confirmation; Google account chooser reached; owner-completed sign-in pending**.

## Hosts and boundaries

| Service | Address | Runtime |
| --- | --- | --- |
| Next.js | `https://staging.pickparcelbd.com` | cPanel Node.js Selector, Node 24.21.0, Production mode |
| Laravel | `https://staging-api.pickparcelbd.com` | PHP 8.4.26, Laravel 13.37.0 |
| Database | `kinboame_pp_staging` on `localhost:3306` | MariaDB 11.4.13; see [database setup](staging-database.md) |

The owner selected hosting both applications in cPanel. Their CPU/memory quotas are shared with the original website; separate folders and database users do not provide resource isolation. Next.js was built on Ubuntu, not in the account's 1 GB memory allowance. The Node app has a 256 MB V8 old-space limit; this does not cap total native/process memory.

The main website retains `/home/kinboame/public_html`, its production database/user, PHP configuration and existing cron entries. Its homepage returned HTTP 200 after staging preparation. Its `.htaccess` checksum remained `fcc53bbd3b097b34b29968c8292da0b8e2bf05980604c7cc5f6da7e75a5d2973`. This check does not certify every production workflow.

## Server layout

```text
/home/kinboame/pickparcel-staging/
├── incoming/                         # Private uploaded archives/helpers
├── releases/20261018-b14733f/
│   ├── release.json                  # Source/build provenance, no secrets
│   ├── backend/
│   │   ├── public/                   # API document root, PHP 8.4 handler
│   │   ├── deployment-index.php      # Original Laravel entry point, held for activation
│   │   ├── .env -> shared/backend.env
│   │   ├── storage -> shared/backend-storage
│   │   └── vendor/                   # Locked production dependencies, no Pint
│   └── frontend/
│       ├── app.js                    # Passenger launcher with maintenance guard
│       ├── deployment.hold           # Keeps the running process in HTTP 503 mode
│       ├── public/                   # Frontend document root / maintenance page
│       └── runtime/                  # Next.js standalone build + public/static assets
├── current -> releases/20261018-b14733f
└── shared/
    ├── backend.env                   # Private persistent settings; mode 0600
    ├── google-client.json            # Owner-approved private OAuth configuration; mode 0600
    └── backend-storage/               # Persistent private/public uploads and logs
```

Symlink targets above are under `/home/kinboame/pickparcel-staging/shared/`. Both cPanel document roots and the Node application root use the **physical release path**, not `current`. Initial symlink-root checks were inconsistent on this LiteSpeed host. The `current` link is a CLI convenience; changing it alone does not deploy a new web release. Future releases must update the two staging document roots and the existing Node application's root, then restart and verify it.

## Build and upload evidence

The source application commit is `b14733f1f960acc9b06f999f35c27e996c15553f`. The deployment configuration/templates and maintenance launcher are subsequent local changes, not included in that commit.

- An isolated temporary frontend copy built with `BACKEND_URL=https://staging-api.pickparcelbd.com` and `NEXT_PUBLIC_SITE_URL=https://staging.pickparcelbd.com`.
- Production build and TypeScript compilation passed. A temporary standalone process returned HTTP 200 for `/login` with the expected application markup, then was stopped.
- Standalone output includes its required dependencies, `.next/static` and `public` assets. The cPanel app root contains a launcher; the generated server and its dependencies live under `runtime/`, avoiding a physical `node_modules` directory at the CloudLinux-managed app root.
- Backend dependencies were prepared from the lockfile with `--no-dev --optimize-autoloader --no-scripts`. Package discovery subsequently succeeded on cPanel. PHP CLI and the web maintenance response both verified PHP 8.4.26; bcmath, pdo_mysql, mbstring, openssl, fileinfo, curl, dom and xml were available.
- Uploaded initial archive: `pickparcel-staging-20261018-b14733f.tar.gz`, 26,254,293 bytes, SHA-256 `dfb4148c22a03621766a55f972988d9d9d744a2a4f89235f84705d5851a31dd9`. The server verified this checksum before extraction.
- A subsequent maintenance-control archive installed the guarded launcher and an API maintenance entry point. cPanel-generated domain/Passenger configuration and shared storage/environment links are server-specific additions.
- The application archives excluded local `.env` files, SQLite databases, logs, private uploads and seeded data. Google credential transfer was separately authorized by the owner; it must remain private and outside Git.

## Current verification and holds

Both new hostnames resolve to the cPanel server. cPanel reports Let's Encrypt coverage for both, and HTTPS checks passed certificate validation. Staging-only HTTPS redirect switches were enabled; the main domain's switch/configuration was preserved.

Maintenance mode was retired after explicit owner confirmation. Laravel's original public entry point was restored; the old maintenance entry point is preserved outside public. The frontend hold was renamed `deployment.hold.disabled`, its static maintenance page moved to `deployment-maintenance.html` outside public, and Passenger restarted using `frontend/tmp/restart.txt`. Both staging services now serve the application. The launcher sets BACKEND_URL and NEXT_PUBLIC_SITE_URL to the staging hosts for server-side metadata requests. The owner saved the database password through the private CLI helper (exit status 0). The initial connection returned MariaDB error 1045. After the owner reset the runtime user password and saved it privately again, Laravel authenticated successfully to `kinboame_pp_staging`, read all six migration records, and passed SELECT/INSERT/UPDATE/DELETE checks on a temporary cache key inside a transaction that was rolled back. The schema-privileges metadata query returned no rows, so it did not independently establish the complete effective grant set; the cPanel grant-page inspection remains the evidence for the configured permissions. Laravel configuration, route and Blade view caches were then built successfully. No authenticated staging workflow has been verified yet.

The staging `APP_KEY` was generated on the server without displaying it. APP_ENV=staging, APP_DEBUG=false, PREVIEW_LOGIN=false, distinct staging session cookie name, HTTPS cookie settings and hostnames are configured. SESSION_DOMAIN remains unset so cookies are host-only through the Next.js proxy. Ubuntu's `.env`, SQLite database and running preview were not switched.

## Finish activation

1. Save the **existing runtime user** password privately in `shared/backend.env`. The helper `scripts/cpanel-set-db-password.php` can be uploaded outside the public roots and run from the cPanel terminal with echo disabled. It reads stdin, checks the target database/user, quotes special characters for dotenv, verifies a round trip, and updates only DB_PASSWORD. It never prints the password or parser exception details. The prepared terminal command restores echo after success or interruption. Do not pass the password in command arguments or paste it into chat.
2. Configure the owner-approved Google client privately and add `https://staging.pickparcelbd.com/auth/google/callback` to that same client's Authorized redirect URIs. Preserve the existing local callback. Do not rotate the secret or change audience/publication settings as part of adding the callback.
3. With the runtime user, verify the exact database, migration history, configured session/cache/job storage, connectivity and effective grants. All six existing migrations should already be applied. Do not re-import the initial SQL or run the development seeder. Use the separate migration user privately if future reviewed migrations require DDL.
4. Build configuration/route/view caches using the runtime environment. Confirm storage permissions and both hostnames' HTTPS/cookie/proxy behavior. Keep credentials and keys out of logs/output.
5. After final review and owner confirmation to expose the functional staging apps, restore `backend/deployment-index.php` to `backend/public/index.php`, remove the frontend maintenance page from public serving, retire `frontend/deployment.hold`, and restart only the staging Node app. Keep a reversible hold/entry-point copy outside the public roots for rollback. Recheck health, assets, API proxy, session/CSRF, Google redirects and owner-completed sign-in.
6. Add only the new staging scheduler entry after database verification. Use the PHP 8.4 binary and a staging-only outer lock, for example once per minute: `/usr/bin/flock -n /home/kinboame/pickparcel-staging/shared/scheduler.lock /bin/sh -c 'cd /home/kinboame/pickparcel-staging/current/backend && /opt/cpanel/ea-php84/root/usr/bin/php artisan schedule:run' >> /home/kinboame/pickparcel-staging/shared/backend-storage/logs/scheduler.log 2>&1`. Verify that `flock` exists, cPanel accepts the command and jobs stay within host limits. The staging cron was installed with `/bin/flock` after verifying its presence. The previous crontab was backed up privately and preserved, including the existing production FCM worker entry. An immediate schedule:run completed transfer expiry, presence expiry and the bounded queue worker successfully.

The owner approved copying the existing local Google client credentials into the private cPanel configuration and adding the staging callback. The credentials were imported without displaying their values; the existing APP_KEY and database settings were preserved. Google Cloud Console initially failed to load. The owner subsequently reported saving the staging callback. Clicking the hosted Continue with Google link reached Google's account chooser with the correct staging callback, without redirect_uri_mismatch. Owner-completed authentication and callback/session persistence remain pending.

Owner-completed Google sign-in, backup restoration and financial/concurrency checks remain outstanding. FCM is not configured and no production notification tokens were imported. See [implementation status](../project/implementation-status.md) for feature parity limitations.

References: [Next.js standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output), [CloudLinux Node.js Selector](https://docs.cloudlinux.com/cloudlinuxos/lve_manager/), [Passenger port binding](https://www.phusionpassenger.com/docs/advanced_guides/in_depth/node/reverse_port_binding.html).

## Activation verification

On 18 October 2026, HTTPS requests returned 200 for API `/up` and `/api/v1/config`, frontend `/`, `/login`, and the frontend proxy `/api/v1/config`. The rendered homepage loaded its styling and showed the empty staging catalog. Private Laravel kernel checks returned 200 for session/config/health and 401 for the protected dashboard. The main website returned 200 after following its existing redirect, and `/home/kinboame/public_html/.htaccess` retained SHA256 `fcc53bbd3b097b34b29968c8292da0b8e2bf05980604c7cc5f6da7e75a5d2973`. Production data was not imported or modified.

# PickParcelBD

Next.js 16 / React 19 / TypeScript interface, Laravel 13 API, and MariaDB production database. Development uses a separate SQLite file and fictional accounts. The existing PHP website is untouched.

## Local setup

Use Node.js 24, Composer 2, and PHP 8.4 with BCMath, PDO SQLite/MySQL, Mbstring, Fileinfo, OpenSSL, DOM/XML, Curl and Tokenizer.

From this project directory:

```bash
cd backend
composer install
cp .env.local.example .env
touch database/database.sqlite
php artisan key:generate
php artisan migrate
php artisan db:seed
cd ../frontend
npm ci
cd ..
npm run dev
```

Staging URLs have not been chosen. Open [the local app](http://127.0.0.1:3000) for review. The sign-in page provides fictional seller, buyer, rider, agent and district-admin accounts in local mode. Preview sign-in requires both `APP_ENV=local` and `PREVIEW_LOGIN=true`; it cannot be enabled in production by that flag alone.

On the current workstation, PHP was provisioned in an isolated temporary directory because no system PHP was installed. While that runtime exists, use `PICKPARCEL_PHP=/tmp/pickparcel-runtime/php npm run dev`. For Artisan commands use `/tmp/pickparcel-runtime/php artisan ...`. It is a development convenience, not a deployment dependency.

Use `127.0.0.1` consistently; mixing it with `localhost` creates separate cookie origins. The frontend proxies API, authentication and uploaded-media requests to port 8000.

## Configuration

`backend/.env.example` is the production template. Keep `.env`, service accounts, database copies, private memo documents and storage outside Git. Configure Google OAuth and Firebase credentials separately. The callback must return through the frontend origin, for example `https://pickparcelbd.com/auth/google/callback`.

`frontend/.env.example` documents `BACKEND_URL` and `NEXT_PUBLIC_SITE_URL`. **Set BACKEND_URL before the production build**, because Next.js compiles rewrites into its build. Only public site configuration belongs in `NEXT_PUBLIC_*` variables.

The support phone, email and hours retain the old website's values as requested, including its placeholders. Delivery rates and district commission percentages are configurable from administration.

## Checks and jobs

```bash
npm run check:web
npm run build:web
cd backend
composer validate --strict
vendor/bin/pint --test
php artisan route:list --path=api
php artisan schedule:list
```

No application test suite has been added, as requested. Local workflow checks are documented in [implementation status](docs/implementation-status.md). SQLite checks do not establish MariaDB concurrency behavior.

The scheduler closes expired transfers, expires presence and drains the database queue with bounded workers. Run `php artisan schedule:run` every minute in the deployment environment; `DB_QUEUE_RETRY_AFTER=300` must exceed the job timeout. Do not run the old and new FCM workers against the same notifications during cutover.

## Project map

- `frontend/src/app`: public, customer, operations and administration routes.
- `frontend/src/features`: marketplace, accounts, orders/documents, parcels, transfers, messaging, rides and admin screens.
- `backend/app/Services`: pricing, parcel state, transfers, finance, rides and FCM delivery.
- `backend/database/migrations`: normalized replacement schema; does not alter the legacy database.
- `docs`: architecture, feature inventory, migration, hosting and release plans.
- `.github/workflows/ci.yml`: build, lint, types, syntax, formatting and schema boot checks. It does not deploy. Place this project at the repository root to activate it.

See [current implementation status and remaining work](docs/implementation-status.md) before treating this as a production replacement. Production records have not been imported; Google/FCM live integration, Android device compatibility, migration reconciliation and production release verification remain outstanding.

# PickParcelBD API

Laravel owns authentication, authorization, orders/documents, parcel state/custody, financial ledger operations, rides, notification delivery and administrative recovery.

Use the setup commands in [the project README](../README.md). Start the local API with `php -S 127.0.0.1:8000 -t public public/index.php`; the Next.js development server proxies requests to it. Production serves only `backend/public`, with `.env` and private documents outside the public directory.

`php artisan route:list --path=api` lists the implemented endpoints under `/api/v1`. `php artisan schedule:list` lists bounded background work. `php artisan pickparcel:legacy-schema` reads metadata only from an explicitly configured read-only legacy connection; it does not migrate records.

Fresh migrations create the replacement schema. Never run them against the old application database. Production data import and financial reconciliation are separate pending work described in [implementation status](../docs/project/implementation-status.md).

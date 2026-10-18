> The tree below is the original proposed layout. The implemented tree uses `frontend/src/app`, `frontend/src/features`, `backend/app/Http/Controllers`, `backend/app/Services`, `backend/app/Support`, `backend/app/Console/Commands`, `backend/database/migrations`, `scripts` and `.github/workflows`. No `tests` directory was added, per the user’s instruction. See the project README for actual setup commands.

# Proposed project folder structure

Only `docs/` exists as part of this planning task. The application directories below are future implementation targets. Standard generated framework files will also be present when the applications are scaffolded.

```text
PickparcelBD_new/
├── README.md
├── .gitignore
├── .editorconfig
├── .github/
│   ├── workflows/
│   │   ├── frontend-ci.yml
│   │   ├── backend-ci.yml
│   │   ├── deploy-staging.yml
│   │   └── deploy-production.yml
│   └── pull_request_template.md
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── eslint.config.mjs
│   ├── postcss.config.mjs
│   ├── .env.example
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logos/
│   │   ├── icons/
│   │   ├── images/
│   │   └── downloads/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── globals.css
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   ├── global-error.tsx
│   │   │   ├── not-found.tsx
│   │   │   ├── robots.ts
│   │   │   ├── sitemap.ts
│   │   │   ├── (public)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── products/page.tsx
│   │   │   │   ├── products/[productId]/page.tsx
│   │   │   │   ├── sellers/[publicUserId]/page.tsx
│   │   │   │   ├── tracking/page.tsx
│   │   │   │   ├── tracking/[parcelCode]/page.tsx
│   │   │   │   ├── help/page.tsx
│   │   │   │   └── terms/page.tsx
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── complete-profile/page.tsx
│   │   │   ├── (account)/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── dashboard/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── profile/page.tsx
│   │   │   │       ├── settings/page.tsx
│   │   │   │       ├── products/page.tsx
│   │   │   │       ├── products/new/page.tsx
│   │   │   │       ├── products/[productId]/edit/page.tsx
│   │   │   │       ├── orders/page.tsx
│   │   │   │       ├── orders/[orderId]/page.tsx
│   │   │   │       ├── cash-memos/page.tsx
│   │   │   │       ├── cash-memos/[memoId]/page.tsx
│   │   │   │       ├── parcels/page.tsx
│   │   │   │       ├── parcels/book/page.tsx
│   │   │   │       ├── parcels/[parcelCode]/page.tsx
│   │   │   │       ├── messages/page.tsx
│   │   │   │       ├── messages/[conversationId]/page.tsx
│   │   │   │       ├── notifications/page.tsx
│   │   │   │       ├── wallet/page.tsx
│   │   │   │       ├── following/page.tsx
│   │   │   │       ├── news/page.tsx
│   │   │   │       └── blocked-buyers/page.tsx
│   │   │   ├── (operations)/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── operations/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── assignments/page.tsx
│   │   │   │       ├── pickups/page.tsx
│   │   │   │       ├── deliveries/page.tsx
│   │   │   │       ├── custody/page.tsx
│   │   │   │       ├── transfers/page.tsx
│   │   │   │       ├── transfers/new/page.tsx
│   │   │   │       ├── transfers/receive/page.tsx
│   │   │   │       ├── transfers/[transferId]/page.tsx
│   │   │   │       ├── returns/page.tsx
│   │   │   │       ├── collections/page.tsx
│   │   │   │       ├── commissions/page.tsx
│   │   │   │       └── history/page.tsx
│   │   │   ├── (rides)/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── ride-share/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── driver/page.tsx
│   │   │   │       └── history/page.tsx
│   │   │   └── (admin)/
│   │   │       ├── layout.tsx
│   │   │       └── admin/
│   │   │           ├── page.tsx
│   │   │           ├── users/page.tsx
│   │   │           ├── verifications/page.tsx
│   │   │           ├── members/page.tsx
│   │   │           ├── roles/page.tsx
│   │   │           ├── riders-agents/page.tsx
│   │   │           ├── parcels/page.tsx
│   │   │           ├── collections/page.tsx
│   │   │           ├── commission-rules/page.tsx
│   │   │           ├── settlements/page.tsx
│   │   │           ├── wallets/page.tsx
│   │   │           ├── reconciliation/page.tsx
│   │   │           ├── audits/page.tsx
│   │   │           ├── recovery/page.tsx
│   │   │           └── reports/page.tsx
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── profiles/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── cash-memos/
│   │   │   ├── parcels/
│   │   │   ├── tracking/
│   │   │   ├── assignments/
│   │   │   ├── custody/
│   │   │   ├── transfers/
│   │   │   ├── returns/
│   │   │   ├── collections/
│   │   │   ├── commissions/
│   │   │   ├── settlements/
│   │   │   ├── wallets/
│   │   │   ├── messaging/
│   │   │   ├── notifications/
│   │   │   ├── presence/
│   │   │   ├── social/
│   │   │   ├── buyer-blocking/
│   │   │   ├── fraud-checks/
│   │   │   ├── locations/
│   │   │   ├── ride-share/
│   │   │   ├── administration/
│   │   │   └── reports/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── layouts/
│   │   │   ├── navigation/
│   │   │   ├── forms/
│   │   │   ├── tables/
│   │   │   ├── feedback/
│   │   │   └── media/
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   │   ├── browser-client.ts
│   │   │   │   ├── server-client.ts
│   │   │   │   └── errors.ts
│   │   │   ├── auth/
│   │   │   ├── config/
│   │   │   ├── formatting/
│   │   │   └── validation/
│   │   ├── hooks/
│   │   ├── providers/
│   │   ├── types/
│   │   └── locales/
│   │       ├── bn/
│   │       └── en/
│   └── tests/
│       ├── components/
│       └── e2e/
│           ├── authentication.spec.ts
│           ├── marketplace.spec.ts
│           ├── parcel-lifecycle.spec.ts
│           ├── transfers-returns.spec.ts
│           ├── financial-settlement.spec.ts
│           ├── messaging.spec.ts
│           ├── ride-share.spec.ts
│           └── permissions.spec.ts
├── backend/
│   ├── artisan
│   ├── composer.json
│   ├── composer.lock
│   ├── phpunit.xml
│   ├── .env.example
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Auth/
│   │   │   │   ├── Compatibility/
│   │   │   │   └── Api/V1/
│   │   │   │       ├── PublicApi/
│   │   │   │       ├── Account/
│   │   │   │       ├── Marketplace/
│   │   │   │       ├── Orders/
│   │   │   │       ├── Parcels/
│   │   │   │       ├── Operations/
│   │   │   │       ├── Finance/
│   │   │   │       ├── Messaging/
│   │   │   │       ├── Notifications/
│   │   │   │       ├── Social/
│   │   │   │       ├── RideShare/
│   │   │   │       └── Admin/
│   │   │   ├── Requests/
│   │   │   ├── Resources/
│   │   │   └── Middleware/
│   │   ├── Models/
│   │   ├── Services/
│   │   ├── Policies/
│   │   ├── Enums/
│   │   ├── Exceptions/
│   │   ├── Events/
│   │   ├── Listeners/
│   │   ├── Notifications/
│   │   ├── Jobs/
│   │   │   ├── SendPushNotification.php
│   │   │   ├── ExpireParcelTransfers.php
│   │   │   ├── ReverseGeocodeLocation.php
│   │   │   ├── GenerateReport.php
│   │   │   └── RunReconciliation.php
│   │   ├── Integrations/
│   │   │   ├── Google/
│   │   │   ├── Firebase/
│   │   │   ├── Geocoding/
│   │   │   └── Media/
│   │   ├── Console/Commands/
│   │   │   ├── ImportLegacyData.php
│   │   │   ├── VerifyLegacyImport.php
│   │   │   └── AuditFinancialIntegrity.php
│   │   └── Providers/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   ├── factories/
│   │   ├── seeders/
│   │   └── schema/
│   ├── routes/
│   │   ├── web.php
│   │   ├── api.php
│   │   ├── console.php
│   │   └── api/v1/
│   │       ├── public.php
│   │       ├── account.php
│   │       ├── marketplace.php
│   │       ├── orders.php
│   │       ├── parcels.php
│   │       ├── operations.php
│   │       ├── finance.php
│   │       ├── messaging.php
│   │       ├── notifications.php
│   │       ├── social.php
│   │       ├── ride-share.php
│   │       └── admin.php
│   ├── public/
│   │   ├── index.php
│   │   └── .htaccess
│   ├── resources/views/
│   │   ├── documents/
│   │   └── mail/
│   ├── lang/
│   │   ├── bn/
│   │   └── en/
│   ├── storage/
│   │   ├── app/
│   │   │   ├── private/
│   │   │   │   ├── cash-memos/
│   │   │   │   ├── payment-proofs/
│   │   │   │   ├── reports/
│   │   │   │   └── imports/
│   │   │   └── public/
│   │   │       ├── products/
│   │   │       └── profiles/
│   │   ├── framework/
│   │   └── logs/
│   └── tests/
│       ├── Unit/
│       ├── Feature/
│       └── Integration/
│           ├── ConcurrentParcelTransferTest.php
│           ├── ConcurrentRideAcceptanceTest.php
│           ├── DuplicateWalletCreditTest.php
│           └── LegacyDataIntegrityTest.php
├── docs/
│   ├── README.md
│   ├── implementation-plan.md
│   ├── feature-inventory.md
│   ├── architecture.md
│   ├── folder-structure.md
│   ├── database-migration.md
│   ├── roles-permissions.md
│   ├── parcel-lifecycle.md
│   ├── financial-rules.md
│   ├── api-design.md
│   ├── mobile-compatibility.md
│   ├── acceptance-checklist.md
│   ├── decisions-risks.md
│   ├── api/openapi.yaml                 # Future contract
│   └── deployment/
│       ├── plan.md
│       └── production-runbook.md
└── deployment/
    ├── backend/
    │   ├── deploy.sh
    │   ├── health-check.sh
    │   └── rollback.sh
    ├── frontend/README.md
    └── examples/
        ├── backend.env.example
        ├── frontend.env.example
        └── cron.example
```

## Feature internals

Create subdirectories when the feature needs them, rather than populating empty folders for every possible layer:

```text
frontend/src/features/parcels/
├── components/
│   ├── parcel-booking-form.tsx
│   ├── parcel-details.tsx
│   ├── parcel-status-badge.tsx
│   └── parcel-table.tsx
├── api/parcels.ts
├── hooks/use-parcels.ts
├── schemas/booking.ts
├── types/index.ts
└── utils/parcel-code.ts
```

Backend model groups: Accounts, Marketplace, Orders, Parcels, Finance, Messaging, Notifications, Social, RideShare and Auditing. Exact class/table names depend on schema discovery.

Backend service groups: Accounts, Marketplace, Orders, CashMemos, Parcels, Assignments, Custody, Transfers, Returns, Collections, Commissions, Settlements, Wallets, Reconciliation, Messaging, Notifications, Presence, Social, FraudChecks, Locations, RideShare, Auditing, Recovery and Reporting.

Requests, resources, policies and tests can use matching feature groups as they grow. Avoid creating a layer that only forwards the same arguments to another layer without a useful responsibility.

## Conventions

- Route groups in parentheses organize Next.js layouts and do not appear in URLs.
- Backend `PublicApi` avoids using the PHP reserved word `public` as a namespace segment.
- Keep a single dependency lockfile per application; use the package manager chosen during setup.
- Only Laravel's `public/` directory is the backend document root.
- Keep private uploads outside public storage and return them through authorized endpoints.
- Keep `.env`, dependencies, generated builds, logs and production data out of Git. Environment examples contain placeholders only.
- A `.cpanel.yml` file is optional if cPanel Git deployment is selected; it is not required for the proposed external CI artifact deployment approach.

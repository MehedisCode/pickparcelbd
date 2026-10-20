# PickParcelBD frontend

This Next.js app provides the refreshed, mobile-first marketplace. It uses the Laravel API in `../backend/`.

## Run locally

From the project root, with the existing backend setup complete:

```bash
cd frontend
npm ci
cd ..
npm run dev
```

Open <http://127.0.0.1:3000>. The root `dev` command starts both Next.js and Laravel. Stop a previous server on ports 3000 or 8000 before starting it.

For a frontend-only start, run `npm run dev` inside `frontend/` while the Laravel API is available at `127.0.0.1:8000`. Configure `BACKEND_URL` before building for another environment; see `.env.example`.

## Design and functionality

The new home screen uses a one-column product feed on phones, a compact composer, seller cards, search, category and price sorting, follow, add-to-cart, messaging, share links, parcel booking, and bottom navigation. Products, prices, seller names, verification, and images come from Laravel. It does not show invented seller counts or sample products as real data. The followed-sellers tab uses the backend's `following=1` filter and requires sign-in.

All existing public, buyer, seller, rider, agent, and admin routes are carried into V2, including Google login, product posting and editing, checkout, parcel lifecycle, transfers, finance, messages, rides, tracking, and administration. The shared styling has been updated to the teal, orange, and light neutral design. Functionality still depends on the existing API and configured integrations; UI availability alone is not proof that every external service is configured.

The supplied Stitch HTML was a visual reference. Its demo toasts, fake counts, sample seller data, camera search, and product-like controls have not been treated as backend features. The local SQLite database currently has no products; create a real listing through the existing product form to see a populated feed.

## Code organization and styling

- `src/app/` contains Next.js route files and layouts. Route files should stay thin and render a feature screen.
- `src/features/` contains product behavior grouped by domain. Multi-screen domains use a `screens/` folder; the marketplace has separate `catalog/` and `feed/` modules.
- `src/components/ui/` contains shared controls, forms, feedback, and dialogs. `src/components/shell/` contains the public and workspace shells.
- `src/lib/` contains API, types, localization, and navigation helpers; `src/hooks/` contains reusable React hooks. Translation catalogs live in `src/messages/`.
- `src/styles/theme.css` is the source of color, font, and shadow tokens. `src/app/globals.css` imports the Tailwind v4 runtime and the feature-specific stylesheets in cascade order.

Tailwind utilities are available in every route and component. Use theme utilities such as `bg-brand-green`, `text-brand-ink`, `border-brand-line`, and `font-sans` for new UI. Existing semantic CSS lives in `@layer components`, so a Tailwind utility on an element can intentionally override a component default. Repeated patterns may use `@apply` in the relevant stylesheet; responsive and print rules remain in their own files. Keep API behavior in feature modules and avoid adding data or business logic to route files.

The older pages retain their existing semantic CSS while they are migrated. This organization makes Tailwind usable across the app without changing their layout or backend behavior during a folder refactor. No new runtime packages were required.

## Build and deployment

```bash
npm run check:web
npm run build:web
```

These commands run from the project root. The staging artifact workflow packages this `frontend/` directory. The hosted staging site changes only after a new artifact is built and manually uploaded in cPanel. If the frontend origin changes, update `FRONTEND_URL`, `GOOGLE_REDIRECT_URI`, Google OAuth's authorized callback, and the frontend site URL together. Preserve the backend `.env`, storage, and database during deployment.

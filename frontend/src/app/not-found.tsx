import Link from "next/link";
export default function NotFound() {
  return (
    <main className="not-found">
      <span className="eyebrow">404 · OFF THE ROUTE</span>
      <h1>This parcel took a wrong turn.</h1>
      <p>The page you’re looking for isn’t here.</p>
      <Link className="button primary" href="/">
        Back to home
      </Link>
    </main>
  );
}

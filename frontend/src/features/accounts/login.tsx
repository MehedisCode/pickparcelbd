"use client";
import { useAction, useSession } from "@/components/providers";
import { PublicFooter, PublicHeader } from "@/components/shell";
import { Button } from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/lib/api";
import { CheckCircle2, Package, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginScreen() {
  const { session, reload } = useSession();
  const { data } = useResource<{ google_available: boolean }>("/config");
  const { run, busy } = useAction();
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("return") || "/dashboard";
  const target =
    raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("\\")
      ? raw
      : "/dashboard";
  return (
    <>
      <PublicHeader />
      <main className="login-page">
        <section className="login-story">
          <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>
            A small business.
            <br />A big dream.
            <br />
            <em>
              A little help
              <br />
              along the way.
            </em>
          </h1>
          <p>
            Your marketplace, delivery network, and business workspace. All
            connected.
          </p>
          <div className="login-benefit">
            <Package size={20} />
            <span>Book and track every parcel</span>
          </div>
          <div className="login-benefit">
            <Truck size={20} />
            <span>Reach your next customer</span>
          </div>
          <div className="login-benefit">
            <ShieldCheck size={20} />
            <span>Keep your business in good hands</span>
          </div>
        </section>
        <section className="login-form-wrap">
          <span className="eyebrow">WELCOME TO PICKPARCELBD</span>
          <h1>Let’s get you moving.</h1>
          <p>Sign in with your Google account to pick up where you left off.</p>
          {session?.user ? (
            <Link className="button primary full-width" href={target}>
              Continue as {session.user.name.split(" ")[0]}{" "}
              <CheckCircle2 size={17} />
            </Link>
          ) : data?.google_available ? (
            <a
              className="google-button"
              href={`/auth/google?return=${encodeURIComponent(target)}`}
            >
              <span className="google-g">G</span>Continue with Google
            </a>
          ) : (
            <div className="info-notice">
              <ShieldCheck size={20} />
              <p>
                Google sign-in will be available once this environment’s OAuth
                credentials are configured.
              </p>
            </div>
          )}
          <p style={{ fontSize: 10 }}>
            By continuing, you agree to our{" "}
            <Link className="text-link" href="/terms">
              terms & conditions
            </Link>
            . Your account keeps your business connected.
          </p>
          {session?.preview_available && (
            <div className="preview-logins">
              <strong>Local development preview</strong>
              <p>
                These are fictional accounts in an isolated local database.
                Preview sign-in is disabled in production.
              </p>
              <div className="button-row">
                {[
                  { role: "seller", caption: "Seller" },
                  { role: "buyer", caption: "Buyer" },
                  { role: "rider", caption: "Rider" },
                  { role: "agent", caption: "Agent" },
                  { role: "admin", caption: "District admin" },
                ].map((p) => (
                  <Button
                    tone="secondary"
                    disabled={busy}
                    key={p.role}
                    onClick={async () => {
                      const ok = await run(async () => {
                        await api.post("/auth/preview", {
                          email: `${p.role}@preview.example`,
                        });
                        await reload();
                      }, "Preview account signed in.");
                      if (ok)
                        router.push(
                          p.role === "admin"
                            ? "/admin"
                            : p.role === "rider" || p.role === "agent"
                              ? "/operations"
                              : target,
                        );
                    }}
                  >
                    {p.caption}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

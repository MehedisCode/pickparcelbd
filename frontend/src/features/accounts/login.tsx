"use client";
import { useAction, useSession } from "@/components/providers";
import { PublicFooter, PublicHeader } from "@/components/shell";
import { Button, ErrorState, Loading } from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/lib/api";
import { accountHome, safeReturnPath } from "@/lib/auth-navigation";
import { CheckCircle2, Package, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const loginErrors: Record<string, string> = {
  cancelled:
    "Google sign-in was cancelled. You can try again when you’re ready.",
  expired:
    "This sign-in link has expired or was opened directly. Start again with Continue with Google.",
  failed:
    "Google sign-in could not be completed. Please start again. If the problem continues, contact support.",
  unavailable:
    "Google sign-in is temporarily unavailable. Please try again later.",
  unverified: "Please choose a Google account with a verified email address.",
  account_conflict:
    "An existing account uses this email. Use its original Google account or contact support to restore access.",
};

export function LoginScreen() {
  const { session, reload } = useSession();
  const {
    data,
    error,
    loading,
    reload: reloadConfig,
  } = useResource<{ google_available: boolean }>("/config");
  const { run, busy } = useAction();
  const router = useRouter();
  const params = useSearchParams();
  const requestedReturn = safeReturnPath(params.get("return"), "");
  const target = requestedReturn || accountHome(session?.user);
  const loginError = loginErrors[params.get("error") || ""];
  const continueTo =
    session?.user && !session.profile_complete
      ? `/complete-profile?return=${encodeURIComponent(target)}`
      : target;
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
          <p>
            New here? Continue with Google to create your account. Already
            registered? Use the same Google account to sign in.
          </p>
          {loginError && (
            <div className="info-notice" role="alert">
              <ShieldCheck size={20} />
              <p>{loginError}</p>
            </div>
          )}
          {session?.user ? (
            <Link className="button primary full-width" href={continueTo}>
              Continue as {session.user.name.split(" ")[0]}{" "}
              <CheckCircle2 size={17} />
            </Link>
          ) : loading ? (
            <Loading />
          ) : error ? (
            <ErrorState message={error} retry={reloadConfig} />
          ) : data?.google_available ? (
            <a
              className="google-button"
              href={`/auth/google${requestedReturn ? `?return=${encodeURIComponent(requestedReturn)}` : ""}`}
            >
              <span className="google-g">G</span>Continue with Google
            </a>
          ) : (
            <div className="info-notice">
              <ShieldCheck size={20} />
              <p>
                Google sign-in is temporarily unavailable. Please try again
                later.
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

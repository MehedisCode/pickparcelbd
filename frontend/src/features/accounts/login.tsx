"use client";
import { useAction, useI18n, useSession } from "@/components/providers";
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
  const { t, locale } = useI18n();
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
          <span className="eyebrow">{t("auth.storyEyebrow")}</span>
          <h1>
            {locale === "bn" ? (
              <>
                ক্ষুদ্র ব্যবসা।
                <br />
                বড় স্বপ্ন।
                <br />
                <em>
                  প্রতিটি পদক্ষেপে
                  <br />
                  আমাদের সহযোগিতা।
                </em>
              </>
            ) : (
              <>
                A small business.
                <br />A big dream.
                <br />
                <em>
                  A little help
                  <br />
                  along the way.
                </em>
              </>
            )}
          </h1>
          <p>{t("auth.storySubtitle")}</p>
          <div className="login-benefit">
            <Package size={20} />
            <span>{t("auth.benefitParcel")}</span>
          </div>
          <div className="login-benefit">
            <Truck size={20} />
            <span>{t("auth.benefitCustomer")}</span>
          </div>
          <div className="login-benefit">
            <ShieldCheck size={20} />
            <span>{t("auth.benefitTrust")}</span>
          </div>
        </section>
        <section className="login-form-wrap">
          <span className="eyebrow">{t("auth.formEyebrow")}</span>
          <h1>{t("auth.formHeading")}</h1>
          <p>{t("auth.formSubtitle")}</p>
          {loginError && (
            <div className="info-notice" role="alert">
              <ShieldCheck size={20} />
              <p>{loginError}</p>
            </div>
          )}
          {session?.user ? (
            <Link className="button primary full-width" href={continueTo}>
              {t("auth.continueAs")} {session.user.name.split(" ")[0]}{" "}
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
              <span className="google-g">G</span>{t("auth.continueGoogle")}
            </a>
          ) : (
            <div className="info-notice">
              <ShieldCheck size={20} />
              <p>
                {locale === "bn"
                  ? "গুগল সাইন-ইন সাময়িকভাবে অনুপলব্ধ। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।"
                  : "Google sign-in is temporarily unavailable. Please try again later."}
              </p>
            </div>
          )}
          <p style={{ fontSize: 10 }}>
            {t("auth.termsNotice")}{" "}
            <Link className="text-link" href="/terms">
              {t("footer.terms")}
            </Link>
          </p>
          {session?.preview_available && (
            <div className="preview-logins">
              <strong>{t("auth.previewTitle")}</strong>
              <p>{t("auth.previewSubtitle")}</p>
              <div className="button-row">
                {[
                  {
                    role: "seller",
                    caption: locale === "bn" ? "উদ্যোক্তা (Seller)" : "Seller",
                  },
                  {
                    role: "buyer",
                    caption: locale === "bn" ? "ক্রেতা (Buyer)" : "Buyer",
                  },
                  {
                    role: "rider",
                    caption: locale === "bn" ? "রাইডার (Rider)" : "Rider",
                  },
                  {
                    role: "agent",
                    caption: locale === "bn" ? "এজেন্ট (Agent)" : "Agent",
                  },
                  {
                    role: "admin",
                    caption:
                      locale === "bn" ? "জেলা অ্যাডমিন" : "District admin",
                  },
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
                      }, locale === "bn" ? "প্রিভিউ অ্যাকাউন্টে প্রবেশ সম্পন্ন।" : "Preview account signed in.");
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

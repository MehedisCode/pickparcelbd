"use client";
import { useI18n } from "@/components/providers";
import { PublicFooter, PublicHeader } from "@/components/shell";
import { Badge, Button, ErrorState, Loading, Panel } from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, date, label } from "@/lib/api";
import {
  Headphones,
  Mail,
  Package,
  Phone,
  Search,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
type Tracking = {
  parcel: {
    code: string;
    status: string;
    pickup_district: string;
    delivery_district: string;
    created_at: string;
  };
  events: { type: string; created_at: string }[];
};
export function TrackingScreen({ initialCode = "" }: { initialCode?: string }) {
  const { t, locale } = useI18n();
  const [code, setCode] = useState(initialCode);
  const [data, setData] = useState<Tracking>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (initialCode)
      api
        .get<Tracking>(`/tracking/${encodeURIComponent(initialCode)}`)
        .then((result) => {
          if (active) setData(result);
        })
        .catch((e) => {
          if (active)
            setError(e instanceof Error ? e.message : t("tracking.notFound"));
        });
    return () => {
      active = false;
    };
  }, [initialCode, t("tracking.notFound")]);
  return (
    <>
      <PublicHeader />
      <main
        className="public-container"
        style={{ maxWidth: 850, minHeight: "65vh" }}
      >
        <div className="section-intro">
          <span className="eyebrow">{t("tracking.eyebrow")}</span>
          <h1>{t("tracking.title")}</h1>
          <p>{t("tracking.subtitle")}</p>
        </div>
        <Panel>
          <form
            className="filter-row panel-body"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              setData(undefined);
              try {
                setData(
                  await api.get(`/tracking/${encodeURIComponent(code.trim())}`),
                );
              } catch (e) {
                setError(
                  e instanceof Error
                    ? e.message
                    : t("tracking.notFound"),
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="field" style={{ flex: 1 }}>
              <span>{t("tracking.inputLabel")}</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder={t("tracking.inputPlaceholder")}
                maxLength={9}
              />
            </label>
            <Button disabled={busy} type="submit" style={{ alignSelf: "end" }}>
              <Search size={16} />
              {t("tracking.button")}
            </Button>
          </form>
          {busy && <Loading />}
          {error && <ErrorState message={error} />}
        </Panel>
        {data && (
          <div style={{ marginTop: 24 }}>
            <Panel
              title={`RFD${data.parcel.code}`}
              action={<Badge value={data.parcel.status} />}
            >
              <div className="panel-body">
                <div className="route-line">
                  <span>{data.parcel.pickup_district}</span>
                  <span>→</span>
                  <span>{data.parcel.delivery_district || t("tracking.destination")}</span>
                </div>
                <div className="timeline">
                  {data.events.map((e, i) => (
                    <div className="timeline-item" key={i}>
                      <span className="timeline-dot">
                        <Package size={13} />
                      </span>
                      <div>
                        <strong>{label(e.type)}</strong>
                        <small>{date(e.created_at)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
            <div className="info-notice" style={{ marginTop: 20 }}>
              <ShieldCheck size={20} />
              <p>{t("tracking.privacyNotice")}</p>
            </div>
          </div>
        )}
      </main>
      <PublicFooter />
    </>
  );
}
export function HelpScreen() {
  const { data } = useResource<{
    support: { email: string | null; phone: string | null };
  }>("/config");
  const { t, locale } = useI18n();
  return (
    <>
      <PublicHeader />
      <main
        className="public-container"
        style={{ maxWidth: 900, minHeight: "65vh" }}
      >
        <div className="section-intro">
          <span className="eyebrow">{t("help.eyebrow")}</span>
          <h1>{t("help.title")}</h1>
          <p>{t("help.subtitle")}</p>
        </div>
        <div className="detail-grid">
          <Panel title={t("help.ordersPanelTitle")}>
            <div className="panel-body">
              <Headphones size={28} color="var(--green)" />
              <h3>{t("help.ordersHeading")}</h3>
              <p>{t("help.ordersText")}</p>
              <Link className="button primary" href="/dashboard/orders">
                {t("help.ordersBtn")}
              </Link>
            </div>
          </Panel>
          <Panel title={t("help.contactPanelTitle")}>
            <div className="panel-body">
              {data?.support.phone && (
                <p>
                  <Phone size={15} />{" "}
                  <a href={`tel:${data.support.phone}`}>{data.support.phone}</a>
                </p>
              )}
              {data?.support.email && (
                <p>
                  <Mail size={15} />{" "}
                  <a href={`mailto:${data.support.email}`}>
                    {data.support.email}
                  </a>
                </p>
              )}
              {!data?.support.phone && !data?.support.email && (
                <p>
                  {locale === "bn"
                    ? "পিকপার্সেল বিডি সাপোর্ট কনফিগার করা হলে সরাসরি যোগাযোগের তথ্য এখানে প্রদর্শিত হবে।"
                    : "Direct support contact details will appear here when configured by PickParcelBD."}
                </p>
              )}
              <p>{t("help.workingHours")}</p>
              <Link className="text-link" href="/tracking">
                {t("nav.tracking")} →
              </Link>
            </div>
          </Panel>
        </div>
        <Panel title={t("help.faqTitle")}>
          <div className="panel-body">
            <details>
              <summary>{t("help.faq1Q")}</summary>
              <p>{t("help.faq1A")}</p>
            </details>
            <details>
              <summary>{t("help.faq2Q")}</summary>
              <p>{t("help.faq2A")}</p>
            </details>
            <details>
              <summary>{t("help.faq3Q")}</summary>
              <p>{t("help.faq3A")}</p>
            </details>
          </div>
        </Panel>
      </main>
      <PublicFooter />
    </>
  );
}

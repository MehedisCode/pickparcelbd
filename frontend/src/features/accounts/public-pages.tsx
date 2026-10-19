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
            setError(e instanceof Error ? e.message : t.trackingNotFound);
        });
    return () => {
      active = false;
    };
  }, [initialCode, t.trackingNotFound]);
  return (
    <>
      <PublicHeader />
      <main
        className="public-container"
        style={{ maxWidth: 850, minHeight: "65vh" }}
      >
        <div className="section-intro">
          <span className="eyebrow">{t.trackingEyebrow}</span>
          <h1>{t.trackingTitle}</h1>
          <p>{t.trackingSubtitle}</p>
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
                    : t.trackingNotFound,
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="field" style={{ flex: 1 }}>
              <span>{t.trackingInputLabel}</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder={t.trackingInputPlaceholder}
                maxLength={9}
              />
            </label>
            <Button disabled={busy} type="submit" style={{ alignSelf: "end" }}>
              <Search size={16} />
              {t.trackingButton}
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
                  <span>{data.parcel.delivery_district || t.trackingDestination}</span>
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
              <p>{t.trackingPrivacyNotice}</p>
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
          <span className="eyebrow">{t.helpEyebrow}</span>
          <h1>{t.helpTitle}</h1>
          <p>{t.helpSubtitle}</p>
        </div>
        <div className="detail-grid">
          <Panel title={t.helpOrdersPanelTitle}>
            <div className="panel-body">
              <Headphones size={28} color="var(--green)" />
              <h3>{t.helpOrdersHeading}</h3>
              <p>{t.helpOrdersText}</p>
              <Link className="button primary" href="/dashboard/orders">
                {t.helpOrdersBtn}
              </Link>
            </div>
          </Panel>
          <Panel title={t.helpContactPanelTitle}>
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
              <p>{t.helpWorkingHours}</p>
              <Link className="text-link" href="/tracking">
                {t.navTracking} →
              </Link>
            </div>
          </Panel>
        </div>
        <Panel title={t.helpFaqTitle}>
          <div className="panel-body">
            <details>
              <summary>{t.helpFaq1Q}</summary>
              <p>{t.helpFaq1A}</p>
            </details>
            <details>
              <summary>{t.helpFaq2Q}</summary>
              <p>{t.helpFaq2A}</p>
            </details>
            <details>
              <summary>{t.helpFaq3Q}</summary>
              <p>{t.helpFaq3A}</p>
            </details>
          </div>
        </Panel>
      </main>
      <PublicFooter />
    </>
  );
}

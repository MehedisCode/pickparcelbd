"use client";
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
            setError(e instanceof Error ? e.message : "Parcel not found.");
        });
    return () => {
      active = false;
    };
  }, [initialCode]);
  return (
    <>
      <PublicHeader />
      <main
        className="public-container"
        style={{ maxWidth: 850, minHeight: "65vh" }}
      >
        <div className="section-intro">
          <span className="eyebrow">EVERY STEP, A LITTLE CLOSER.</span>
          <h1>Where’s your parcel?</h1>
          <p>Enter your RFD tracking code to follow its journey.</p>
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
                    : "Unable to find this parcel.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="field" style={{ flex: 1 }}>
              <span>Tracking code</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="RFD123456"
                maxLength={9}
              />
            </label>
            <Button disabled={busy} type="submit" style={{ alignSelf: "end" }}>
              <Search size={16} />
              Track parcel
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
                  <span>{data.parcel.delivery_district || "Destination"}</span>
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
              <p>
                Contact information and verification codes are available only to
                authorized delivery participants.
              </p>
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
  return (
    <>
      <PublicHeader />
      <main
        className="public-container"
        style={{ maxWidth: 900, minHeight: "65vh" }}
      >
        <div className="section-intro">
          <span className="eyebrow">A LITTLE HELP GOES A LONG WAY.</span>
          <h1>We’re here for your next step.</h1>
          <p>Find the right place to get your business moving again.</p>
        </div>
        <div className="detail-grid">
          <Panel title="Orders & deliveries">
            <div className="panel-body">
              <Headphones size={28} color="var(--green)" />
              <h3>A conversation can help.</h3>
              <p>
                For an order question, open the order and message the seller.
                For a delivery, open the parcel to contact its assigned member.
              </p>
              <Link className="button primary" href="/dashboard/orders">
                Open my orders
              </Link>
            </div>
          </Panel>
          <Panel title="Contact PickParcelBD">
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
                  Direct support contact details will appear here when
                  configured by PickParcelBD.
                </p>
              )}
              <p>প্রতিদিন সকাল ৯টা থেকে রাত ৯টা</p>
              <Link className="text-link" href="/tracking">
                Track a parcel →
              </Link>
            </div>
          </Panel>
        </div>
        <Panel title="Useful answers">
          <div className="panel-body">
            <details>
              <summary>How do I book a parcel?</summary>
              <p>
                Sign in, complete your profile, then choose “Book a parcel” in
                your workspace. Review the recipient details, delivery fee, and
                any COD amount.
              </p>
            </details>
            <details>
              <summary>When do I share a verification code?</summary>
              <p>
                Share the pickup code with the assigned member when handing over
                your parcel. The recipient shares the delivery code when
                receiving it.
              </p>
            </details>
            <details>
              <summary>How are wallet credits confirmed?</summary>
              <p>
                COD credits follow delivery and confirmation that the company
                received the collection. Your wallet records each confirmed
                credit.
              </p>
            </details>
          </div>
        </Panel>
      </main>
      <PublicFooter />
    </>
  );
}

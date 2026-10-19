"use client";
import { useI18n, useSession } from "@/components/providers";
import {
  Badge,
  Empty,
  ErrorState,
  Loading,
  PageHeading,
  Panel,
} from "@/components/ui";
import { PackageArt } from "@/features/marketplace/catalog";
import { useResource } from "@/hooks/use-resource";
import { date, money } from "@/lib/api";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Package,
  Plus,
  ScanLine,
  Truck,
  Wallet,
} from "lucide-react";
import Link from "next/link";
type Overview = {
  counts: Record<string, number>;
  total: number;
  recent: {
    id: number;
    code: string;
    delivery_name: string;
    delivery_district: string;
    status: string;
    delivery_charge: string;
    created_at: string;
  }[];
  chart: { date: string; count: number }[];
  wallet_balance: string;
  earnings: string;
  orders: number;
  notifications: {
    id: number;
    title: string;
    body: string;
    url: string;
    created_at: string;
  }[];
};
export function OverviewScreen({
  mode = "customer",
}: {
  mode?: "customer" | "operations" | "admin";
}) {
  const { session } = useSession();
  const { t, locale } = useI18n();
  const { data, error, loading, reload } = useResource<Overview>("/dashboard");
  const user = session?.user;
  const today = new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date());
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;
  if (!data) return null;
  const route =
    mode === "admin"
      ? "/admin/parcels"
      : mode === "operations"
        ? "/operations/assignments"
        : "/dashboard/parcels";
  const active =
    data.total - (data.counts.delivered || 0) - (data.counts.returned || 0);
  const max = Math.max(1, ...data.chart.map((d) => d.count));
  const points = data.chart
    .map((d, i) => `${i * 100},${110 - (d.count / max) * 85}`)
    .join(" ");
  const stats = [
    {
      title: locale === "bn" ? "মোট পার্সেল" : "Total parcels",
      value: String(data.total),
      icon: Package,
      detail:
        locale === "bn"
          ? "সকল পার্সেল এক নজরে"
          : "Every journey, in one place",
    },
    {
      title: locale === "bn" ? "ডেলিভারি সম্পন্ন" : "Successfully delivered",
      value: String(data.counts.delivered || 0),
      icon: CheckCircle2,
      detail:
        locale === "bn"
          ? "গ্রাহকের ঠিকানায় পৌঁছেছে"
          : "Arrived at their next chapter",
    },
    {
      title: locale === "bn" ? "চলমান পার্সেল" : "On the move",
      value: String(active),
      icon: Truck,
      detail:
        locale === "bn"
          ? "সক্রিয় বুকিং ও ডেলিভারি"
          : "Active bookings and deliveries",
    },
    {
      title: locale === "bn" ? "ওয়ালেট ব্যালেন্স" : "Available balance",
      value: money(data.wallet_balance),
      icon: Wallet,
      detail:
        locale === "bn"
          ? "আপনার ব্যবহারের উপযোগী ব্যালেন্স"
          : "Your confirmed wallet balance",
    },
  ];
  return (
    <>
      <PageHeading
        eyebrow={today.toUpperCase()}
        title={
          mode === "admin"
            ? `${user?.district || t.brandName} ${locale === "bn" ? "ওভারভিউ" : "at a glance"}`
            : locale === "bn"
              ? `${new Date().getHours() < 12 ? "শুভ সকাল" : "শুভ অপরাহ্ন"}, ${user?.name.split(" ")[0] || ""}!`
              : `Good ${new Date().getHours() < 12 ? "morning" : "afternoon"}, ${user?.name.split(" ")[0] || "there"}.`
        }
        description={
          mode === "operations"
            ? locale === "bn"
              ? "আপনার ডেলিভারি, হস্তান্তর ও পরবর্তী পদক্ষেপের স্পষ্ট চিত্র।"
              : "A clear view of your deliveries, handovers, and next stops."
            : mode === "admin"
              ? locale === "bn"
                ? "আপনার টিম, পার্সেল এবং জেলা অপারেশনস।"
                : "Your people, parcels, and district operations, together."
              : locale === "bn"
                ? "আপনার ব্যবসার বর্তমান অগ্রগতির সংক্ষিপ্ত চিত্র।"
                : "Here’s a little snapshot of how your business is moving."
        }
        action={
          <Link href="/dashboard/parcels/new" className="button primary">
            <Plus size={15} />{" "}
            {locale === "bn" ? "পার্সেল বুক করুন" : "Book a parcel"}
          </Link>
        }
      />
      <section className="welcome-card">
        <div>
          <span className="eyebrow">
            {locale === "bn"
              ? "আপনার ব্যবসার গতি বাড়াতে"
              : "A LITTLE MOMENTUM GOES A LONG WAY"}
          </span>
          <h2>
            {locale === "bn" ? (
              <>
                আপনার নতুন অধ্যায়।
                <br />
                যত্নের সাথে পৌঁছে দেওয়ার দায়িত্ব আমাদের।
              </>
            ) : (
              <>
                Your next chapter.
                <br />
                Delivered with care.
              </>
            )}
          </h2>
          <p>
            {locale === "bn"
              ? "ক্ষুদ্র উদ্যোগ থেকে গ্রাহকের দোরগোড়ায়, আমরা আছি প্রতিটি পদক্ষেপে।"
              : "From a small idea to someone’s doorstep, we’re here for every step of the journey."}
          </p>
        </div>
        <PackageArt />
      </section>
      <div className="stats-grid">
        {stats.map((s) => (
          <section className="stat-card" key={s.title}>
            <div className="stat-top">
              <span>{s.title}</span>
              <div className="stat-icon">
                <s.icon size={17} />
              </div>
            </div>
            <strong>{s.value}</strong>
            <div className="stat-bottom">{s.detail}</div>
          </section>
        ))}
      </div>
      <div className="dashboard-grid">
        <Panel
          title={
            locale === "bn" ? "পার্সেল অ্যাক্টিভিটি" : "Your parcel activity"
          }
          action={
            <span className="muted" style={{ fontSize: 9 }}>
              {locale === "bn" ? "গত ৭ দিন" : "Last 7 days"}
            </span>
          }
        >
          <div className="panel-body" style={{ paddingBottom: 0 }}>
            <div className="chart-headline">
              <strong>{data.chart.reduce((s, d) => s + d.count, 0)}</strong>
              <span>
                {locale === "bn"
                  ? "টি পার্সেল এই সপ্তাহে বুক করা হয়েছে"
                  : "parcels booked this week"}
              </span>
            </div>
          </div>
          <div className="chart-wrap">
            <svg
              viewBox="0 0 600 135"
              preserveAspectRatio="none"
              role="img"
              aria-label="Parcel bookings over the last seven days"
            >
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ed6333" stopOpacity=".13" />
                  <stop offset="100%" stopColor="#ed6333" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[25, 65, 110].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="600"
                  y2={y}
                  stroke="#edf0e7"
                  strokeDasharray="3 5"
                />
              ))}
              <polygon
                points={`0,130 ${points} 600,130`}
                fill="url(#chartFill)"
              />
              <polyline
                points={points}
                fill="none"
                stroke="#ed6333"
                strokeWidth="2.5"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {data.chart.map((d, i) => (
                <circle
                  key={d.date}
                  cx={i * 100}
                  cy={110 - (d.count / max) * 85}
                  r="3"
                  fill="#fff"
                  stroke="#ed6333"
                  strokeWidth="2"
                />
              ))}
            </svg>
            <div className="chart-labels">
              {data.chart.map((d) => (
                <span key={d.date}>
                  {new Date(d.date).toLocaleDateString(
                    locale === "bn" ? "bn-BD" : "en-BD",
                    { weekday: "short" },
                  )}
                </span>
              ))}
            </div>
          </div>
        </Panel>
        <Panel
          title={
            locale === "bn" ? "প্রয়োজনীয় পদক্ষেপ" : "Make your next move"
          }
        >
          <div className="quick-actions">
            <Link className="quick-action" href="/dashboard/parcels/new">
              <Package size={22} />
              <span>{locale === "bn" ? "পার্সেল বুক করুন" : "Book a parcel"}</span>
            </Link>
            <Link className="quick-action" href="/tracking">
              <ScanLine size={22} />
              <span>{locale === "bn" ? "পার্সেল ট্র্যাক করুন" : "Track a journey"}</span>
            </Link>
            <Link className="quick-action" href="/dashboard/products/new">
              <Plus size={22} />
              <span>{locale === "bn" ? "পণ্য যোগ করুন" : "List a product"}</span>
            </Link>
            <Link className="quick-action" href="/dashboard/cash-memos">
              <FileText size={22} />
              <span>{t.navCashMemos}</span>
            </Link>
          </div>
          <div className="panel-body" style={{ paddingTop: 0 }}>
            <div
              className="info-notice"
              style={{ fontSize: 9, marginBottom: 0 }}
            >
              <CheckCircle2 size={15} />
              <p>
                {locale === "bn" ? "পাবলিক আইডি: " : "Your public ID: "}
                <strong>{user?.public_id}</strong>
                <br />
                {locale === "bn"
                  ? "আপনার ব্যবসার স্বতন্ত্র পরিচিতি।"
                  : "One identity for every part of your business."}
              </p>
            </div>
          </div>
        </Panel>
      </div>
      <div className="dashboard-grid">
        <Panel
          title={
            locale === "bn" ? "সাম্প্রতিক পার্সেলসমূহ" : "Recent parcels"
          }
          action={
            <Link href={route} className="text-link">
              {locale === "bn" ? "সব দেখুন" : "View all"}{" "}
              <ArrowRight size={12} />
            </Link>
          }
        >
          {data.recent.length ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{locale === "bn" ? "পার্সেল" : "Parcel"}</th>
                    <th>{locale === "bn" ? "গন্তব্য" : "Going to"}</th>
                    <th>{t.status}</th>
                    <th>{locale === "bn" ? "ডেলিভারি চার্জ" : "Delivery charge"}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link href={`/dashboard/parcels/${p.code}`}>
                          <strong>RFD{p.code}</strong>
                          <small>{date(p.created_at)}</small>
                        </Link>
                      </td>
                      <td>
                        {p.delivery_name}
                        <small>{p.delivery_district || (locale === "bn" ? "বাংলাদেশ" : "Bangladesh")}</small>
                      </td>
                      <td>
                        <Badge value={p.status} />
                      </td>
                      <td>{money(p.delivery_charge)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title={
                locale === "bn"
                  ? "এখনও কোনো পার্সেল নেই"
                  : "Every journey starts somewhere."
              }
              description={
                locale === "bn"
                  ? "প্রথম পার্সেলটি বুক করুন, বাকি দায়িত্ব আমাদের।"
                  : "Book your first parcel and we’ll take it from here."
              }
            />
          )}
        </Panel>
        <Panel
          title={
            locale === "bn"
              ? "সাম্প্রতিক আপডেট ও নোটিফিকেশন"
              : "A little activity update"
          }
          action={
            <Link href="/dashboard/notifications" className="text-link">
              {locale === "bn" ? "সব দেখুন" : "View all"}{" "}
              <ArrowRight size={12} />
            </Link>
          }
        >
          <div className="activity-list">
            {data.notifications.length ? (
              data.notifications.slice(0, 4).map((n) => (
                <Link
                  href={n.url || "/dashboard/notifications"}
                  className="activity-item"
                  key={n.id}
                >
                  <div className="activity-dot">
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <strong>{n.title}</strong>
                    <p>
                      {n.body.length > 85 ? n.body.slice(0, 85) + "…" : n.body}
                    </p>
                    <time>{date(n.created_at)}</time>
                  </div>
                </Link>
              ))
            ) : (
              <Empty
                title={
                  locale === "bn"
                    ? "কোনো নতুন নোটিফিকেশন নেই"
                    : "All quiet for now"
                }
                description={
                  locale === "bn"
                    ? "আপনার সাম্প্রতিক আপডেটগুলো এখানে দেখা যাবে।"
                    : "Your latest updates will appear here."
                }
              />
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}

"use client";

import { api } from "@/lib/api";
import { memberRoles } from "@/lib/types";
import { useI18n, useSession, useToast } from "@/components/providers";
import { ErrorState, Loading } from "@/components/ui";
import {
  ArrowDownLeft,
  ArrowRightLeft,
  Bell,
  Bike,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  Headphones,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  ScanLine,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Brand, Avatar, LanguageSwitcher } from "./brand";
import { PublicHeader } from "./public-header";
import { PublicFooter } from "./public-footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, error, reload } = useSession();
  const { t, locale } = useI18n();
  const path = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const user = session?.user;
  const admin = path.startsWith("/admin");
  const operations = path.startsWith("/operations");

  const customerLinks = [
    {
      href: "/dashboard",
      label: t("nav.customer.overview"),
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/parcels",
      label: t("nav.customer.myParcels"),
      icon: Package,
    },
    {
      href: "/dashboard/orders",
      label: t("nav.customer.orders"),
      icon: ClipboardList,
    },
    {
      href: "/dashboard/products",
      label: t("nav.customer.myProducts"),
      icon: Store,
    },
    {
      href: "/dashboard/cash-memos",
      label: t("nav.customer.cashMemos"),
      icon: FileText,
    },
    {
      href: "/dashboard/messages",
      label: t("nav.customer.messages"),
      icon: MessageCircle,
    },
    {
      href: "/dashboard/wallet",
      label: t("nav.customer.wallet"),
      icon: Wallet,
    },
  ];
  const operationsLinks = [
    { href: "/operations", label: t("nav.operations.overview"), icon: Truck },
    {
      href: "/operations/requests",
      label: t("nav.operations.requests"),
      icon: ClipboardList,
    },
    {
      href: "/operations/assignments",
      label: t("nav.operations.assignments"),
      icon: Package,
    },
    {
      href: "/operations/custody",
      label: t("nav.operations.custody"),
      icon: Package,
    },
    {
      href: "/operations/transfers",
      label: t("nav.operations.transfers"),
      icon: ArrowRightLeft,
    },
    {
      href: "/operations/transfers/receive",
      label: t("nav.operations.receive"),
      icon: ScanLine,
    },
  ];
  const adminLinks = [
    { href: "/admin", label: t("nav.admin.overview"), icon: LayoutDashboard },
    { href: "/admin/users", label: t("nav.admin.users"), icon: Users },
    {
      href: "/admin/riders-agents",
      label: t("nav.admin.ridersAgents"),
      icon: Bike,
    },
    { href: "/admin/parcels", label: t("nav.admin.parcels"), icon: Package },
    { href: "/admin/finance", label: t("nav.admin.finance"), icon: Wallet },
    {
      href: "/admin/audits",
      label: t("nav.admin.audits"),
      icon: ShieldCheck,
    },
    {
      href: "/admin/recovery",
      label: t("nav.admin.recovery"),
      icon: ArrowDownLeft,
    },
    { href: "/admin/reports", label: t("nav.admin.reports"), icon: FileText },
  ];
  if (error)
    return (
      <main className="public-container">
        <ErrorState message={error} retry={() => void reload()} />
      </main>
    );
  if (!session) return <Loading />;
  if (!user)
    return (
      <>
        <PublicHeader />
        <main className="login-required">
          <span className="empty-icon">
            <ShieldCheck size={32} />
          </span>
          <h1>
            {locale === "bn"
              ? "আপনার ওয়ার্কস্পেস প্রস্তুত রয়েছে।"
              : "Your workspace is waiting."}
          </h1>
          <p>
            {locale === "bn"
              ? "পার্সেল, অর্ডার এবং ডেলিভারি পরিচালনা করতে সাইন ইন করুন।"
              : "Sign in to manage your parcels, orders, and deliveries."}
          </p>
          <Link
            className="button primary"
            href={`/login?return=${encodeURIComponent(path)}`}
          >
            {locale === "bn"
              ? "প্রবেশ করতে সাইন ইন করুন"
              : "Sign in to continue"}{" "}
            <ChevronRight size={16} />
          </Link>
        </main>
        <PublicFooter />
      </>
    );
  if (admin && user.role !== "super_admin")
    return <ErrorState message="District administrator access is required." />;
  if (
    operations &&
    !memberRoles.includes(user.role) &&
    user.role !== "super_admin"
  )
    return <ErrorState message="A rider or agent account is required." />;
  const links = admin
    ? adminLinks
    : operations
      ? operationsLinks
      : customerLinks;
  const active = (href: string) =>
    path === href ||
    (href !== "/dashboard" &&
      href !== "/operations" &&
      href !== "/admin" &&
      path.startsWith(href + "/"));
  return (
    <div className="workspace">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <Brand compact />
          <button
            className="mobile-menu icon-button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="workspace-switch">
          <div className="workspace-switch-icon">
            {admin ? (
              <ShieldCheck size={19} />
            ) : operations ? (
              <Truck size={19} />
            ) : (
              <Store size={19} />
            )}
          </div>
          <div>
            <strong>
              {admin
                ? t("nav.districtControl")
                : operations
                  ? t("nav.deliveryNetwork")
                  : t("nav.myBusiness")}
            </strong>
            <span>{user.district || t("nav.brandName")}</span>
          </div>
          <ChevronDown size={14} />
        </div>
        <p className="nav-caption">
          {admin
            ? t("nav.administration")
            : operations
              ? t("nav.deliveryOperations")
              : t("nav.workspace")}
        </p>
        <nav className="sidebar-nav">
          {links.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={active(i.href) ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              <i.icon size={19} />
              <span>{i.label}</span>
              {active(i.href) && <span className="active-dot" />}
            </Link>
          ))}
        </nav>
        <p className="nav-caption">{t("nav.exploreMore")}</p>
        <nav className="sidebar-nav">
          <Link href="/products">
            <ShoppingBag size={19} />
            {t("nav.marketplace")}
            <ChevronRight size={14} />
          </Link>
          <Link href="/ride-share">
            <Bike size={19} />
            {t("nav.rideShare")}
          </Link>
          {(admin || operations) && (
            <Link href="/dashboard">
              <Store size={19} />
              {t("nav.myBusiness")}
            </Link>
          )}
          {!operations && memberRoles.includes(user.role) && (
            <Link href="/operations">
              <Truck size={19} />
              {t("nav.deliveryOperations")}
            </Link>
          )}
          {!admin && user.role === "super_admin" && (
            <Link href="/admin">
              <ShieldCheck size={19} />
              {t("nav.districtControl")}
            </Link>
          )}
          <Link href="/dashboard/following">
            <Heart size={19} />
            {t("nav.customer.following")}
          </Link>
          <Link href="/dashboard/news">
            <FileText size={19} />
            {t("nav.customer.news")}
          </Link>
          <Link href="/dashboard/buyer-blocks">
            <ShieldCheck size={19} />
            {t("nav.customer.buyerBlocks")}
          </Link>
          <Link href="/dashboard/settings">
            <Settings size={19} />
            {t("nav.customer.settings")}
          </Link>
        </nav>
        <div className="sidebar-help">
          <Headphones size={24} />
          <strong>{t("nav.helpTitle")}</strong>
          <p>{t("nav.helpSubtitle")}</p>
          <Link href="/help">
            {t("nav.helpTalk")} <ChevronRight size={14} />
          </Link>
        </div>
        <div className="sidebar-account">
          <Avatar name={user.name} />
          <div>
            <strong>{user.name}</strong>
            <span>{user.public_id}</span>
          </div>
          <button
            className="icon-button"
            aria-label={t("nav.signOut")}
            title={t("nav.signOut")}
            onClick={async () => {
              try {
                await api.post("/auth/logout");
                await reload();
                router.push("/");
              } catch (e) {
                toast(
                  e instanceof Error ? e.message : "Unable to sign out.",
                  "error",
                );
              }
            }}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      {open && <div className="sidebar-scrim" onClick={() => setOpen(false)} />}
      <div className="workspace-body">
        <header className="workspace-topbar">
          <div className="topbar-location">
            <button
              className="icon-button mobile-menu"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu size={21} />
            </button>
            <span>
              {admin
                ? t("nav.districtControl")
                : operations
                  ? t("nav.deliveryOperations")
                  : t("nav.workspace")}
            </span>
            <ChevronRight size={13} />
            <strong>
              {path.split("/").filter(Boolean).at(-1)?.replaceAll("-", " ") ||
                t("nav.customer.overview")}
            </strong>
          </div>
          <div className="topbar-right">
            <form
              className="topbar-search"
              onSubmit={(e) => {
                e.preventDefault();
                router.push(
                  `/dashboard/parcels?search=${encodeURIComponent(search)}`,
                );
              }}
            >
              <Search size={17} />
              <input
                placeholder={t("nav.searchPlaceholder")}
                aria-label={t("nav.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd>↵</kbd>
            </form>
            <LanguageSwitcher />
            <Link
              href="/dashboard/notifications"
              className="notification-icon icon-button"
              aria-label="Notifications"
            >
              <Bell size={20} />
            </Link>
            <Avatar name={user.name} size="small" />
          </div>
        </header>
        <main className="workspace-content">{children}</main>
        <footer className="workspace-footer">
          <span>{t("footer.note")}</span>
          <span>
            <span className="system-dot" /> PickParcelBD · {user.district}
          </span>
        </footer>
      </div>
    </div>
  );
}

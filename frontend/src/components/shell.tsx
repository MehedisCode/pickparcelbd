"use client";

import { api } from "@/lib/api";
import { memberRoles } from "@/lib/types";
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
  MapPin,
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
  Languages,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n, useSession, useToast } from "./providers";
import { Button, ErrorState, Loading } from "./ui";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  return (
    <button
      type="button"
      className={`lang-toggle ${className}`}
      onClick={() => setLocale(locale === "bn" ? "en" : "bn")}
      aria-label={locale === "bn" ? "Switch to English" : "বাংলা ভাষায় দেখুন"}
      title={locale === "bn" ? "Switch to English" : "বাংলা ভাষায় দেখুন"}
    >
      <Languages size={15} />
      <span>{locale === "bn" ? "English" : "বাংলা"}</span>
    </button>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  return (
    <Link href="/" className="brand">
      <span className="brand-mark">
        <Package size={compact ? 21 : 25} strokeWidth={2} />
      </span>
      <span>
        PickParcel<span className="brand-bd">BD</span>
        <small>{t.brandTagline}</small>
      </span>
    </Link>
  );
}
export function Avatar({ name, size = "" }: { name: string; size?: string }) {
  return (
    <span className={`avatar ${size}`}>
      {name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")}
    </span>
  );
}
export function PublicHeader() {
  const { session } = useSession();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="announcement">
        <span>
          <MapPin size={13} /> {t.announcementText}
        </span>
        <Link href="/help">
          {t.announcementHelp} <ChevronRight size={13} />
        </Link>
      </div>
      <header className="public-header">
        <Brand />
        <nav className={open ? "open" : ""}>
          <Link href="/products">{t.navMarketplace}</Link>
          <Link href="/tracking">{t.navTracking}</Link>
          <Link
            href={session?.user ? "/ride-share" : "/login?return=/ride-share"}
          >
            {t.navRideShare}
          </Link>
          <Link href="/help">{t.navHelp}</Link>
          <Link href="/deployment-check">{t.navDeploymentCheck}</Link>
        </nav>
        <div className="header-actions">
          <LanguageSwitcher />
          <Link href="/cart" className="icon-button" aria-label={t.shoppingBagAria}>
            <ShoppingBag size={20} />
          </Link>
          <Link
            className="button primary"
            href={session?.user ? "/dashboard" : "/login"}
          >
            {session?.user ? t.btnMyWorkspace : t.btnGetStarted}
            <ChevronRight size={15} />
          </Link>
          <Button
            tone="ghost"
            className="mobile-menu"
            aria-label={t.toggleNavAria}
            onClick={() => setOpen(!open)}
          >
            <Menu size={21} />
          </Button>
        </div>
      </header>
    </>
  );
}
export function PublicFooter() {
  const { t } = useI18n();
  return (
    <footer className="public-footer">
      <Brand compact />
      <p>{t.footerTagline}</p>
      <div>
        <Link href="/terms">{t.footerTerms}</Link>
        <Link href="/help">{t.footerContact}</Link>
        <span>© {new Date().getFullYear()} PickParcelBD · {t.footerRights}</span>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, error, reload } = useSession();
  const { t } = useI18n();
  const path = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const user = session?.user;
  const admin = path.startsWith("/admin");
  const operations = path.startsWith("/operations");

  const customerLinks = [
    { href: "/dashboard", label: t.navOverview, icon: LayoutDashboard },
    { href: "/dashboard/parcels", label: t.navMyParcels, icon: Package },
    { href: "/dashboard/orders", label: t.navOrders, icon: ClipboardList },
    { href: "/dashboard/products", label: t.navMyProducts, icon: Store },
    { href: "/dashboard/cash-memos", label: t.navCashMemos, icon: FileText },
    { href: "/dashboard/messages", label: t.navMessages, icon: MessageCircle },
    { href: "/dashboard/wallet", label: t.navWallet, icon: Wallet },
  ];
  const operationsLinks = [
    { href: "/operations", label: t.navOpsOverview, icon: Truck },
    {
      href: "/operations/requests",
      label: t.navOpsRequests,
      icon: ClipboardList,
    },
    {
      href: "/operations/assignments",
      label: t.navOpsAssignments,
      icon: Package,
    },
    { href: "/operations/custody", label: t.navOpsCustody, icon: Package },
    {
      href: "/operations/transfers",
      label: t.navOpsTransfers,
      icon: ArrowRightLeft,
    },
    {
      href: "/operations/transfers/receive",
      label: t.navOpsReceive,
      icon: ScanLine,
    },
  ];
  const adminLinks = [
    { href: "/admin", label: t.navAdminOverview, icon: LayoutDashboard },
    { href: "/admin/users", label: t.navAdminUsers, icon: Users },
    { href: "/admin/riders-agents", label: t.navAdminRidersAgents, icon: Bike },
    { href: "/admin/parcels", label: t.navAdminParcels, icon: Package },
    { href: "/admin/finance", label: t.navAdminFinance, icon: Wallet },
    {
      href: "/admin/audits",
      label: t.navAdminAudits,
      icon: ShieldCheck,
    },
    {
      href: "/admin/recovery",
      label: t.navAdminRecovery,
      icon: ArrowDownLeft,
    },
    { href: "/admin/reports", label: t.navAdminReports, icon: FileText },
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
            <ShieldCheck size={30} />
          </span>
          <h1>Your workspace is waiting.</h1>
          <p>Sign in to manage your parcels, orders, and deliveries.</p>
          <Link
            className="button primary"
            href={`/login?return=${encodeURIComponent(path)}`}
          >
            Sign in to continue <ChevronRight size={16} />
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
                ? t.wsDistrictControl
                : operations
                  ? t.wsDeliveryNetwork
                  : t.wsMyBusiness}
            </strong>
            <span>{user.district || t.brandName}</span>
          </div>
          <ChevronDown size={14} />
        </div>
        <p className="nav-caption">
          {admin
            ? t.wsAdministration
            : operations
              ? t.wsDeliveryOperations
              : t.wsWorkspace}
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
        <p className="nav-caption">{t.wsExploreMore}</p>
        <nav className="sidebar-nav">
          <Link href="/products">
            <ShoppingBag size={19} />
            {t.navMarketplace}
            <ChevronRight size={14} />
          </Link>
          <Link href="/ride-share">
            <Bike size={19} />
            {t.navRideShare}
          </Link>
          {(admin || operations) && (
            <Link href="/dashboard">
              <Store size={19} />
              {t.wsMyBusiness}
            </Link>
          )}
          {!operations && memberRoles.includes(user.role) && (
            <Link href="/operations">
              <Truck size={19} />
              {t.wsDeliveryOperations}
            </Link>
          )}
          {!admin && user.role === "super_admin" && (
            <Link href="/admin">
              <ShieldCheck size={19} />
              {t.wsDistrictControl}
            </Link>
          )}
          <Link href="/dashboard/following">
            <Heart size={19} />
            {t.navFollowing}
          </Link>
          <Link href="/dashboard/news">
            <FileText size={19} />
            {t.navNews}
          </Link>
          <Link href="/dashboard/buyer-blocks">
            <ShieldCheck size={19} />
            {t.navBuyerBlocks}
          </Link>
          <Link href="/dashboard/settings">
            <Settings size={19} />
            {t.navSettings}
          </Link>
        </nav>
        <div className="sidebar-help">
          <Headphones size={24} />
          <strong>{t.wsHelpTitle}</strong>
          <p>{t.wsHelpSubtitle}</p>
          <Link href="/help">
            {t.wsHelpTalk} <ChevronRight size={14} />
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
            aria-label={t.wsSignOut}
            title={t.wsSignOut}
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
                ? t.wsDistrictControl
                : operations
                  ? t.wsDeliveryOperations
                  : t.wsWorkspace}
            </span>
            <ChevronRight size={13} />
            <strong>
              {path.split("/").filter(Boolean).at(-1)?.replaceAll("-", " ") ||
                t.navOverview}
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
                placeholder={t.wsSearchPlaceholder}
                aria-label={t.wsSearchPlaceholder}
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
          <span>{t.wsFooterNote}</span>
          <span>
            <span className="system-dot" /> PickParcelBD · {user.district}
          </span>
        </footer>
      </div>
    </div>
  );
}

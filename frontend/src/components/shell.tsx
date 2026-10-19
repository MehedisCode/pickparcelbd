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
  ShoppingCart,
  Store,
  Truck,
  Users,
  Wallet,
  X,
  Languages,
  Plus,
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
        <small>{t("nav.brandTagline")}</small>
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
export function PublicHeader({
  marketplaceSearch,
}: {
  marketplaceSearch?: {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    placeholder: string;
    label: string;
    clearLabel: string;
    cartCount: number;
  };
} = {}) {
  const { session } = useSession();
  const { t, locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);

  if (marketplaceSearch) {
    return (
      <header className="marketplace-header">
        <div className="marketplace-header-inner">
          <Brand />
          <form
            role="search"
            className="marketplace-header-search"
            onSubmit={(event) => {
              event.preventDefault();
              marketplaceSearch.onSubmit();
            }}
          >
            <label className="sr-only" htmlFor="marketplace-header-search">
              {marketplaceSearch.label}
            </label>
            <Search size={18} aria-hidden="true" />
            <input
              id="marketplace-header-search"
              type="search"
              value={marketplaceSearch.value}
              onChange={(event) =>
                marketplaceSearch.onChange(event.target.value)
              }
              placeholder={marketplaceSearch.placeholder}
            />
            {marketplaceSearch.value && (
              <button
                type="button"
                onClick={() => marketplaceSearch.onChange("")}
                aria-label={marketplaceSearch.clearLabel}
              >
                <X size={16} />
              </button>
            )}
          </form>

          <div className="marketplace-header-actions">
            <div
              className="marketplace-language-switch"
              role="group"
              aria-label={t("nav.langSwitchAria")}
            >
              <button
                type="button"
                lang="bn"
                aria-pressed={locale === "bn"}
                onClick={() => setLocale("bn")}
              >
                বাং
              </button>
              <button
                type="button"
                lang="en"
                aria-pressed={locale === "en"}
                onClick={() => setLocale("en")}
              >
                EN
              </button>
            </div>
            <Link
              className="marketplace-parcel-action"
              href="/dashboard/parcels/new"
            >
              <Truck size={18} />
              {t("marketplace.home.bookParcel")}
            </Link>
            <Link
              href="/cart"
              className="marketplace-cart-action"
              aria-label={t("nav.shoppingBagAria")}
            >
              <ShoppingCart size={20} />
              {marketplaceSearch.cartCount > 0 && (
                <span>{marketplaceSearch.cartCount}</span>
              )}
            </Link>
            <Link
              className="marketplace-post-action"
              href="/dashboard/products/new"
            >
              <Plus size={18} />
              {t("marketplace.home.postProduct")}
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <div className="announcement">
        <span>
          <MapPin size={13} /> {t("nav.announcementText")}
        </span>
        <Link href="/help">
          {t("nav.announcementHelp")} <ChevronRight size={13} />
        </Link>
      </div>
      <header className="public-header">
        <Brand />
        <nav className={open ? "open" : ""}>
          <Link href="/products">{t("nav.marketplace")}</Link>
          <Link href="/tracking">{t("nav.tracking")}</Link>
          <Link
            href={session?.user ? "/ride-share" : "/login?return=/ride-share"}
          >
            {t("nav.rideShare")}
          </Link>
          <Link href="/help">{t("nav.help")}</Link>
          <Link href="/deployment-check">{t("nav.deploymentCheck")}</Link>
        </nav>
        <div className="header-actions">
          <LanguageSwitcher />
          <Link
            href="/cart"
            className="icon-button"
            aria-label={t("nav.shoppingBagAria")}
          >
            <ShoppingBag size={20} />
          </Link>
          <Link
            className="button primary"
            href={session?.user ? "/dashboard" : "/login"}
          >
            {session?.user ? t("nav.myWorkspace") : t("nav.getStarted")}
            <ChevronRight size={15} />
          </Link>
          <Button
            tone="ghost"
            className="mobile-menu"
            aria-label={t("nav.toggleNavAria")}
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
    <footer className="public-footer public-footer-v2">
      <div className="public-footer-grid">
        <div className="public-footer-brand">
          <Brand compact />
          <p>{t("footer.tagline")}</p>
        </div>
        <nav aria-label={t("nav.marketplace")}>
          <strong>{t("nav.marketplace")}</strong>
          <Link href="/products">{t("marketplace.home.browseProducts")}</Link>
          <Link href="/#categories">{t("marketplace.home.allCategories")}</Link>
          <Link href="/dashboard/products/new">
            {t("marketplace.home.postProduct")}
          </Link>
        </nav>
        <nav aria-label={t("footer.contact")}>
          <strong>{t("footer.contact")}</strong>
          <Link href="/tracking">{t("nav.tracking")}</Link>
          <Link href="/help">{t("nav.help")}</Link>
          <Link href="/terms">{t("footer.terms")}</Link>
        </nav>
        <div className="public-footer-help">
          <strong>{t("nav.helpTitle")}</strong>
          <p>{t("nav.helpSubtitle")}</p>
          <Link href="/help">
            <Headphones size={16} /> {t("nav.helpTalk")}
          </Link>
        </div>
      </div>
      <div className="public-footer-bottom">
        <span>
          © {new Date().getFullYear()} PickParcelBD · {t("footer.rights")}
        </span>
        <span>{t("footer.note")}</span>
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

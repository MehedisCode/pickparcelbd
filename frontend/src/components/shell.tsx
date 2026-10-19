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
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useSession, useToast } from "./providers";
import { Button, ErrorState, Loading } from "./ui";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand">
      <span className="brand-mark">
        <Package size={compact ? 21 : 25} strokeWidth={2} />
      </span>
      <span>
        PickParcel<span className="brand-bd">BD</span>
        <small>YOUR BUSINESS, DELIVERED.</small>
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
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="announcement">
        <span>
          <MapPin size={13} /> Built for Bangladesh. Connected by possibility.
        </span>
        <Link href="/help">
          Need a hand? We’re here <ChevronRight size={13} />
        </Link>
      </div>
      <header className="public-header">
        <Brand />
        <nav className={open ? "open" : ""}>
          <Link href="/products">Marketplace</Link>
          <Link href="/tracking">Track a parcel</Link>
          <Link
            href={session?.user ? "/ride-share" : "/login?return=/ride-share"}
          >
            Ride share
          </Link>
          <Link href="/help">Help & support</Link>
          <Link href="/deployment-check">Deployment check</Link>
        </nav>
        <div className="header-actions">
          <Link href="/cart" className="icon-button" aria-label="Shopping bag">
            <ShoppingBag size={20} />
          </Link>
          <Link
            className="button primary"
            href={session?.user ? "/dashboard" : "/login"}
          >
            {session?.user ? "My workspace" : "Get started"}
            <ChevronRight size={15} />
          </Link>
          <Button
            tone="ghost"
            className="mobile-menu"
            aria-label="Toggle navigation"
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
  return (
    <footer className="public-footer">
      <Brand compact />
      <p>Small businesses. Big possibilities.</p>
      <div>
        <Link href="/terms">Terms & conditions</Link>
        <Link href="/help">Contact us</Link>
        <span>© {new Date().getFullYear()} PickParcelBD</span>
      </div>
    </footer>
  );
}

const customerLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/parcels", label: "My parcels", icon: Package },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/products", label: "My products", icon: Store },
  { href: "/dashboard/cash-memos", label: "Cash memos", icon: FileText },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/wallet", label: "My wallet", icon: Wallet },
];
const operationsLinks = [
  { href: "/operations", label: "Operations overview", icon: Truck },
  {
    href: "/operations/requests",
    label: "Available pickups",
    icon: ClipboardList,
  },
  {
    href: "/operations/assignments",
    label: "My pickup batches",
    icon: Package,
  },
  { href: "/operations/custody", label: "My custody", icon: Package },
  {
    href: "/operations/transfers",
    label: "Transfers & history",
    icon: ArrowRightLeft,
  },
  {
    href: "/operations/transfers/receive",
    label: "Receive a handover",
    icon: ScanLine,
  },
];
const adminLinks = [
  { href: "/admin", label: "District overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "People & roles", icon: Users },
  { href: "/admin/riders-agents", label: "Riders & agents", icon: Bike },
  { href: "/admin/parcels", label: "Parcel control", icon: Package },
  { href: "/admin/finance", label: "Finance & settlements", icon: Wallet },
  {
    href: "/admin/audits",
    label: "Audits & reconciliation",
    icon: ShieldCheck,
  },
  {
    href: "/admin/recovery",
    label: "Recovery & snapshots",
    icon: ArrowDownLeft,
  },
  { href: "/admin/reports", label: "Activity & reports", icon: FileText },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, error, reload } = useSession();
  const path = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const user = session?.user;
  const admin = path.startsWith("/admin");
  const operations = path.startsWith("/operations");
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
                ? "District control"
                : operations
                  ? "Delivery network"
                  : "My business"}
            </strong>
            <span>{user.district || "PickParcelBD workspace"}</span>
          </div>
          <ChevronDown size={14} />
        </div>
        <p className="nav-caption">
          {admin
            ? "ADMINISTRATION"
            : operations
              ? "DELIVERY OPERATIONS"
              : "WORKSPACE"}
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
        <p className="nav-caption">EXPLORE MORE</p>
        <nav className="sidebar-nav">
          <Link href="/products">
            <ShoppingBag size={19} />
            Marketplace
            <ChevronRight size={14} />
          </Link>
          <Link href="/ride-share">
            <Bike size={19} />
            Ride share
          </Link>
          {(admin || operations) && (
            <Link href="/dashboard">
              <Store size={19} />
              My business
            </Link>
          )}
          {!operations && memberRoles.includes(user.role) && (
            <Link href="/operations">
              <Truck size={19} />
              Delivery operations
            </Link>
          )}
          {!admin && user.role === "super_admin" && (
            <Link href="/admin">
              <ShieldCheck size={19} />
              District control
            </Link>
          )}
          <Link href="/dashboard/following">
            <Heart size={19} />
            Following
          </Link>
          <Link href="/dashboard/news">
            <FileText size={19} />
            My news
          </Link>
          <Link href="/dashboard/buyer-blocks">
            <ShieldCheck size={19} />
            Buyer preferences
          </Link>
          <Link href="/dashboard/settings">
            <Settings size={19} />
            Settings
          </Link>
        </nav>
        <div className="sidebar-help">
          <Headphones size={24} />
          <strong>A little help goes a long way.</strong>
          <p>We’re here for you and your business.</p>
          <Link href="/help">
            Let’s talk <ChevronRight size={14} />
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
            aria-label="Sign out"
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
                ? "District control"
                : operations
                  ? "Delivery operations"
                  : "Workspace"}
            </span>
            <ChevronRight size={13} />
            <strong>
              {path.split("/").filter(Boolean).at(-1)?.replaceAll("-", " ") ||
                "Overview"}
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
                placeholder="Find a parcel…"
                aria-label="Find a parcel"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd>↵</kbd>
            </form>
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
          <span>Made for the way Bangladesh does business.</span>
          <span>
            <span className="system-dot" /> PickParcelBD · {user.district}
          </span>
        </footer>
      </div>
    </div>
  );
}

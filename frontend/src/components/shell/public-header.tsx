"use client";

import { useI18n, useSession } from "@/components/providers";
import { Button } from "@/components/ui";
import { useCart } from "@/features/marketplace/cart";
import {
  ChevronRight,
  Menu,
  Search,
  ShoppingCart,
  Truck,
  X,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Brand } from "./brand";

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
    cartCount?: number;
  };
} = {}) {
  const { session } = useSession();
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState("");

  const searchValue = marketplaceSearch ? marketplaceSearch.value : localQuery;
  const handleSearchChange = (val: string) => {
    if (marketplaceSearch) {
      marketplaceSearch.onChange(val);
    } else {
      setLocalQuery(val);
    }
  };
  const handleSearchSubmit = () => {
    if (marketplaceSearch) {
      marketplaceSearch.onSubmit();
    } else {
      router.push(`/?search=${encodeURIComponent(localQuery)}#discover`);
    }
  };
  const cartCount =
    marketplaceSearch?.cartCount ??
    cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="marketplace-header">
        <div className="marketplace-header-inner">
          <Brand />
          <form
            role="search"
            className="marketplace-header-search"
            onSubmit={(event) => {
              event.preventDefault();
              handleSearchSubmit();
            }}
          >
            <label className="sr-only" htmlFor="marketplace-header-search">
              {marketplaceSearch?.label || t("marketplace.home.search")}
            </label>
            <Search size={18} aria-hidden="true" />
            <input
              id="marketplace-header-search"
              type="search"
              value={searchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder={
                marketplaceSearch?.placeholder ||
                t("marketplace.home.searchProducts")
              }
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                aria-label={
                  marketplaceSearch?.clearLabel ||
                  t("marketplace.home.clearSearch")
                }
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
              {cartCount > 0 && <span>{cartCount}</span>}
            </Link>
            <Link
              className="marketplace-post-action"
              href="/dashboard/products/new"
            >
              <Plus size={18} />
              {t("marketplace.home.postProduct")}
            </Link>
            <span className="marketplace-header-divider" aria-hidden="true" />
            <Link
              className="marketplace-get-started-btn"
              href={session?.user ? "/dashboard" : "/login"}
            >
              {session?.user ? t("nav.myWorkspace") : t("nav.getStarted")}
              <ChevronRight size={14} />
            </Link>
            <Button
              tone="ghost"
              className="marketplace-mobile-menu-btn"
              aria-label={t("nav.toggleNavAria")}
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {open && (
          <div className="marketplace-mobile-drawer">
            <nav className="marketplace-mobile-nav">
              <Link href="/" onClick={() => setOpen(false)}>
                {t("nav.marketplace")}
              </Link>
              <Link href="/tracking" onClick={() => setOpen(false)}>
                {t("nav.tracking")}
              </Link>
              <Link
                href={
                  session?.user ? "/ride-share" : "/login?return=/ride-share"
                }
                onClick={() => setOpen(false)}
              >
                {t("nav.rideShare")}
              </Link>
              <Link href="/help" onClick={() => setOpen(false)}>
                {t("nav.help")}
              </Link>
              <div className="marketplace-mobile-nav-divider" />
              <Link
                href="/dashboard/parcels/new"
                className="marketplace-mobile-action"
                onClick={() => setOpen(false)}
              >
                <Truck size={18} />
                {t("marketplace.home.bookParcel")}
              </Link>
              <Link
                href="/dashboard/products/new"
                className="marketplace-mobile-action primary"
                onClick={() => setOpen(false)}
              >
                <Plus size={18} />
                {t("marketplace.home.postProduct")}
              </Link>
              <Link
                href={session?.user ? "/dashboard" : "/login"}
                className="marketplace-mobile-action workspace"
                onClick={() => setOpen(false)}
              >
                {session?.user ? t("nav.myWorkspace") : t("nav.getStarted")}
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

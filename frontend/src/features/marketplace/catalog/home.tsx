"use client";

import { useI18n, useSession } from "@/components/providers";
import { PublicFooter, PublicHeader } from "@/components/shell";
import { ErrorState, PageHeading, Pagination } from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import type { Paged, Product } from "@/lib/types";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Edit3,
  HeartHandshake,
  Home as HomeIcon,
  Lock,
  MapPin,
  Package,
  PackagePlus,
  PackageSearch,
  Plus,
  RotateCcw,
  Search,
  SearchX,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Sofa,
  Apple,
  TrendingUp,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "../cart";
import { getCategories, localizedNumber } from "./format";
import { ProductCard } from "./product-card";

export function CatalogScreen({
  home = false,
  seller,
}: {
  home?: boolean;
  seller?: string;
}) {
  const { t, locale } = useI18n();
  const { session } = useSession();
  const cart = useCart();
  const categories = getCategories(t);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({
    category,
    search,
    sort: "latest",
    page: String(page),
  });
  if (seller) params.set("seller", seller);
  const { data, error, loading, reload } = useResource<Paged<Product>>(
    `/products?${params}`,
  );

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const trendingSearches = [
    t("marketplace.home.trendingFashion"),
    t("marketplace.home.trendingMobile"),
    t("marketplace.home.trendingShoes"),
    t("marketplace.home.trendingBag"),
    t("marketplace.home.trendingBeauty"),
    t("marketplace.home.trendingShirt"),
    t("marketplace.home.trendingHoney"),
    t("marketplace.home.trendingHandmade"),
  ];

  const categoryCards = [
    {
      key: "fashion",
      label: t("marketplace.categories.fashion"),
      icon: Shirt,
      bg: "bg-orange-50 text-brand-orange",
    },
    {
      key: "electronics",
      label: t("marketplace.categories.electronics"),
      icon: Smartphone,
      bg: "bg-blue-50 text-blue-600",
    },
    {
      key: "food",
      label: t("marketplace.categories.food"),
      icon: Apple,
      bg: "bg-emerald-50 text-emerald-600",
    },
    {
      key: "beauty",
      label: t("marketplace.categories.beauty"),
      icon: Sparkles,
      bg: "bg-rose-50 text-rose-600",
    },
    {
      key: "home",
      label: t("marketplace.categories.home"),
      icon: Sofa,
      bg: "bg-amber-50 text-amber-600",
    },
    {
      key: "other",
      label: t("marketplace.categories.other"),
      icon: Package,
      bg: "bg-teal-50 text-teal-600",
    },
  ];

  const quickSteps = [
    {
      title: t("marketplace.home.stepPhoto"),
      subtitle: t("marketplace.home.stepPhotoSub"),
      icon: Camera,
    },
    {
      title: t("marketplace.home.stepDetails"),
      subtitle: t("marketplace.home.stepDetailsSub"),
      icon: Edit3,
    },
    {
      title: t("marketplace.home.stepPost"),
      subtitle: t("marketplace.home.stepPostSub"),
      icon: CheckCircle2,
    },
  ];

  const trustBadges = [
    {
      title: t("marketplace.home.fastDelivery"),
      sub: t("marketplace.home.fastDeliverySub"),
      icon: Truck,
    },
    {
      title: t("marketplace.home.securePayment"),
      sub: t("marketplace.home.securePaymentSub"),
      icon: Lock,
    },
    {
      title: t("marketplace.home.tracking"),
      sub: t("marketplace.home.trackingSub"),
      icon: MapPin,
    },
    {
      title: t("marketplace.home.trustedSellers"),
      sub: t("marketplace.home.trustedSellersSub"),
      icon: HeartHandshake,
    },
  ];

  return (
    <>
      <PublicHeader
        marketplaceSearch={
          home
            ? {
                value: search,
                onChange: (value) => {
                  setSearch(value);
                  setPage(1);
                },
                onSubmit: () =>
                  document
                    .getElementById("discover")
                    ?.scrollIntoView({ behavior: "smooth" }),
                placeholder: t("marketplace.home.searchProducts"),
                label: t("marketplace.home.search"),
                clearLabel: t("marketplace.home.clearSearch"),
                cartCount,
              }
            : undefined
        }
      />

      <main
        className={`public-container pb-20 md:pb-12 ${home ? "market-home" : ""}`}
      >
        {home ? (
          <div className="home-sections">
            <div id="top-search" className="market-mobile-search scroll-mt-24">
              <Search className="h-[18px] w-[18px]" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder={t("marketplace.home.searchProducts")}
                aria-label={t("marketplace.home.search")}
              />
            </div>

            <section
              aria-labelledby="hero-title"
              className="home-hero relative overflow-hidden rounded-[28px] p-6 text-white sm:p-10 lg:p-14"
            >
              <div className="relative z-10 grid items-center gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] lg:gap-14">
                <div className="min-w-0">
                  <h1
                    id="hero-title"
                    className="max-w-[620px] text-[30px] font-bold leading-[1.25] tracking-[-0.035em] text-white sm:text-[40px] lg:text-[48px]"
                  >
                    {t("marketplace.home.heroTitle")}
                  </h1>
                  <p className="home-hero-description mt-4 max-w-[570px] text-[15px] leading-7 text-white/70 sm:text-[17px]">
                    {t("marketplace.home.heroDescription")}
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link
                      href="/dashboard/products/new"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-orange px-6 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-brand-orange-dark active:scale-95"
                    >
                      <PackagePlus className="h-4 w-4" />
                      {t("marketplace.home.postProduct")}
                    </Link>
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="#discover"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-95"
                      >
                        <ShoppingBag className="hidden h-4 w-4 sm:block" />
                        {t("marketplace.home.browseProducts")}
                      </Link>
                      <Link
                        href="/dashboard/parcels/new"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-95"
                      >
                        <Truck className="hidden h-4 w-4 sm:block" />
                        {t("marketplace.home.bookParcel")}
                      </Link>
                    </div>
                  </div>

                  <dl className="hero-stats mt-9 hidden flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-7 md:flex">
                    <div>
                      <dt>{t("marketplace.home.statSellers")}</dt>
                      <dd>{localizedNumber("50,000+", locale)}</dd>
                    </div>
                    <div>
                      <dt>{t("marketplace.home.statDistricts")}</dt>
                      <dd>{localizedNumber(64, locale)}</dd>
                    </div>
                    <div>
                      <dt>{t("marketplace.home.statDelivery")}</dt>
                      <dd>{t("marketplace.home.statDeliveryValue")}</dd>
                    </div>
                  </dl>
                </div>

                <div className="hero-quick-post rounded-2xl p-5 sm:p-6">
                  <h2 className="quick-post-heading text-[17px] font-semibold text-white">
                    {t("marketplace.home.quickTitle")}
                  </h2>
                  <p className="quick-post-description mt-1 text-sm text-white/65">
                    {t("marketplace.home.quickDescription")}
                  </p>
                  <ol className="mt-6 grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-5">
                    {quickSteps.map((step, idx) => {
                      const StepIcon = step.icon;
                      return (
                        <li
                          key={step.title}
                          className="flex flex-col items-center gap-2 text-center lg:flex-row lg:items-start lg:gap-4 lg:text-left"
                        >
                          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange">
                            <StepIcon className="h-5 w-5" />
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-brand-navy">
                              {localizedNumber(idx + 1, locale)}
                            </span>
                          </span>
                          <span>
                            <strong className="block text-[13px] font-semibold text-white sm:text-sm">
                              {step.title}
                            </strong>
                            <small className="mt-0.5 hidden text-[12px] text-white/60 lg:block">
                              {step.subtitle}
                            </small>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                  <p className="quick-post-note mt-6 border-t border-white/10 pt-4 text-center text-xs text-white/60 lg:text-left">
                    {t("marketplace.home.quickNote")}
                  </p>
                </div>
              </div>
            </section>

            {/* 3. TRUST STRIP */}
            <section
              aria-label={t("marketplace.home.trustedSellers")}
              className="trust-strip grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 sm:gap-8"
            >
              {trustBadges.map((badge) => {
                const BadgeIcon = badge.icon;
                return (
                  <div key={badge.title} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-mint text-brand-green">
                      <BadgeIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold leading-snug text-brand-navy sm:text-sm">
                        {badge.title}
                      </h4>
                      <p className="mt-1 hidden text-[11px] leading-relaxed text-brand-muted sm:block">
                        {badge.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* 4. CATEGORY GRID */}
            <section
              id="categories"
              aria-labelledby="category-title"
              className="space-y-6 scroll-mt-24"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    id="category-title"
                    className="category-section-heading text-lg font-bold text-brand-navy sm:text-xl"
                  >
                    {t("marketplace.home.browseTitle")}
                  </h2>
                  <p className="section-description mt-1 text-sm text-brand-muted">
                    {t("marketplace.home.browseDescription")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6 sm:gap-3">
                {categoryCards.map((cat) => {
                  const CatIcon = cat.icon;
                  const isSelected = category === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        const nextCat = isSelected ? "all" : cat.key;
                        setCategory(nextCat);
                        setPage(1);
                        const el = document.getElementById("discover");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`category-tile group flex min-h-[118px] flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center transition-all duration-200 active:scale-95 ${
                        isSelected
                          ? "bg-brand-navy text-white ring-2 ring-brand-navy shadow-sm"
                          : "bg-white text-brand-ink hover:border-brand-green/40 hover:bg-brand-mint/40"
                      }`}
                    >
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                          isSelected ? "bg-white/20 text-white" : cat.bg
                        }`}
                      >
                        <CatIcon className="h-6 w-6" />
                      </div>
                      <span className="line-clamp-2 min-h-[2.5em] text-xs font-semibold leading-tight">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        ) : (
          <PageHeading
            eyebrow={t("marketplace.headingEyebrow")}
            title={t("marketplace.headingTitle")}
            description={t("marketplace.headingSubtitle")}
          />
        )}

        {/* 6. MAIN PRODUCT DISCOVERY SECTION */}
        <section id="discover" className="mt-12 space-y-5 scroll-mt-24">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="product-section-heading text-xl font-bold text-brand-navy sm:text-2xl">
                {seller
                  ? t("marketplace.discoverFromSeller")
                  : home
                    ? t("marketplace.home.featuredTitle")
                    : t("marketplace.discoverTitle")}
              </h2>
              <p className="section-description text-xs text-brand-muted sm:text-sm">
                {home
                  ? t("marketplace.home.productCount", {
                      count: localizedNumber(data?.total || 0, locale),
                    })
                  : t("marketplace.discoverSubtitle")}
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar"
            aria-label={t("marketplace.home.trending")}
          >
            <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-brand-muted">
              <TrendingUp className="h-4 w-4 text-brand-orange" />
              {t("marketplace.home.trending")}:
            </span>
            {trendingSearches.map((tag) => (
              <button
                key={tag}
                type="button"
                aria-pressed={search === tag}
                onClick={() => {
                  setSearch(search === tag ? "" : tag);
                  setPage(1);
                }}
                className={`h-9 shrink-0 rounded-full border px-4 text-xs font-medium transition ${
                  search === tag
                    ? "border-brand-navy bg-brand-navy text-white"
                    : "border-brand-line bg-white text-brand-ink hover:border-brand-green/40"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {(search || category !== "all") && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-brand-muted">
              <span>{t("marketplace.home.activeFilters")}</span>
              {search && (
                <button className="filter-chip" onClick={() => setSearch("")}>
                  “{search}” ×
                </button>
              )}
              {category !== "all" && (
                <button
                  className="filter-chip"
                  onClick={() => setCategory("all")}
                >
                  {categories.find((item) => item.id === category)?.label} ×
                </button>
              )}
              <button
                className="font-semibold text-brand-orange"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                }}
              >
                {t("marketplace.home.clearAll")}
              </button>
            </div>
          )}

          {/* Product Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-5">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="flex flex-col rounded-2xl bg-white p-2.5 shadow-sm ring-1 ring-black/[0.04]"
                >
                  <div className="shimmer aspect-square rounded-xl" />
                  <div className="space-y-2 pt-3">
                    <div className="shimmer h-3.5 w-full rounded" />
                    <div className="shimmer h-3.5 w-2/3 rounded" />
                    <div className="flex items-end justify-between pt-2">
                      <div className="shimmer h-4 w-16 rounded" />
                      <div className="shimmer h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} retry={reload} />
          ) : data?.data.length ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-5">
                {data.data.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <Pagination
                page={data.current_page}
                last={data.last_page}
                onChange={setPage}
              />
            </>
          ) : (
            <div className="marketplace-empty-card">
              {/* Subtle background ambient glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full bg-brand-orange/5 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-brand-green/5 blur-3xl"
              />

              <div className="relative z-10 mx-auto max-w-md">
                {/* Styled icon badge */}
                <div className="empty-badge">
                  {search || category !== "all" ? (
                    <SearchX className="h-9 w-9 stroke-[1.75]" />
                  ) : (
                    <PackageSearch className="h-9 w-9 stroke-[1.75]" />
                  )}
                </div>

                {/* Title */}
                <h3>{t("marketplace.home.emptyTitle")}</h3>

                {/* Description */}
                <p className="empty-desc">
                  {t("marketplace.home.emptyDescription")}
                </p>

                {/* Action buttons */}
                <div className="empty-actions">
                  {Boolean(search || category !== "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setCategory("all");
                        setPage(1);
                      }}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-brand-line bg-white px-5 text-sm font-semibold text-brand-navy shadow-sm transition hover:bg-brand-bg active:scale-95"
                    >
                      <RotateCcw className="h-4 w-4 text-brand-muted" />
                      <span>{t("marketplace.home.clearAll")}</span>
                    </button>
                  )}

                  <Link
                    href={
                      session?.user
                        ? "/dashboard/products/new"
                        : "/login?return=/dashboard/products/new"
                    }
                    className="button primary inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-orange px-6 text-sm font-bold !text-white shadow-md shadow-brand-orange/20 transition hover:bg-brand-orange-dark active:scale-95"
                    style={{ color: "#ffffff" }}
                  >
                    <PackagePlus
                      className="h-4 w-4"
                      style={{ color: "#ffffff" }}
                    />
                    <span style={{ color: "#ffffff" }}>
                      {t("marketplace.home.postProduct")}
                    </span>
                  </Link>
                </div>

                {/* Helpful quick suggestions when filtering */}
                {Boolean(search || category !== "all") && (
                  <div className="empty-suggestions">
                    <p>
                      {locale === "bn"
                        ? "জনপ্রিয় ক্যাটাগরিগুলো দেখুন:"
                        : "Or explore categories:"}
                    </p>
                    <div className="empty-suggestions-list">
                      {categories
                        .filter((c) => c.id !== "all")
                        .slice(0, 4)
                        .map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setCategory(cat.id);
                              setSearch("");
                              setPage(1);
                            }}
                            className="empty-cat-chip"
                          >
                            {cat.label}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 7. SELLER SPOTLIGHT BANNER */}
        {home && (
          <section
            aria-labelledby="seller-spotlight-title"
            className="seller-spotlight mt-12 overflow-hidden rounded-3xl px-5 py-8 sm:px-8 md:mt-16 md:p-12 lg:p-16"
          >
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
              <div className="min-w-0">
                <h2
                  id="seller-spotlight-title"
                  className="text-[22px] font-bold leading-[1.3] text-brand-navy md:text-[30px]"
                >
                  {t("marketplace.home.sellerTitle")}
                </h2>
                <p className="mt-2 max-w-xl text-[15px] leading-[1.75] text-brand-ink/80">
                  {t("marketplace.home.sellerDescription")}
                </p>

                <ul className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-6">
                  <li className="flex items-start gap-3 text-[14px] font-medium leading-snug text-brand-ink md:text-[15px]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green text-white text-[10px]">
                      ✓
                    </span>
                    {t("marketplace.home.sellerBenefitFree")}
                  </li>
                  <li className="flex items-start gap-3 text-[14px] font-medium leading-snug text-brand-ink md:text-[15px]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green text-white text-[10px]">
                      ✓
                    </span>
                    {t("marketplace.home.sellerBenefitDelivery")}
                  </li>
                  <li className="flex items-start gap-3 text-[14px] font-medium leading-snug text-brand-ink md:text-[15px]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green text-white text-[10px]">
                      ✓
                    </span>
                    {t("marketplace.home.sellerBenefitPayment")}
                  </li>
                </ul>
              </div>

              <Link
                href="/dashboard/products/new"
                className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-green px-6 text-[15px] font-semibold text-white transition hover:bg-brand-navy active:scale-95 lg:w-auto"
              >
                {t("marketplace.home.sellerAction")}
                <ArrowRight className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </section>
        )}
      </main>

      {/* 8. MOBILE BOTTOM NAVIGATION (STICKY ON MOBILE ONLY) */}
      <nav
        aria-label={t("marketplace.home.mobileNav")}
        className="catalog-bottom-nav fixed z-40 block border-t border-brand-line bg-white/95 backdrop-blur-md md:hidden"
      >
        <div className="flex h-16 items-center justify-around px-2">
          <Link
            href="/"
            className="flex flex-1 flex-col items-center justify-center text-brand-orange"
          >
            <HomeIcon className="h-5 w-5" />
            <span className="mt-1 text-[10px] font-bold">
              {t("marketplace.home.home")}
            </span>
          </Link>

          <Link
            href="#top-search"
            className="flex flex-1 flex-col items-center justify-center text-brand-muted hover:text-brand-navy"
          >
            <Search className="h-5 w-5" />
            <span className="mt-1 text-[10px] font-medium">
              {t("marketplace.home.search")}
            </span>
          </Link>

          {/* Elevated Floating "পোস্ট করুন" Button */}
          <div className="relative -top-3 flex flex-1 flex-col items-center justify-center">
            <Link
              href="/dashboard/products/new"
              aria-label={t("marketplace.home.postProduct")}
              className="flex h-13 w-13 items-center justify-center rounded-full bg-brand-orange text-white shadow-[0_8px_20px_rgba(237,99,51,0.40)] ring-4 ring-white transition active:scale-90"
            >
              <Plus className="h-7 w-7" strokeWidth={2.6} />
            </Link>
            <span className="mt-0.5 text-[10px] font-bold text-brand-orange">
              {t("marketplace.home.post")}
            </span>
          </div>

          <Link
            href="/dashboard/parcels/new"
            className="flex flex-1 flex-col items-center justify-center text-brand-muted hover:text-brand-navy"
          >
            <Truck className="h-5 w-5" />
            <span className="mt-1 text-[10px] font-medium">
              {t("marketplace.home.parcel")}
            </span>
          </Link>

          <Link
            href="/cart"
            className="relative flex flex-1 flex-col items-center justify-center text-brand-muted hover:text-brand-navy"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-orange px-1 text-[9px] font-bold text-white">
                {localizedNumber(cartCount, locale)}
              </span>
            )}
            <span className="mt-1 text-[10px] font-medium">
              {t("marketplace.home.cart")}
            </span>
          </Link>
        </div>
      </nav>

      {/* Spacer to guarantee bottom nav never covers footer or content */}
      <div className="h-24 md:hidden" aria-hidden="true" />

      <PublicFooter />
    </>
  );
}

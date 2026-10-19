"use client";

import {
  useAction,
  useI18n,
  useSession,
  useToast,
} from "@/components/providers";
import { Avatar, PublicFooter, PublicHeader } from "@/components/shell";
import {
  BackLink,
  Button,
  Empty,
  ErrorState,
  Loading,
  PageHeading,
  Pagination,
  Panel,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, money } from "@/lib/api";
import type { Paged, Product, Row } from "@/lib/types";
import {
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Edit3,
  Heart,
  HeartHandshake,
  Home as HomeIcon,
  Lock,
  MapPin,
  Package,
  PackagePlus,
  Plus,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Sofa,
  Apple,
  Store,
  TrendingUp,
  Truck,
} from "lucide-react";
import Image from "next/image";
import { ProductMedia } from "@/components/product-media";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "./cart";
import { toBanglaDigits, discountPercent } from "@/lib/bangla";

function getCategories(t: (key: string) => string) {
  return [
    { id: "all", label: t("marketplace.categories.all") },
    { id: "fashion", label: t("marketplace.categories.fashion") },
    { id: "home", label: t("marketplace.categories.home") },
    { id: "electronics", label: t("marketplace.categories.electronics") },
    { id: "beauty", label: t("marketplace.categories.beauty") },
    { id: "food", label: t("marketplace.categories.food") },
    { id: "other", label: t("marketplace.categories.other") },
  ];
}

function localizedNumber(value: number | string, locale: "bn" | "en") {
  const formatted =
    typeof value === "number" ? value.toLocaleString("en-BD") : String(value);
  return locale === "bn" ? toBanglaDigits(formatted) : formatted;
}

function localizedPrice(value: number, locale: "bn" | "en") {
  return `৳ ${localizedNumber(value, locale)}`;
}

export function PackageArt() {
  const { t } = useI18n();
  return (
    <div
      className="relative flex h-64 w-72 items-center justify-center"
      aria-hidden="true"
    >
      {/* Decorative concentric pulse circles */}
      <div className="absolute h-56 w-56 rounded-full border border-dashed border-white/30" />
      <div className="absolute h-64 w-64 rounded-full border border-white/20" />

      {/* Main Parcel Box */}
      <div className="relative z-10 flex h-36 w-44 -rotate-6 flex-col justify-between rounded-2xl bg-[#e9c49f] p-4 text-[#784d29] shadow-2xl ring-2 ring-white/40">
        <div className="flex items-center justify-between">
          <div className="h-6 w-12 rounded bg-[#f5d9bc]" />
          <Package className="h-6 w-6 text-[#9e6538]" />
        </div>
        <div className="space-y-1">
          <div className="h-1.5 w-16 rounded bg-[#cca27a]" />
          <div className="h-1.5 w-10 rounded bg-[#cca27a]" />
        </div>
        <div className="flex items-center justify-between border-t border-[#d8ae86] pt-2 text-[10px] font-bold">
          <span>PICKPARCEL</span>
          <span>BD 🇧🇩</span>
        </div>
      </div>

      {/* Floating Trust Badge 1 */}
      <div className="absolute -bottom-1 -left-2 z-20 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-brand-navy shadow-lg ring-1 ring-black/5 -rotate-3">
        <CheckCircle2 className="h-4 w-4 text-brand-green" />
        <div>
          <strong className="block text-[11px] leading-tight">
            {t("marketplace.home.deliverySuccess")}
          </strong>
          <span className="text-[10px] text-brand-muted font-normal">
            {t("marketplace.home.deliveryTime")}
          </span>
        </div>
      </div>

      {/* Floating Trust Badge 2 */}
      <div className="absolute top-1 -right-2 z-20 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-brand-navy shadow-lg ring-1 ring-black/5 rotate-3">
        <Truck className="h-4 w-4 text-brand-orange" />
        <div>
          <strong className="block text-[11px] leading-tight">
            {t("marketplace.home.liveTracking")}
          </strong>
          <span className="text-[10px] text-brand-muted font-normal">
            {t("marketplace.home.realtimeUpdates")}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ProductCard({ product: p }: { product: Product }) {
  const cart = useCart();
  const toast = useToast();
  const { t, locale } = useI18n();
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);

  const discount = p.discount_percent
    ? Math.round(Number(p.discount_percent))
    : discountPercent(Number(p.effective_price), Number(p.price));

  const handleAddToCart = () => {
    cart.add({
      product_id: p.id,
      seller_id: p.user_id,
      quantity: 1,
      name: p.name,
      price: p.effective_price,
      image_url: p.image_url,
      seller_name: p.seller_name || "Seller",
    });
    setAdded(true);
    toast(t("marketplace.addedToBag"));
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article className="product-tile group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white">
      <div className="relative aspect-square overflow-hidden bg-[#f2f4ef]">
        <Link href={`/products/${p.id}`} className="block h-full w-full">
          <ProductMedia src={p.image_url} alt={p.name} />
        </Link>
        {discount > 0 && (
          <span className="product-discount-badge absolute left-3 top-3 rounded-full bg-brand-orange px-2 py-1 text-[12px] font-semibold leading-none text-white">
            {localizedNumber(discount, locale)}
            {t("marketplace.offDiscount")}
          </span>
        )}
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          aria-pressed={liked}
          aria-label={
            liked
              ? t("marketplace.home.wishlistRemove")
              : t("marketplace.home.wishlistAdd")
          }
          className="product-wishlist-button absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition-transform duration-150 active:scale-90">
            <Heart
              className={`h-[18px] w-[18px] transition-colors duration-150 ${
                liked
                  ? "fill-brand-orange text-brand-orange"
                  : "text-brand-navy"
              }`}
            />
          </span>
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3 md:p-4">
        <Link href={`/products/${p.id}`}>
          <h3 className="product-tile-title line-clamp-2 min-h-[2.8em] text-[13.5px] sm:text-[14px] font-semibold leading-snug text-brand-ink transition group-hover:text-brand-orange">
            {p.name}
          </h3>
        </Link>

        {p.seller_public_id && (
          <Link
            className="mt-1 flex min-w-0 items-center gap-1 text-[12px] text-brand-muted hover:text-brand-orange md:text-[13px]"
            href={`/sellers/${p.seller_public_id}`}
          >
            <Store className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {p.seller_name || t("marketplace.home.sellerFallback")}
            </span>
            {!!p.seller_verified && (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand-green" />
            )}
          </Link>
        )}

        <div className="mt-auto flex items-end justify-between gap-1.5 pt-3">
          <div className="leading-tight">
            <p className="product-current-price text-[16px] font-bold text-brand-navy sm:text-[18px]">
              {localizedPrice(Number(p.effective_price), locale)}
            </p>
            {Number(p.effective_price) < Number(p.price) && (
              <p className="product-original-price text-[12px] text-brand-muted line-through md:text-[13px]">
                {localizedPrice(Number(p.price), locale)}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label={t("marketplace.home.addProductToBag", {
              product: p.name,
            })}
            onClick={handleAddToCart}
            className={`product-add-button flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition-[background-color,transform] duration-150 active:scale-90 ${
              added
                ? "bg-brand-green"
                : "bg-brand-orange hover:bg-brand-orange-dark shadow-sm"
            }`}
          >
            {added ? (
              <Check className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Plus className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export function CatalogScreen({
  home = false,
  seller,
}: {
  home?: boolean;
  seller?: string;
}) {
  const { t, locale } = useI18n();
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
            <Empty
              title={t("marketplace.home.emptyTitle")}
              description={t("marketplace.home.emptyDescription")}
              action={
                <Link
                  href="/dashboard/products/new"
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-brand-orange px-5 text-xs font-bold text-white shadow-sm hover:bg-brand-orange-dark"
                >
                  <PackagePlus className="h-4 w-4" />
                  {t("marketplace.home.postProduct")}
                </Link>
              }
            />
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
        className="fixed bottom-0 left-0 right-0 z-40 block border-t border-brand-line bg-white/95 pb-safe backdrop-blur-md md:hidden"
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
      <div className="h-16 md:hidden" aria-hidden="true" />

      <PublicFooter />
    </>
  );
}

export function ProductDetailScreen({ id }: { id: string }) {
  const { data, error, loading, reload } = useResource<{
    product: Product;
    seller: Row;
  }>(`/products/${id}`);
  const [quantity, setQuantity] = useState(1);
  const cart = useCart();
  const toast = useToast();
  const { t, locale } = useI18n();
  return (
    <>
      <PublicHeader />
      <main className="public-container">
        <BackLink
          href="/products"
          label={
            locale === "bn" ? "মার্কেটপ্লেসে ফিরে যান" : "Back to discoveries"
          }
        />
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} retry={reload} />
        ) : (
          data && (
            <div className="product-detail">
              <div className="product-detail-image">
                <ProductMedia
                  key={data.product.image_url}
                  src={data.product.image_url}
                  alt={data.product.name}
                  detail
                />
              </div>
              <div>
                <span className="eyebrow">
                  {data.product.category} ·{" "}
                  {locale === "bn" ? "নির্বাচিত পণ্য" : "A LOCAL DISCOVERY"}
                </span>
                <h1>{data.product.name}</h1>
                <p>
                  {data.product.description ||
                    (locale === "bn"
                      ? "আমাদের কমিউনিটির একজন স্বাধীন বিক্রেতার চমৎকার পণ্য।"
                      : "A little something from an independent seller in our community.")}
                </p>
                <div className="detail-price">
                  {money(data.product.effective_price)}
                  {Number(data.product.effective_price) <
                    Number(data.product.price) && (
                    <del
                      className="muted"
                      style={{ fontSize: 18, marginLeft: 15 }}
                    >
                      {money(data.product.price)}
                    </del>
                  )}
                </div>
                <div className="button-row">
                  <div className="quantity">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      −
                    </button>
                    <span>{quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      onClick={() => setQuantity(Math.min(99, quantity + 1))}
                    >
                      +
                    </button>
                  </div>
                  <Button
                    onClick={() => {
                      cart.add({
                        product_id: data.product.id,
                        seller_id: data.product.user_id,
                        quantity,
                        name: data.product.name,
                        price: data.product.effective_price,
                        image_url: data.product.image_url,
                        seller_name: String(data.seller.name),
                      });
                      toast(t("marketplace.addedToBag"));
                    }}
                  >
                    <ShoppingBag size={17} />
                    {locale === "bn" ? "ব্যাগে যোগ করুন" : "Add to bag"}
                  </Button>
                </div>
                <div className="seller-box">
                  <Avatar name={String(data.seller.name)} />
                  <div>
                    <strong>
                      {String(data.seller.name)}{" "}
                      {!!data.seller.verified && (
                        <ShieldCheck size={13} color="var(--green)" />
                      )}
                    </strong>
                    <p>
                      <MapPin size={10} />{" "}
                      {String(
                        data.seller.district ||
                          (locale === "bn" ? "বাংলাদেশ" : "Bangladesh"),
                      )}
                    </p>
                  </div>
                  <Link
                    className="button secondary"
                    href={`/sellers/${data.seller.public_id}`}
                  >
                    {locale === "bn" ? "দোকান ভিজিট করুন" : "Visit shop"}{" "}
                    <ArrowRight size={13} />
                  </Link>
                </div>
                <p style={{ fontSize: 11, marginTop: 25 }}>
                  {locale === "bn"
                    ? "ডেলিভারির পূর্বে প্রতিটি অর্ডার বিক্রেতা দ্বারা যাচাই করা হয়। চেকআউটে চূড়ান্ত ডেলিভারি চার্জ প্রদর্শিত হবে।"
                    : "Each order is confirmed by the seller before delivery. Final delivery charges are shown at checkout."}
                </p>
              </div>
            </div>
          )
        )}
      </main>
      <PublicFooter />
    </>
  );
}
export function CartScreen() {
  const cart = useCart();
  const { session } = useSession();
  const { run, busy } = useAction();
  const { t, locale } = useI18n();
  const [payment, setPayment] = useState("cod");
  const [agreed, setAgreed] = useState(false);
  const [quote, setQuote] = useState<{
    fingerprint: string;
    total: string;
    groups: {
      seller_name: string;
      subtotal: string;
      delivery_charge: string;
      total: string;
    }[];
    cartKey: string;
  }>();
  const cartKey = JSON.stringify({
    items: cart.items.map((i) => ({
      product_id: i.product_id,
      quantity: i.quantity,
    })),
    payment_method: payment,
  });
  const reviewed = quote?.cartKey === cartKey ? quote : undefined;
  const [orders, setOrders] = useState<number[]>();
  const subtotal = cart.items.reduce(
    (sum, i) => sum + Number(i.price) * i.quantity,
    0,
  );
  return (
    <>
      <PublicHeader />
      <main className="public-container">
        <PageHeading
          eyebrow={t("marketplace.headingEyebrow")}
          title={t("marketplace.cart.title")}
          description={t("marketplace.cart.subtitle")}
        />
        {orders ? (
          <Panel>
            <Empty
              title={t("marketplace.cart.orderPlaced")}
              description={
                locale === "bn"
                  ? `অর্ডার নম্বর ${orders.map((i) => "#" + i).join(", ")} সফলভাবে সাবমিট হয়েছে। বিক্রেতা নিশ্চিত করলে আপনাকে জানানো হবে।`
                  : `Order ${orders.map((i) => "#" + i).join(", ")} placed. You’ll hear from us when it’s confirmed.`
              }
              action={
                <Link href="/dashboard/orders" className="button primary">
                  {t("nav.customer.orders")} <ArrowRight size={15} />
                </Link>
              }
            />
          </Panel>
        ) : cart.items.length ? (
          <div className="detail-grid">
            <Panel>
              {cart.items.map((i) => (
                <div className="cart-row" key={i.product_id}>
                  {i.image_url ? (
                    <Image
                      src={i.image_url}
                      alt={i.name}
                      width={100}
                      height={100}
                      unoptimized
                    />
                  ) : (
                    <Package size={45} />
                  )}
                  <div>
                    <Link href={`/products/${i.product_id}`}>
                      <h3>{i.name}</h3>
                    </Link>
                    <p>{i.seller_name}</p>
                    <button
                      className="text-link"
                      style={{
                        background: "none",
                        border: 0,
                        padding: 0,
                        marginTop: 8,
                      }}
                      onClick={() => cart.remove(i.product_id)}
                    >
                      {t("common.remove")}
                    </button>
                  </div>
                  <div className="price-row">
                    <div className="quantity">
                      <button
                        aria-label={`Decrease ${i.name} quantity`}
                        onClick={() =>
                          cart.quantity(i.product_id, i.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span>{i.quantity}</span>
                      <button
                        aria-label={`Increase ${i.name} quantity`}
                        onClick={() =>
                          cart.quantity(i.product_id, i.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <strong style={{ marginLeft: 16 }}>
                      {money(Number(i.price) * i.quantity)}
                    </strong>
                  </div>
                </div>
              ))}
            </Panel>
            <Panel title={t("marketplace.cart.summaryTitle")}>
              <div className="cart-summary">
                <div className="key-value">
                  <span>{t("marketplace.cart.itemsSubtotal")}</span>
                  <strong>{money(subtotal)}</strong>
                </div>
                <div className="key-value">
                  <span>{t("marketplace.cart.deliveryEstimate")}</span>
                  <strong>
                    {locale === "bn"
                      ? "চেকআউটে নির্ধারিত হবে"
                      : "Calculated at checkout"}
                  </strong>
                </div>
                <p style={{ fontSize: 11, marginTop: 16 }}>
                  {t("marketplace.cart.deliveryNote")}
                </p>
                <label className="field" style={{ marginBottom: 20 }}>
                  <span>{t("marketplace.cart.paymentMethod")}</span>
                  <select
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                  >
                    <option value="cod">
                      {t("marketplace.cart.paymentCod")}
                    </option>
                    <option value="prepaid">
                      {t("marketplace.cart.paymentPrepaid")}
                    </option>
                  </select>
                </label>
                {session?.user ? (
                  <>
                    <Button
                      tone="secondary"
                      className="full-width"
                      disabled={busy}
                      onClick={() =>
                        void run(async () => {
                          const result = await api.post<
                            Omit<NonNullable<typeof quote>, "cartKey">
                          >("/orders/quote", JSON.parse(cartKey));
                          setQuote({ ...result, cartKey });
                        }, t("marketplace.cart.pricesReviewed"))
                      }
                    >
                      {t("marketplace.cart.reviewPrices")}
                    </Button>
                    {reviewed && (
                      <div style={{ margin: "20px 0" }}>
                        {reviewed.groups.map((g, i) => (
                          <div key={i}>
                            <h4>{g.seller_name}</h4>
                            <p>
                              {locale === "bn" ? "পণ্য" : "Items"}{" "}
                              {money(g.subtotal)} +{" "}
                              {t("marketplace.cart.deliveryLabel")}{" "}
                              {money(g.delivery_charge)}
                            </p>
                          </div>
                        ))}
                        <div className="key-value">
                          <strong>{t("marketplace.cart.orderTotal")}</strong>
                          <strong>{money(reviewed.total)}</strong>
                        </div>
                      </div>
                    )}
                    <label
                      className="checkbox-field field"
                      style={{ margin: "20px 0" }}
                    >
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                      />
                      <span>
                        <Link
                          href="/terms"
                          target="_blank"
                          className="text-link"
                        >
                          {t("footer.terms")}
                        </Link>{" "}
                        {t("marketplace.cart.termsAgree")}
                      </span>
                    </label>
                    <Button
                      className="full-width"
                      disabled={busy || !reviewed || !agreed}
                      onClick={async () => {
                        await run(async () => {
                          const result = await api.post<{
                            order_ids: number[];
                          }>("/orders", {
                            items: cart.items.map((i) => ({
                              product_id: i.product_id,
                              quantity: i.quantity,
                            })),
                            payment_method: payment,
                            fingerprint: reviewed?.fingerprint,
                            terms_accepted: agreed,
                          });
                          setOrders(result.order_ids);
                          cart.clear();
                        }, t("marketplace.cart.orderPlaced"));
                      }}
                    >
                      {t("marketplace.cart.placeOrder")}{" "}
                      <ArrowRight size={16} />
                    </Button>
                  </>
                ) : (
                  <Link
                    className="button primary full-width"
                    href="/login?return=/cart"
                  >
                    {t("marketplace.cart.signInToCheckout")}{" "}
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </Panel>
          </div>
        ) : (
          <Empty
            title={t("marketplace.cart.emptyTitle")}
            description={t("marketplace.cart.emptyDesc")}
            action={
              <Link className="button primary" href="/products">
                {t("marketplace.cart.emptyAction")} <ArrowRight size={15} />
              </Link>
            }
          />
        )}
      </main>
      <PublicFooter />
    </>
  );
}

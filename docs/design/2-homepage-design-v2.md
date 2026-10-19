```index.tsx
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<App />);
}

```
```App.tsx
import React from "react";
import { MotionConfig } from "framer-motion";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Home } from "./pages/Home";

type AppProps = {
  language?: "bn" | "en";
  productFeedState?: "live" | "loading" | "empty" | "error";
};

export function App({ language = "bn", productFeedState = "live" }: AppProps) {
  return (
    <MotionConfig reducedMotion="user">
      <LanguageProvider initialLanguage={language}>
        <Home feedOverride={productFeedState} />
      </LanguageProvider>
    </MotionConfig>
  );
}

```
```package.json
{
  "name": "magic-patterns-project",
  "private": true,
  "dependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-router-dom": "6.30.2",
    "lucide-react": "0.577.0",
    "framer-motion": "11.18.2",
    "@radix-ui/react-icons": "1.3.2",
    "date-fns": "4.1.0",
    "tailwind-merge": "2.6.1"
  }
}

```
```index.css
/* @import url() FONT IMPORTS MUST ALWAYS BE AT THE VERY TOP OF THIS FILE, ABOVE THE TAILWIND IMPORTS — DO NOT DELETE THIS COMMENT */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');

/* CRITICAL: THE FOLLOWING TAILWIND IMPORTS MUST NEVER BE DELETED OR REORDERED — DO NOT DELETE THIS COMMENT */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* END TAILWIND IMPORTS — ALL OTHER CSS MUST GO BELOW THIS LINE */

body {
  font-family: 'DM Sans', 'Noto Sans Bengali', system-ui, sans-serif;
  background: #f7f8f4;
  color: #24342e;
  font-size: 14px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
:focus-visible {
  outline: 2px solid #ed6333;
  outline-offset: 2px;
}
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: none;
}
input[type='search']::-webkit-search-cancel-button {
  display: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
.shimmer {
  position: relative;
  overflow: hidden;
  background: #eceee9;
}
.shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.65), transparent);
  animation: shimmer 1.4s infinite;
}
@media (prefers-reduced-motion: reduce) {
  .shimmer::after {
    animation: none;
  }
}

```
```tailwind.config.js
export default {
  content: ["./**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#ed6333",
          "orange-dark": "#c8471d",
          navy: "#20352f",
          green: "#267658",
          mint: "#edf6ef",
          bg: "#f7f8f4",
          text: "#24342e",
          muted: "#5f6a63",
          border: "#e3e7e0",
          danger: "#b42318",
          "danger-soft": "#fdf0ee",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', '"Noto Sans Bengali"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        btn: "12px",
      },
      boxShadow: {
        "card-hover": "0 12px 32px -12px rgba(32,53,47,0.18)",
        fab: "0 6px 16px -4px rgba(237,99,51,0.45)",
        dialog: "0 24px 64px -16px rgba(32,53,47,0.28)",
      },
    },
  },
};

```
```types/marketplace.ts
import type { Language } from "./i18n";

export type LocalizedText = Record<Language, string>;

export type CategoryKey =
  | "fashion"
  | "electronics"
  | "food"
  | "beauty"
  | "home"
  | "other";

export type TrendingKey = "saree" | "mobile" | "shoes" | "bag" | "cosmetics" | "honey";

export type Product = {
  id: string;
  name: LocalizedText;
  seller: LocalizedText;
  verified: boolean;
  category: CategoryKey;
  keywords: TrendingKey[];
  price: number;
  originalPrice: number;
  image: string;
};

export type CartLine = {
  product: Product;
  quantity: number;
};

export type FeedStatus = "loading" | "ready" | "error";

export type FeedOverride = "live" | "loading" | "empty" | "error";

export type Panel = "post" | "parcel" | "cart" | null;

export type ParcelWeight = "small" | "medium" | "large";

export type SubmitStatus = "idle" | "submitting" | "success";

```
```data/products.ts
import type { Product } from "../types/marketplace";

export const products: Product[] = [
  {
    id: "p1",
    name: { bn: "হাতে বোনা জামদানি শাড়ি — লাল সোনালি", en: "Handwoven Jamdani saree — red & gold" },
    seller: { bn: "তাঁতঘর টাঙ্গাইল", en: "Tantghor Tangail" },
    verified: true,
    category: "fashion",
    keywords: ["saree"],
    price: 4250,
    originalPrice: 5300,
    image: "https://cdn.magicpatterns.com/patterns/generated-images/52595bc0-5fb1-4658-ab15-b44f02253761.jpg",
  },
  {
    id: "p2",
    name: { bn: "সুন্দরবনের অর্গানিক মধু — ৫০০ গ্রাম", en: "Organic Sundarbans honey — 500 g" },
    seller: { bn: "খাঁটি খাবার", en: "Khanti Khabar" },
    verified: true,
    category: "food",
    keywords: ["honey"],
    price: 850,
    originalPrice: 1050,
    image: "https://cdn.magicpatterns.com/patterns/generated-images/5c8282e8-3e9a-4786-9c44-4ccf734c93a5.jpg",
  },
  {
    id: "p3",
    name: { bn: "স্মার্টফোন কভার — ম্যাট সিলিকন", en: "Smartphone cover — matte silicone" },
    seller: { bn: "গ্যাজেট বাজার", en: "Gadget Bazar" },
    verified: false,
    category: "electronics",
    keywords: ["mobile"],
    price: 320,
    originalPrice: 450,
    image: "https://cdn.magicpatterns.com/patterns/generated-images/6e9b89cd-a179-4579-83bd-510371dbc38f.jpg",
  },
  {
    id: "p4",
    name: { bn: "নকশিকাঁথা কুশন কভার (২ পিস)", en: "Nakshi Kantha cushion covers (set of 2)" },
    seller: { bn: "যশোরের কারুশিল্প", en: "Jashore Crafts" },
    verified: true,
    category: "home",
    keywords: [],
    price: 690,
    originalPrice: 900,
    image: "https://cdn.magicpatterns.com/patterns/generated-images/7da7ed1f-f8fb-4951-b538-126e0ba27bb7.jpg",
  },
  {
    id: "p5",
    name: { bn: "হাতে তৈরি চামড়ার স্যান্ডেল", en: "Handmade leather sandals" },
    seller: { bn: "চামড়া কুটির", en: "Chamra Kutir" },
    verified: false,
    category: "fashion",
    keywords: ["shoes"],
    price: 1450,
    originalPrice: 1800,
    image: "https://cdn.magicpatterns.com/patterns/generated-images/b722eb31-66b1-48ef-bc35-5217d44f7ece.jpg",
  },
  {
    id: "p6",
    name: { bn: "ওয়্যারলেস ইয়ারবাডস — ২০ ঘণ্টা ব্যাকআপ", en: "Wireless earbuds — 20-hour battery" },
    seller: { bn: "টেক হাব ঢাকা", en: "Tech Hub Dhaka" },
    verified: true,
    category: "electronics",
    keywords: ["mobile"],
    price: 1890,
    originalPrice: 2490,
    image: "https://cdn.magicpatterns.com/patterns/generated-images/99f86fb0-e82a-40ee-a475-ad2e31558c52.jpg",
  },
  {
    id: "p7",
    name: { bn: "রাজশাহীর হিমসাগর আম — ৫ কেজি", en: "Rajshahi Himsagar mangoes — 5 kg" },
    seller: { bn: "বাগান থেকে", en: "Straight from the Orchard" },
    verified: false,
    category: "food",
    keywords: [],
    price: 1200,
    originalPrice: 1400,
    image: "https://cdn.magicpatterns.com/patterns/generated-images/51caada2-d2a0-4a31-befd-852c714340ad.jpg",
  },
  {
    id: "p8",
    name: { bn: "ম্যাট লিপস্টিক সেট (২টি শেড)", en: "Matte lipstick set (2 shades)" },
    seller: { bn: "রূপকথা বিউটি", en: "Rupkotha Beauty" },
    verified: true,
    category: "beauty",
    keywords: ["cosmetics"],
    price: 590,
    originalPrice: 750,
    image: "https://cdn.magicpatterns.com/patterns/generated-images/ef85ad82-f1c6-4134-8a3e-b0cafb2e0753.jpg",
  },
];

```
```data/categories.ts
import type { TranslationKey } from "./translations";
import type { CategoryKey, ParcelWeight, TrendingKey } from "../types/marketplace";

export const categories: { key: CategoryKey; labelKey: TranslationKey }[] = [
  { key: "fashion", labelKey: "category.fashion" },
  { key: "electronics", labelKey: "category.electronics" },
  { key: "food", labelKey: "category.food" },
  { key: "beauty", labelKey: "category.beauty" },
  { key: "home", labelKey: "category.home" },
  { key: "other", labelKey: "category.other" },
];

export const trendingTerms: { key: TrendingKey; labelKey: TranslationKey }[] = [
  { key: "saree", labelKey: "trending.saree" },
  { key: "mobile", labelKey: "trending.mobile" },
  { key: "shoes", labelKey: "trending.shoes" },
  { key: "bag", labelKey: "trending.bag" },
  { key: "cosmetics", labelKey: "trending.cosmetics" },
  { key: "honey", labelKey: "trending.honey" },
];

export const sellerBenefits: TranslationKey[] = [
  "seller.benefitShop",
  "seller.benefitDelivery",
  "seller.benefitPayment",
];

export const parcelWeights: { key: ParcelWeight; labelKey: TranslationKey; fee: number }[] = [
  { key: "small", labelKey: "parcel.weightSmall", fee: 60 },
  { key: "medium", labelKey: "parcel.weightMedium", fee: 110 },
  { key: "large", labelKey: "parcel.weightLarge", fee: 160 },
];

```
```components/CategoryIcon.tsx
import React from "react";
import {
  ShirtIcon,
  SmartphoneIcon,
  AppleIcon,
  SparklesIcon,
  SofaIcon,
  PackageIcon,
} from "lucide-react";
import type { CategoryKey } from "../types/marketplace";

type CategoryIconProps = {
  category: CategoryKey;
  className?: string;
};

const ICONS: Record<CategoryKey, typeof ShirtIcon> = {
  fashion: ShirtIcon,
  electronics: SmartphoneIcon,
  food: AppleIcon,
  beauty: SparklesIcon,
  home: SofaIcon,
  other: PackageIcon,
};

export function CategoryIcon({ category, className }: CategoryIconProps) {
  const Icon = ICONS[category];
  return <Icon className={className} aria-hidden="true" />;
}

```
```components/HeroBanner.tsx
import React from "react";
import { PackagePlusIcon, ShoppingBagIcon, TruckIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "./Button";
import { Container } from "./Container";
import { QuickPostCard } from "./QuickPostCard";

type HeroBannerProps = {
  onPost: () => void;
  onBrowse: () => void;
  onParcel: () => void;
};

export function HeroBanner({ onPost, onBrowse, onParcel }: HeroBannerProps) {
  const { t } = useLanguage();

  const stats = [
    { value: t("hero.statSellersValue", { count: 50000 }), label: t("hero.statSellers") },
    { value: t("hero.statDistrictsValue", { count: 64 }), label: t("hero.statDistricts") },
    { value: t("hero.statDeliveryValue", { count: 24 }), label: t("hero.statDelivery") },
  ];

  return (
    <section aria-labelledby="hero-title" className="pt-4 md:pt-8">
      <Container>
        <div className="grid items-center gap-8 rounded-3xl bg-brand-navy px-5 py-8 sm:px-8 md:p-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-16 lg:p-16">
          <div className="min-w-0">
            <h1
              id="hero-title"
              className="max-w-xl text-[28px] font-bold leading-[1.3] text-white sm:text-[36px] lg:text-[48px] lg:leading-[1.2]"
            >
              {t("hero.title")}
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-[1.75] text-white/75 md:text-[17px]">
              {t("hero.subtitle")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button size="lg" fullWidth className="sm:w-auto" onClick={onPost}>
                <PackagePlusIcon className="h-[18px] w-[18px]" aria-hidden="true" />
                {t("action.postProduct")}
              </Button>
              <div className="grid grid-cols-2 gap-3 sm:flex">
                <Button variant="inverse" size="lg" className="min-w-0 px-3 sm:px-6" onClick={onBrowse}>
                  <ShoppingBagIcon className="hidden h-[18px] w-[18px] sm:block" aria-hidden="true" />
                  {t("action.browseProducts")}
                </Button>
                <Button variant="inverse" size="lg" className="min-w-0 px-3 sm:px-6" onClick={onParcel}>
                  <TruckIcon className="hidden h-[18px] w-[18px] sm:block" aria-hidden="true" />
                  {t("action.bookParcel")}
                </Button>
              </div>
            </div>

            <dl className="mt-10 hidden flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-8 md:flex">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse">
                  <dt className="text-[13px] text-white/65">{s.label}</dt>
                  <dd className="text-[22px] font-bold leading-tight text-white">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <QuickPostCard />
        </div>
      </Container>
    </section>
  );
}

```
```components/QuickPostCard.tsx
import React from "react";
import { CameraIcon, CircleCheckIcon, FilePenLineIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import type { TranslationKey } from "../data/translations";

const steps: { titleKey: TranslationKey; descriptionKey: TranslationKey; Icon: typeof CameraIcon }[] = [
  { titleKey: "quickPost.step1Title", descriptionKey: "quickPost.step1Description", Icon: CameraIcon },
  { titleKey: "quickPost.step2Title", descriptionKey: "quickPost.step2Description", Icon: FilePenLineIcon },
  { titleKey: "quickPost.step3Title", descriptionKey: "quickPost.step3Description", Icon: CircleCheckIcon },
];

export function QuickPostCard() {
  const { t, formatNumber } = useLanguage();

  return (
    <div className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-inset ring-white/10 md:p-6">
      <h2 className="text-[17px] font-semibold leading-snug text-white">{t("quickPost.title")}</h2>
      <p className="mt-1 text-[14px] leading-relaxed text-white/70">{t("quickPost.description")}</p>

      <ol className="mt-6 grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-5">
        {steps.map(({ titleKey, descriptionKey, Icon }, i) => (
          <li
            key={titleKey}
            className="flex flex-col items-center gap-2 text-center lg:flex-row lg:items-start lg:gap-4 lg:text-left"
          >
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange">
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold leading-none text-brand-navy">
                {formatNumber(i + 1)}
              </span>
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold leading-snug text-white md:text-[14px]">{t(titleKey)}</p>
              <p className="mt-0.5 hidden text-[13px] leading-relaxed text-white/65 lg:block">{t(descriptionKey)}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-6 border-t border-white/10 pt-4 text-center text-[13px] leading-relaxed text-white/65 lg:text-left">
        {t("quickPost.note")}
      </p>
    </div>
  );
}

```
```components/TrustStrip.tsx
import React from "react";
import { BadgeCheckIcon, LockIcon, MapPinIcon, TruckIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import type { TranslationKey } from "../data/translations";
import { Container } from "./Container";

const items: { titleKey: TranslationKey; descriptionKey: TranslationKey; Icon: typeof TruckIcon }[] = [
  { titleKey: "trust.deliveryTitle", descriptionKey: "trust.deliveryDescription", Icon: TruckIcon },
  { titleKey: "trust.paymentTitle", descriptionKey: "trust.paymentDescription", Icon: LockIcon },
  { titleKey: "trust.trackingTitle", descriptionKey: "trust.trackingDescription", Icon: MapPinIcon },
  { titleKey: "trust.sellersTitle", descriptionKey: "trust.sellersDescription", Icon: BadgeCheckIcon },
];

export function TrustStrip() {
  const { t } = useLanguage();

  return (
    <section aria-labelledby="trust-title" className="py-8 md:py-14">
      <Container>
        <h2 id="trust-title" className="sr-only">
          {t("trust.title")}
        </h2>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4 md:gap-8">
          {items.map(({ titleKey, descriptionKey, Icon }) => (
            <li key={titleKey} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-mint text-brand-green">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-[14px] font-semibold leading-snug text-brand-navy md:text-[15px]">{t(titleKey)}</p>
                <p className="mt-1 hidden text-[13px] leading-relaxed text-brand-muted sm:block">{t(descriptionKey)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

```
```components/ProductCard.tsx
import React, { useEffect, useState } from "react";
import { BadgeCheckIcon, CheckIcon, HeartIcon, PlusIcon, StoreIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import type { Product } from "../types/marketplace";
import { discountPercent } from "../utils/numbers";

type ProductCardProps = {
  product: Product;
  onAdd: (product: Product) => void;
};

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const { t, localize, formatPrice } = useLanguage();
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);
  const name = localize(product.name);
  const discount = discountPercent(product.price, product.originalPrice);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1400);
    return () => window.clearTimeout(timer);
  }, [added]);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-border bg-white transition-[box-shadow,border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-transparent hover:shadow-card-hover">
      <div className="relative aspect-square overflow-hidden bg-brand-bg">
        <img
          src={product.image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-orange px-2 py-1 text-[12px] font-semibold leading-none text-white">
            {t("product.discount", { percent: discount })}
          </span>
        )}
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          aria-pressed={liked}
          aria-label={t(liked ? "product.wishlistRemove" : "product.wishlistAdd", { name })}
          className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition-transform duration-150 active:scale-90">
            <HeartIcon
              className={`h-[18px] w-[18px] transition-colors duration-150 ${
                liked ? "fill-brand-orange text-brand-orange" : "text-brand-navy"
              }`}
              aria-hidden="true"
            />
          </span>
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3 md:p-4">
        <h3 className="line-clamp-2 min-h-[2.9em] text-[14px] font-semibold leading-[1.45] text-brand-text md:text-[15px]">
          {name}
        </h3>
        <p className="mt-1 flex min-w-0 items-center gap-1 text-[12px] text-brand-muted md:text-[13px]">
          <StoreIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{localize(product.seller)}</span>
          {product.verified && (
            <BadgeCheckIcon className="h-3.5 w-3.5 shrink-0 text-brand-green" aria-label={t("product.verified")} role="img" />
          )}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0 leading-tight">
            <p className="text-[16px] font-bold text-brand-navy md:text-[18px]">
              <span className="sr-only">{t("product.currentPrice", { price: formatPrice(product.price) })}</span>
              <span aria-hidden="true">{formatPrice(product.price)}</span>
            </p>
            <p className="mt-0.5 text-[12px] text-brand-muted line-through md:text-[13px]">
              <span className="sr-only">{t("product.originalPrice", { price: formatPrice(product.originalPrice) })}</span>
              <span aria-hidden="true">{formatPrice(product.originalPrice)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onAdd(product);
              setAdded(true);
            }}
            aria-label={t("product.addToCart", { name })}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition-[background-color,transform] duration-150 active:scale-90 ${
              added ? "bg-brand-green" : "bg-brand-orange hover:bg-brand-orange-dark"
            }`}
          >
            {added ? <CheckIcon className="h-5 w-5" aria-hidden="true" /> : <PlusIcon className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </article>
  );
}

```
```components/ProductSkeleton.tsx
import React from "react";

export function ProductSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-border bg-white" aria-hidden="true">
      <div className="shimmer aspect-square" />
      <div className="flex flex-1 flex-col p-3 md:p-4">
        <div className="shimmer h-4 w-full rounded" />
        <div className="shimmer mt-2 h-4 w-2/3 rounded" />
        <div className="shimmer mt-3 h-3 w-1/2 rounded" />
        <div className="mt-auto flex items-end justify-between pt-4">
          <div className="shimmer h-5 w-16 rounded" />
          <div className="shimmer h-11 w-11 rounded-full" />
        </div>
      </div>
    </div>
  );
}

```
```components/SectionHeader.tsx
import React from "react";

type SectionHeaderProps = {
  id: string;
  title: string;
  description?: string;
  aside?: React.ReactNode;
};

export function SectionHeader({ id, title, description, aside }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h2 id={id} className="text-[20px] font-bold leading-[1.3] text-brand-navy md:text-[26px]">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[14px] leading-relaxed text-brand-muted md:text-[15px]" aria-live="polite">
            {description}
          </p>
        )}
      </div>
      {aside}
    </div>
  );
}

```
```components/CategoryGrid.tsx
import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { categories } from "../data/categories";
import type { CategoryKey, Product } from "../types/marketplace";
import { CategoryIcon } from "./CategoryIcon";
import { Container } from "./Container";
import { SectionHeader } from "./SectionHeader";

type CategoryGridProps = {
  items: Product[];
  selected: CategoryKey | null;
  onSelect: (key: CategoryKey) => void;
};

export function CategoryGrid({ items, selected, onSelect }: CategoryGridProps) {
  const { t } = useLanguage();

  return (
    <section id="categories" aria-labelledby="categories-title" className="scroll-mt-24">
      <Container>
        <SectionHeader id="categories-title" title={t("categories.title")} description={t("categories.subtitle")} />
        <ul className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-6 md:gap-4">
          {categories.map((c) => {
            const isSelected = c.key === selected;
            const count = items.filter((p) => p.category === c.key).length;
            return (
              <li key={c.key}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelect(c.key)}
                  className={`flex h-full w-full flex-col items-center justify-start gap-2 rounded-2xl border px-2 py-4 text-center transition-[background-color,border-color,color] duration-150 md:py-6 ${
                    isSelected
                      ? "border-brand-navy bg-brand-navy text-white"
                      : "border-brand-border bg-white text-brand-navy hover:border-brand-green/40 hover:bg-brand-mint/50"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-150 ${
                      isSelected ? "bg-white/10 text-white" : "bg-brand-mint text-brand-green"
                    }`}
                  >
                    <CategoryIcon category={c.key} className="h-5 w-5" />
                  </span>
                  <span className="text-[13px] font-semibold leading-snug md:text-[14px]">{t(c.labelKey)}</span>
                  <span className={`text-[12px] leading-none ${isSelected ? "text-white/70" : "text-brand-muted"}`}>
                    {t("categories.count", { count })}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

```
```components/SellerSpotlight.tsx
import React from "react";
import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { sellerBenefits } from "../data/categories";
import { Button } from "./Button";
import { Container } from "./Container";

type SellerSpotlightProps = {
  onStart: () => void;
};

export function SellerSpotlight({ onStart }: SellerSpotlightProps) {
  const { t } = useLanguage();

  return (
    <section id="seller" aria-labelledby="seller-title" className="scroll-mt-24 pt-16 md:pt-24">
      <Container>
        <div className="grid gap-8 rounded-3xl bg-brand-mint px-5 py-8 sm:px-8 md:p-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16 lg:p-16">
          <div className="min-w-0">
            <h2 id="seller-title" className="text-[22px] font-bold leading-[1.3] text-brand-navy md:text-[30px]">
              {t("seller.title")}
            </h2>
            <p className="mt-2 max-w-xl text-[15px] leading-[1.75] text-brand-text/80">{t("seller.description")}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-6">
              {sellerBenefits.map((key) => (
                <li key={key} className="flex items-start gap-3 text-[14px] font-medium leading-snug text-brand-text md:text-[15px]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green text-white">
                    <CheckIcon className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>
          <Button variant="success" size="lg" fullWidth className="lg:w-auto" onClick={onStart}>
            {t("seller.cta")}
            <ArrowRightIcon className="h-[18px] w-[18px]" aria-hidden="true" />
          </Button>
        </div>
      </Container>
    </section>
  );
}

```
```components/BottomNav.tsx
import React from "react";
import { HomeIcon, PlusIcon, SearchIcon, ShoppingCartIcon, TruckIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export type BottomNavKey = "home" | "search" | "parcel" | "cart";

type BottomNavProps = {
  active: BottomNavKey;
  cartCount: number;
  onHome: () => void;
  onSearch: () => void;
  onPost: () => void;
  onParcel: () => void;
  onCart: () => void;
};

type NavItem = { key: BottomNavKey; label: string; Icon: typeof HomeIcon; onClick: () => void; ariaLabel?: string };

export function BottomNav({ active, cartCount, onHome, onSearch, onPost, onParcel, onCart }: BottomNavProps) {
  const { t, formatNumber } = useLanguage();

  const left: NavItem[] = [
    { key: "home", label: t("nav.home"), Icon: HomeIcon, onClick: onHome },
    { key: "search", label: t("nav.search"), Icon: SearchIcon, onClick: onSearch },
  ];
  const right: NavItem[] = [
    { key: "parcel", label: t("nav.parcel"), Icon: TruckIcon, onClick: onParcel, ariaLabel: t("action.bookParcel") },
    { key: "cart", label: t("nav.cart"), Icon: ShoppingCartIcon, onClick: onCart, ariaLabel: t("nav.cartWithCount", { count: cartCount }) },
  ];

  const renderItem = ({ key, label, Icon, onClick, ariaLabel }: NavItem) => {
    const isActive = active === key;
    return (
      <li key={key}>
        <button
          type="button"
          onClick={onClick}
          aria-label={ariaLabel}
          aria-current={isActive ? "page" : undefined}
          className={`flex h-16 w-full flex-col items-center justify-center gap-1 transition-colors duration-150 ${
            isActive ? "text-brand-green" : "text-brand-muted active:text-brand-navy"
          }`}
        >
          <span className="relative">
            <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.4 : 2} aria-hidden="true" />
            {key === "cart" && cartCount > 0 && (
              <span
                className="absolute -right-2.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
                aria-hidden="true"
              >
                {formatNumber(cartCount)}
              </span>
            )}
          </span>
          <span className={`text-[11px] leading-none ${isActive ? "font-semibold" : "font-medium"}`}>{label}</span>
        </button>
      </li>
    );
  };

  return (
    <nav
      aria-label={t("nav.primary")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {left.map(renderItem)}
        <li className="flex justify-center">
          <button
            type="button"
            onClick={onPost}
            aria-label={t("action.postProduct")}
            className="flex h-16 w-full flex-col items-center justify-end gap-1 pb-2"
          >
            <span className="-mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange text-white shadow-fab ring-4 ring-white transition-[background-color,transform] duration-150 active:scale-95">
              <PlusIcon className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
            </span>
            <span className="text-[11px] font-semibold leading-none text-brand-orange-dark">{t("nav.post")}</span>
          </button>
        </li>
        {right.map(renderItem)}
      </ul>
    </nav>
  );
}

```
```components/Footer.tsx
import React from "react";
import { MailIcon, PhoneIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Container } from "./Container";
import { Logo } from "./Logo";

type FooterProps = {
  onPost: () => void;
  onParcel: () => void;
};

const linkClass =
  "flex min-h-[44px] items-center gap-2 text-[14px] text-brand-muted transition-colors duration-150 hover:text-brand-navy";

export function Footer({ onPost, onParcel }: FooterProps) {
  const { t, formatDigits } = useLanguage();

  return (
    <footer className="mt-16 border-t border-brand-border bg-white md:mt-24">
      <Container className="py-10 md:py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-brand-muted">{t("footer.tagline")}</p>
          </div>

          <nav aria-labelledby="footer-shop">
            <h2 id="footer-shop" className="text-[14px] font-semibold text-brand-navy">
              {t("footer.shop")}
            </h2>
            <ul className="mt-2">
              <li><a href="#products" className={linkClass}>{t("footer.linkProducts")}</a></li>
              <li><a href="#categories" className={linkClass}>{t("footer.linkCategories")}</a></li>
              <li><a href="#seller" className={linkClass}>{t("footer.linkSeller")}</a></li>
            </ul>
          </nav>

          <div>
            <h2 className="text-[14px] font-semibold text-brand-navy">{t("footer.services")}</h2>
            <ul className="mt-2">
              <li><button type="button" onClick={onPost} className={linkClass}>{t("action.postProduct")}</button></li>
              <li><button type="button" onClick={onParcel} className={linkClass}>{t("action.bookParcel")}</button></li>
            </ul>
          </div>

          <div>
            <h2 className="text-[14px] font-semibold text-brand-navy">{t("footer.contact")}</h2>
            <ul className="mt-2">
              <li>
                <a href="tel:+8809612345678" className={linkClass}>
                  <PhoneIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="sr-only">{t("footer.hotlineLabel")}: </span>
                    {t("footer.hotlineNumber")}
                  </span>
                </a>
              </li>
              <li>
                <a href={`mailto:${t("footer.email")}`} className={`${linkClass} break-all`}>
                  <MailIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="sr-only">{t("footer.emailLabel")}: </span>
                    {t("footer.email")}
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-1 border-t border-brand-border pt-6 text-[13px] text-brand-muted sm:flex-row sm:justify-between">
          <p>{t("footer.copyright", { year: formatDigits(new Date().getFullYear()) })}</p>
          <p>{t("footer.country")}</p>
        </div>
      </Container>
    </footer>
  );
}

```
```pages/Home.tsx
import React, { useCallback, useMemo, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../hooks/useCart";
import { useProductFeed } from "../hooks/useProductFeed";
import type { CategoryKey, FeedOverride, Panel, Product } from "../types/marketplace";
import { filterProducts } from "../utils/productSearch";
import { scrollToSection, scrollToTop } from "../utils/scroll";
import { BottomNav, type BottomNavKey } from "../components/BottomNav";
import { CartSheet } from "../components/CartSheet";
import { CategoryGrid } from "../components/CategoryGrid";
import { Container } from "../components/Container";
import { Footer } from "../components/Footer";
import { HeroBanner } from "../components/HeroBanner";
import { ParcelBookingDialog } from "../components/ParcelBookingDialog";
import { PostProductDialog } from "../components/PostProductDialog";
import { ProductSection } from "../components/ProductSection";
import { SearchField } from "../components/SearchField";
import { SellerSpotlight } from "../components/SellerSpotlight";
import { SiteHeader } from "../components/SiteHeader";
import { TrustStrip } from "../components/TrustStrip";

type HomeProps = {
  feedOverride: FeedOverride;
};

export function Home({ feedOverride }: HomeProps) {
  const { t, localize } = useLanguage();
  const feed = useProductFeed(feedOverride);
  const cart = useCart();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [announcement, setAnnouncement] = useState("");

  const visible = useMemo(() => filterProducts(feed.items, { query, category }), [feed.items, query, category]);

  const closePanel = useCallback(() => setPanel(null), []);
  const openPost = () => setPanel("post");
  const openParcel = () => setPanel("parcel");
  const openCart = () => setPanel("cart");
  const browse = () => scrollToSection("products");

  const handleAdd = (product: Product) => {
    cart.add(product.id);
    setAnnouncement(t("product.addedToCart", { name: localize(product.name) }));
  };

  const clearFilters = () => {
    setQuery("");
    setCategory(null);
  };

  const focusSearch = () => {
    scrollToTop();
    document.getElementById("search-mobile")?.focus({ preventScroll: true });
  };

  const navActive: BottomNavKey =
    panel === "parcel" || panel === "cart" ? panel : query.trim() ? "search" : "home";

  return (
    <div id="top" className="min-h-screen w-full bg-brand-bg pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <a
        href="#main"
        className="sr-only z-50 rounded-btn bg-brand-navy px-4 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t("a11y.skipToContent")}
      </a>

      <SiteHeader
        query={query}
        onQueryChange={setQuery}
        onSearchSubmit={browse}
        cartCount={cart.count}
        onOpenCart={openCart}
        onPost={openPost}
        onParcel={openParcel}
      />

      <main id="main">
        <div className="pt-4 md:hidden">
          <Container>
            <SearchField id="search-mobile" value={query} onChange={setQuery} onSubmit={browse} />
          </Container>
        </div>

        <HeroBanner onPost={openPost} onBrowse={browse} onParcel={openParcel} />
        <TrustStrip />
        <CategoryGrid
          items={feed.items}
          selected={category}
          onSelect={(key) => setCategory((c) => (c === key ? null : key))}
        />
        <ProductSection
          status={feed.status}
          visible={visible}
          query={query}
          category={category}
          onQueryChange={setQuery}
          onClearCategory={() => setCategory(null)}
          onClearAll={clearFilters}
          onRetry={feed.retry}
          onAdd={handleAdd}
          onPost={openPost}
        />
        <SellerSpotlight onStart={openPost} />
      </main>

      <Footer onPost={openPost} onParcel={openParcel} />

      <BottomNav
        active={navActive}
        cartCount={cart.count}
        onHome={() => {
          closePanel();
          scrollToTop();
        }}
        onSearch={focusSearch}
        onPost={openPost}
        onParcel={openParcel}
        onCart={openCart}
      />

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <PostProductDialog open={panel === "post"} onClose={closePanel} />
      <ParcelBookingDialog open={panel === "parcel"} onClose={closePanel} />
      <CartSheet
        open={panel === "cart"}
        onClose={closePanel}
        lines={cart.lines}
        count={cart.count}
        subtotal={cart.subtotal}
        onIncrement={cart.add}
        onDecrement={cart.decrement}
        onRemove={cart.remove}
        onOrderPlaced={cart.clear}
        onBrowse={() => {
          closePanel();
          window.setTimeout(browse, 250);
        }}
      />
    </div>
  );
}

```
```types/i18n.ts
export type Language = "bn" | "en";

```
```data/translations.ts
import type { Language } from "../types/i18n";

const bn = {
  "a11y.skipToContent": "মূল কন্টেন্টে যান",
  "brand.name": "পিকপার্সেল",
  "brand.fullName": "পিকপার্সেল বিডি",
  "brand.home": "পিকপার্সেল হোম",
  "format.price": "৳{amount}",

  "lang.label": "ভাষা নির্বাচন",
  "lang.bnShort": "বাং",
  "lang.enShort": "EN",
  "lang.bnFull": "বাংলা",
  "lang.enFull": "English",

  "search.label": "পণ্য খুঁজুন",
  "search.placeholder": "পণ্য বা বিক্রেতা খুঁজুন",
  "search.clear": "সার্চ মুছুন",

  "nav.primary": "প্রধান নেভিগেশন",
  "nav.home": "হোম",
  "nav.search": "খুঁজুন",
  "nav.post": "পোস্ট",
  "nav.parcel": "পার্সেল",
  "nav.cart": "কার্ট",
  "nav.cartWithCount": "কার্ট, {count}টি পণ্য",
  "nav.cartWithCount_one": "কার্ট, {count}টি পণ্য",

  "action.postProduct": "পণ্য পোস্ট করুন",
  "action.browseProducts": "পণ্য দেখুন",
  "action.bookParcel": "পার্সেল বুক করুন",
  "action.close": "বন্ধ করুন",
  "action.done": "ঠিক আছে",
  "action.retry": "আবার চেষ্টা করুন",
  "action.clearFilters": "সব ফিল্টার মুছুন",
  "action.removeFilter": "{label} ফিল্টার সরান",

  "hero.title": "আপনার পণ্য বিক্রি করুন, ঘরে বসেই!",
  "hero.subtitle": "বাংলাদেশের বিশ্বস্ত মার্কেটপ্লেসে পণ্য বিক্রি করুন, কিনুন আর পার্সেল পাঠান — সব এক জায়গায়।",
  "hero.statSellersValue": "{count}+",
  "hero.statSellers": "সক্রিয় বিক্রেতা",
  "hero.statDistrictsValue": "{count}",
  "hero.statDistricts": "জেলায় ডেলিভারি",
  "hero.statDeliveryValue": "{count} ঘণ্টা",
  "hero.statDelivery": "ঢাকায় ডেলিভারি",

  "quickPost.title": "এখনই পণ্য যোগ করুন",
  "quickPost.description": "মাত্র ৩টি ধাপে লাখো ক্রেতার কাছে পৌঁছান",
  "quickPost.step1Title": "ছবি তুলুন",
  "quickPost.step1Description": "ফোনের ক্যামেরাই যথেষ্ট",
  "quickPost.step2Title": "তথ্য দিন",
  "quickPost.step2Description": "নাম, দাম আর ক্যাটাগরি",
  "quickPost.step3Title": "পোস্ট করুন",
  "quickPost.step3Description": "সাথে সাথে ক্রেতারা দেখবেন",
  "quickPost.note": "বিনামূল্যে • কোনো কমিশন নেই • ৩০ সেকেন্ডে শেষ",

  "trust.title": "কেন পিকপার্সেল",
  "trust.deliveryTitle": "দ্রুত ডেলিভারি",
  "trust.deliveryDescription": "সারাদেশে ২–৫ দিনে পৌঁছায়",
  "trust.paymentTitle": "নিরাপদ পেমেন্ট",
  "trust.paymentDescription": "বিকাশ, নগদ ও ক্যাশ অন ডেলিভারি",
  "trust.trackingTitle": "লাইভ ট্র্যাকিং",
  "trust.trackingDescription": "পার্সেল কোথায়, জানুন যেকোনো সময়",
  "trust.sellersTitle": "যাচাইকৃত বিক্রেতা",
  "trust.sellersDescription": "প্রতিটি দোকান আমরা যাচাই করি",

  "categories.title": "ক্যাটাগরি অনুযায়ী কিনুন",
  "categories.subtitle": "একটি বেছে নিন — নিচের পণ্যগুলো সেই অনুযায়ী দেখাবে",
  "categories.count": "{count}টি পণ্য",
  "categories.count_one": "{count}টি পণ্য",
  "category.fashion": "পোশাক",
  "category.electronics": "ইলেকট্রনিক্স",
  "category.food": "খাদ্য",
  "category.beauty": "সৌন্দর্য",
  "category.home": "গৃহসজ্জা",
  "category.other": "অন্যান্য",

  "products.title": "জনপ্রিয় পণ্যসমূহ",
  "products.count": "{count}টি পণ্য",
  "products.count_one": "{count}টি পণ্য",
  "products.trending": "ট্রেন্ডিং:",
  "products.trendingLabel": "ট্রেন্ডিং সার্চ",
  "products.activeFilters": "ফিল্টার:",
  "products.queryChip": "“{query}”",
  "products.loading": "পণ্য লোড হচ্ছে",
  "products.emptyTitle": "কোনো পণ্য মেলেনি",
  "products.emptyDescription": "অন্য শব্দে খুঁজুন বা ফিল্টার মুছে আবার চেষ্টা করুন।",
  "products.emptyFeedTitle": "এখনো কোনো পণ্য নেই",
  "products.emptyFeedDescription": "প্রথম পণ্যটি আপনিই পোস্ট করুন — লাখো ক্রেতা অপেক্ষায়।",
  "products.errorTitle": "পণ্য লোড করা যায়নি",
  "products.errorDescription": "ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।",

  "product.discount": "{percent}% ছাড়",
  "product.addToCart": "{name} কার্টে যোগ করুন",
  "product.addedToCart": "{name} কার্টে যোগ হয়েছে",
  "product.wishlistAdd": "{name} উইশলিস্টে যোগ করুন",
  "product.wishlistRemove": "{name} উইশলিস্ট থেকে সরান",
  "product.verified": "যাচাইকৃত বিক্রেতা",
  "product.currentPrice": "এখন {price}",
  "product.originalPrice": "আগের দাম {price}",

  "trending.saree": "শাড়ি",
  "trending.mobile": "মোবাইল",
  "trending.shoes": "জুতা",
  "trending.bag": "ব্যাগ",
  "trending.cosmetics": "কসমেটিক্স",
  "trending.honey": "মধু",

  "seller.title": "বিক্রেতা হিসেবে যোগ দিন",
  "seller.description": "হাজারো ছোট ব্যবসা প্রতিদিন পিকপার্সেলে সারাদেশের ক্রেতার কাছে বিক্রি করছে।",
  "seller.benefitShop": "বিনামূল্যে দোকান খুলুন",
  "seller.benefitDelivery": "সারাদেশে ডেলিভারি সুবিধা",
  "seller.benefitPayment": "নিরাপদ পেমেন্ট গ্যারান্টি",
  "seller.cta": "আজই শুরু করুন",

  "footer.tagline": "বাংলাদেশের মার্কেটপ্লেস ও পার্সেল ডেলিভারি প্ল্যাটফর্ম",
  "footer.shop": "কেনাকাটা",
  "footer.services": "সেবা",
  "footer.contact": "যোগাযোগ",
  "footer.linkProducts": "জনপ্রিয় পণ্য",
  "footer.linkCategories": "ক্যাটাগরি",
  "footer.linkSeller": "বিক্রেতা হোন",
  "footer.hotlineLabel": "হটলাইন",
  "footer.hotlineNumber": "০৯৬১২-৩৪৫৬৭৮",
  "footer.emailLabel": "ইমেইল",
  "footer.email": "support@pickparcel.com.bd",
  "footer.country": "বাংলাদেশে তৈরি",
  "footer.copyright": "© {year} পিকপার্সেল বিডি। সর্বস্বত্ব সংরক্ষিত।",

  "post.title": "নতুন পণ্য পোস্ট করুন",
  "post.description": "৩টি সহজ ধাপে আপনার পণ্য লাইভ করুন — সম্পূর্ণ বিনামূল্যে।",
  "post.photos": "পণ্যের ছবি",
  "post.photosCta": "ছবি বেছে নিন বা তুলুন",
  "post.photosHint": "সর্বোচ্চ ৫টি ছবি, JPG বা PNG",
  "post.photosSelected": "{count}টি ছবি নির্বাচিত — বদলাতে ট্যাপ করুন",
  "post.photosSelected_one": "{count}টি ছবি নির্বাচিত — বদলাতে ট্যাপ করুন",
  "post.photoPreview": "নির্বাচিত ছবি {count}",
  "post.name": "পণ্যের নাম",
  "post.namePlaceholder": "যেমন: হাতে বোনা জামদানি শাড়ি",
  "post.price": "দাম (৳)",
  "post.pricePlaceholder": "যেমন: ৮৫০",
  "post.category": "ক্যাটাগরি",
  "post.categoryPlaceholder": "ক্যাটাগরি বেছে নিন",
  "post.submit": "পণ্য পোস্ট করুন",
  "post.submitting": "পোস্ট হচ্ছে…",
  "post.note": "বিনামূল্যে • কোনো কমিশন নেই",
  "post.successTitle": "আপনার পণ্য এখন লাইভ!",
  "post.successDescription": "ক্রেতারা এখন আপনার পণ্য দেখতে ও অর্ডার করতে পারবেন।",
  "post.postAnother": "আরেকটি পোস্ট করুন",

  "parcel.title": "পার্সেল বুক করুন",
  "parcel.description": "ঘরে বসে পিকআপ, সারাদেশে ডেলিভারি।",
  "parcel.pickup": "পিকআপ ঠিকানা",
  "parcel.pickupPlaceholder": "যেমন: ধানমন্ডি ২৭, ঢাকা",
  "parcel.drop": "ডেলিভারি ঠিকানা",
  "parcel.dropPlaceholder": "যেমন: আগ্রাবাদ, চট্টগ্রাম",
  "parcel.weight": "ওজন",
  "parcel.weightSmall": "১ কেজি পর্যন্ত",
  "parcel.weightMedium": "১–৩ কেজি",
  "parcel.weightLarge": "৩–৫ কেজি",
  "parcel.phone": "প্রাপকের মোবাইল নম্বর",
  "parcel.phonePlaceholder": "০১XXXXXXXXX",
  "parcel.fee": "আনুমানিক চার্জ",
  "parcel.feeNote": "পিকআপ থেকে ডেলিভারি পর্যন্ত, ভ্যাটসহ",
  "parcel.submit": "বুকিং নিশ্চিত করুন",
  "parcel.submitting": "বুক হচ্ছে…",
  "parcel.successTitle": "পার্সেল বুক হয়েছে!",
  "parcel.successDescription": "ট্র্যাকিং আইডি {id}। একজন রাইডার শীঘ্রই আপনাকে কল করবেন।",
  "parcel.bookAnother": "আরেকটি বুক করুন",

  "cart.title": "আপনার কার্ট",
  "cart.itemCount": "{count}টি পণ্য",
  "cart.itemCount_one": "{count}টি পণ্য",
  "cart.emptyTitle": "কার্ট খালি",
  "cart.emptyDescription": "পছন্দের পণ্য কার্টে যোগ করুন, এখানে দেখা যাবে।",
  "cart.subtotal": "সাবটোটাল",
  "cart.deliveryNote": "ডেলিভারি চার্জ ঠিকানা অনুযায়ী যোগ হবে",
  "cart.checkout": "অর্ডার করুন",
  "cart.placing": "অর্ডার হচ্ছে…",
  "cart.successTitle": "অর্ডার সম্পন্ন!",
  "cart.successDescription": "ক্যাশ অন ডেলিভারিতে আপনার অর্ডার নিশ্চিত হয়েছে।",
  "cart.continue": "কেনাকাটা চালিয়ে যান",
  "cart.quantity": "পরিমাণ",
  "cart.increase": "{name} এর পরিমাণ বাড়ান",
  "cart.decrease": "{name} এর পরিমাণ কমান",
  "cart.remove": "সরান",
  "cart.removeLabel": "{name} কার্ট থেকে সরান",

  "validation.required": "এই তথ্যটি দিন",
  "validation.price": "সঠিক দাম লিখুন",
  "validation.photos": "অন্তত একটি ছবি দিন",
  "validation.phone": "সঠিক মোবাইল নম্বর লিখুন (০১XXXXXXXXX)",
} as const;

export type TranslationKey = keyof typeof bn;

const en: Record<TranslationKey, string> = {
  "a11y.skipToContent": "Skip to content",
  "brand.name": "PickParcel",
  "brand.fullName": "PickParcel BD",
  "brand.home": "PickParcel home",
  "format.price": "৳{amount}",

  "lang.label": "Choose language",
  "lang.bnShort": "বাং",
  "lang.enShort": "EN",
  "lang.bnFull": "বাংলা",
  "lang.enFull": "English",

  "search.label": "Search products",
  "search.placeholder": "Search products or sellers",
  "search.clear": "Clear search",

  "nav.primary": "Primary navigation",
  "nav.home": "Home",
  "nav.search": "Search",
  "nav.post": "Post",
  "nav.parcel": "Parcel",
  "nav.cart": "Cart",
  "nav.cartWithCount": "Cart, {count} items",
  "nav.cartWithCount_one": "Cart, {count} item",

  "action.postProduct": "Post a product",
  "action.browseProducts": "Browse products",
  "action.bookParcel": "Book a parcel",
  "action.close": "Close",
  "action.done": "Done",
  "action.retry": "Try again",
  "action.clearFilters": "Clear all filters",
  "action.removeFilter": "Remove {label} filter",

  "hero.title": "Sell your products from home!",
  "hero.subtitle": "Sell, shop and send parcels on Bangladesh's trusted marketplace — all in one place.",
  "hero.statSellersValue": "{count}+",
  "hero.statSellers": "active sellers",
  "hero.statDistrictsValue": "{count}",
  "hero.statDistricts": "districts served",
  "hero.statDeliveryValue": "{count} hrs",
  "hero.statDelivery": "delivery in Dhaka",

  "quickPost.title": "Post a product in minutes",
  "quickPost.description": "Reach lakhs of buyers in three simple steps",
  "quickPost.step1Title": "Take photos",
  "quickPost.step1Description": "Your phone camera is enough",
  "quickPost.step2Title": "Add details",
  "quickPost.step2Description": "Name, price and category",
  "quickPost.step3Title": "Publish",
  "quickPost.step3Description": "Buyers see it right away",
  "quickPost.note": "Free • No commission • Done in 30 seconds",

  "trust.title": "Why PickParcel",
  "trust.deliveryTitle": "Fast delivery",
  "trust.deliveryDescription": "Nationwide in 2–5 days",
  "trust.paymentTitle": "Secure payment",
  "trust.paymentDescription": "bKash, Nagad and cash on delivery",
  "trust.trackingTitle": "Live tracking",
  "trust.trackingDescription": "See where your parcel is, anytime",
  "trust.sellersTitle": "Verified sellers",
  "trust.sellersDescription": "Every shop is reviewed by our team",

  "categories.title": "Shop by category",
  "categories.subtitle": "Pick one to filter the products below",
  "categories.count": "{count} products",
  "categories.count_one": "{count} product",
  "category.fashion": "Fashion",
  "category.electronics": "Electronics",
  "category.food": "Food & grocery",
  "category.beauty": "Beauty",
  "category.home": "Home & living",
  "category.other": "Others",

  "products.title": "Popular products",
  "products.count": "{count} products",
  "products.count_one": "{count} product",
  "products.trending": "Trending:",
  "products.trendingLabel": "Trending searches",
  "products.activeFilters": "Filters:",
  "products.queryChip": "“{query}”",
  "products.loading": "Loading products",
  "products.emptyTitle": "No matching products",
  "products.emptyDescription": "Try a different search or clear the filters.",
  "products.emptyFeedTitle": "No products yet",
  "products.emptyFeedDescription": "Be the first to post a product — lakhs of buyers are waiting.",
  "products.errorTitle": "Couldn't load products",
  "products.errorDescription": "Check your internet connection and try again.",

  "product.discount": "{percent}% off",
  "product.addToCart": "Add {name} to cart",
  "product.addedToCart": "{name} added to cart",
  "product.wishlistAdd": "Save {name} to wishlist",
  "product.wishlistRemove": "Remove {name} from wishlist",
  "product.verified": "Verified seller",
  "product.currentPrice": "Now {price}",
  "product.originalPrice": "Was {price}",

  "trending.saree": "Saree",
  "trending.mobile": "Mobile",
  "trending.shoes": "Shoes",
  "trending.bag": "Bags",
  "trending.cosmetics": "Cosmetics",
  "trending.honey": "Honey",

  "seller.title": "Become a seller",
  "seller.description": "Thousands of small businesses sell to buyers across Bangladesh on PickParcel every day.",
  "seller.benefitShop": "Open your shop for free",
  "seller.benefitDelivery": "Nationwide delivery built in",
  "seller.benefitPayment": "Guaranteed secure payments",
  "seller.cta": "Start selling today",

  "footer.tagline": "Bangladesh's marketplace and parcel delivery platform",
  "footer.shop": "Shop",
  "footer.services": "Services",
  "footer.contact": "Contact",
  "footer.linkProducts": "Popular products",
  "footer.linkCategories": "Categories",
  "footer.linkSeller": "Become a seller",
  "footer.hotlineLabel": "Hotline",
  "footer.hotlineNumber": "09612-345678",
  "footer.emailLabel": "Email",
  "footer.email": "support@pickparcel.com.bd",
  "footer.country": "Made in Bangladesh",
  "footer.copyright": "© {year} PickParcel BD. All rights reserved.",

  "post.title": "Post a new product",
  "post.description": "Get your product live in 3 easy steps — completely free.",
  "post.photos": "Product photos",
  "post.photosCta": "Choose or take photos",
  "post.photosHint": "Up to 5 photos, JPG or PNG",
  "post.photosSelected": "{count} photos selected — tap to change",
  "post.photosSelected_one": "{count} photo selected — tap to change",
  "post.photoPreview": "Selected photo {count}",
  "post.name": "Product name",
  "post.namePlaceholder": "e.g. Handwoven Jamdani saree",
  "post.price": "Price (৳)",
  "post.pricePlaceholder": "e.g. 850",
  "post.category": "Category",
  "post.categoryPlaceholder": "Select a category",
  "post.submit": "Publish product",
  "post.submitting": "Publishing…",
  "post.note": "Free • No commission",
  "post.successTitle": "Your product is live!",
  "post.successDescription": "Buyers can now see and order your product.",
  "post.postAnother": "Post another",

  "parcel.title": "Book a parcel",
  "parcel.description": "Doorstep pickup, delivery anywhere in Bangladesh.",
  "parcel.pickup": "Pickup address",
  "parcel.pickupPlaceholder": "e.g. Dhanmondi 27, Dhaka",
  "parcel.drop": "Delivery address",
  "parcel.dropPlaceholder": "e.g. Agrabad, Chattogram",
  "parcel.weight": "Weight",
  "parcel.weightSmall": "Up to 1 kg",
  "parcel.weightMedium": "1–3 kg",
  "parcel.weightLarge": "3–5 kg",
  "parcel.phone": "Recipient's mobile number",
  "parcel.phonePlaceholder": "01XXXXXXXXX",
  "parcel.fee": "Estimated fee",
  "parcel.feeNote": "Pickup to delivery, VAT included",
  "parcel.submit": "Confirm booking",
  "parcel.submitting": "Booking…",
  "parcel.successTitle": "Parcel booked!",
  "parcel.successDescription": "Tracking ID {id}. A rider will call you shortly.",
  "parcel.bookAnother": "Book another",

  "cart.title": "Your cart",
  "cart.itemCount": "{count} items",
  "cart.itemCount_one": "{count} item",
  "cart.emptyTitle": "Your cart is empty",
  "cart.emptyDescription": "Add products you like and they'll show up here.",
  "cart.subtotal": "Subtotal",
  "cart.deliveryNote": "Delivery fee is added based on your address",
  "cart.checkout": "Place order",
  "cart.placing": "Placing order…",
  "cart.successTitle": "Order placed!",
  "cart.successDescription": "Your cash-on-delivery order is confirmed.",
  "cart.continue": "Continue shopping",
  "cart.quantity": "Quantity",
  "cart.increase": "Increase quantity of {name}",
  "cart.decrease": "Decrease quantity of {name}",
  "cart.remove": "Remove",
  "cart.removeLabel": "Remove {name} from cart",

  "validation.required": "This field is required",
  "validation.price": "Enter a valid price",
  "validation.photos": "Add at least one photo",
  "validation.phone": "Enter a valid mobile number (01XXXXXXXXX)",
};

export const translations: Record<Language, Record<TranslationKey, string>> = { bn, en };

```
```utils/numbers.ts
import type { Language } from "../types/i18n";

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export function localizeDigits(value: string, language: Language): string {
  if (language !== "bn") return value;
  return value.replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

export function formatLocalizedNumber(value: number, language: Language): string {
  return localizeDigits(value.toLocaleString("en-IN"), language);
}

export function normalizeDigits(input: string): string {
  return input.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

export function discountPercent(price: number, original: number): number {
  return Math.round(((original - price) / original) * 100);
}

```
```utils/productSearch.ts
import { translations, type TranslationKey } from "../data/translations";
import { categories, trendingTerms } from "../data/categories";
import type { CategoryKey, Product } from "../types/marketplace";
import { normalizeDigits } from "./numbers";

type ProductFilters = {
  query: string;
  category: CategoryKey | null;
};

function labelsInAllLanguages(key: TranslationKey): string[] {
  return Object.values(translations).map((dict) => dict[key]);
}

export function filterProducts(items: Product[], { query, category }: ProductFilters): Product[] {
  const q = normalizeDigits(query).trim().toLowerCase();

  return items.filter((product) => {
    if (category && product.category !== category) return false;
    if (!q) return true;

    const keywordLabels = product.keywords.flatMap((k) => {
      const term = trendingTerms.find((t) => t.key === k);
      return term ? labelsInAllLanguages(term.labelKey) : [];
    });
    const categoryEntry = categories.find((c) => c.key === product.category);
    const categoryLabels = categoryEntry ? labelsInAllLanguages(categoryEntry.labelKey) : [];

    const haystack = [
      ...Object.values(product.name),
      ...Object.values(product.seller),
      ...keywordLabels,
      ...categoryLabels,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}

```
```utils/scroll.ts
function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: scrollBehavior() });
}

```
```utils/buttonStyles.ts
export type ButtonVariant = "primary" | "secondary" | "success" | "inverse" | "ghost";
export type ButtonSize = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-btn font-semibold leading-none transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-orange text-white hover:bg-brand-orange-dark",
  secondary: "border border-brand-border bg-white text-brand-navy hover:border-brand-navy/30 hover:bg-brand-bg",
  success: "bg-brand-green text-white hover:bg-brand-navy",
  inverse: "border border-white/25 bg-white/5 text-white hover:border-white/40 hover:bg-white/10",
  ghost: "text-brand-navy hover:bg-brand-bg",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-11 px-4 text-[14px]",
  lg: "h-12 px-6 text-[15px]",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", fullWidth = false): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""}`;
}

```
```contexts/LanguageContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations, type TranslationKey } from "../data/translations";
import type { Language } from "../types/i18n";
import type { LocalizedText } from "../types/marketplace";
import { formatLocalizedNumber, localizeDigits } from "../utils/numbers";

type TranslateVars = Record<string, string | number>;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, vars?: TranslateVars) => string;
  formatNumber: (value: number) => string;
  formatDigits: (value: number | string) => string;
  formatPrice: (value: number) => string;
  localize: (text: LocalizedText) => string;
};

type LanguageProviderProps = {
  initialLanguage: Language;
  children: React.ReactNode;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ initialLanguage, children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  useEffect(() => setLanguage(initialLanguage), [initialLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    const dict = translations[language];
    const formatNumber = (n: number) => formatLocalizedNumber(n, language);

    const t = (key: TranslationKey, vars?: TranslateVars) => {
      const pluralKey = `${key}_one` as TranslationKey;
      const template = vars?.count === 1 && pluralKey in dict ? dict[pluralKey] : dict[key];
      if (!vars) return template;
      return template.replace(/\{(\w+)\}/g, (match, name: string) => {
        const v = vars[name];
        if (v === undefined) return match;
        return typeof v === "number" ? formatNumber(v) : v;
      });
    };

    return {
      language,
      setLanguage,
      t,
      formatNumber,
      formatDigits: (v) => localizeDigits(String(v), language),
      formatPrice: (amount) => t("format.price", { amount }),
      localize: (text) => text[language],
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}

```
```hooks/useProductFeed.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { products } from "../data/products";
import type { FeedOverride, FeedStatus } from "../types/marketplace";

export function useProductFeed(override: FeedOverride) {
  const [status, setStatus] = useState<FeedStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setAttempt(0);
  }, [override]);

  useEffect(() => {
    setStatus("loading");
    if (override === "loading") return;
    const timer = window.setTimeout(() => {
      setStatus(override === "error" && attempt === 0 ? "error" : "ready");
    }, 900);
    return () => window.clearTimeout(timer);
  }, [override, attempt]);

  const items = useMemo(() => (override === "empty" ? [] : products), [override]);
  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return { status, items, retry };
}

```
```hooks/useCart.ts
import { useCallback, useMemo, useState } from "react";
import { products } from "../data/products";
import type { CartLine } from "../types/marketplace";

export function useCart() {
  const [quantities, setQuantities] = useState<Record<string, number>>({ p2: 1, p6: 1 });

  const add = useCallback((id: string) => {
    setQuantities((q) => ({ ...q, [id]: (q[id] ?? 0) + 1 }));
  }, []);

  const decrement = useCallback((id: string) => {
    setQuantities((q) => {
      const next = { ...q };
      const value = (next[id] ?? 0) - 1;
      if (value <= 0) delete next[id];
      else next[id] = value;
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setQuantities((q) => {
      const next = { ...q };
      delete next[id];
      return next;
    });
  }, []);

  const clear = useCallback(() => setQuantities({}), []);

  const lines = useMemo<CartLine[]>(
    () =>
      Object.entries(quantities).flatMap(([id, quantity]) => {
        const product = products.find((p) => p.id === id);
        return product ? [{ product, quantity }] : [];
      }),
    [quantities]
  );

  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.product.price, 0);

  return { lines, count, subtotal, add, decrement, remove, clear };
}

```
```hooks/usePostProductForm.ts
import { useCallback, useEffect, useState } from "react";
import type { TranslationKey } from "../data/translations";
import type { CategoryKey, SubmitStatus } from "../types/marketplace";
import { normalizeDigits } from "../utils/numbers";

type Field = "photos" | "name" | "price" | "category";
type Errors = Partial<Record<Field, TranslationKey>>;

export function usePostProductForm(open: boolean) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<CategoryKey | "">("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const reset = useCallback(() => {
    setPhotos([]);
    setName("");
    setPrice("");
    setCategory("");
    setErrors({});
    setStatus("idle");
  }, []);

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  useEffect(() => () => photos.forEach((url) => URL.revokeObjectURL(url)), [photos]);

  const clearError = (field: Field) => setErrors((e) => ({ ...e, [field]: undefined }));

  const selectPhotos = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPhotos(Array.from(files).slice(0, 5).map((f) => URL.createObjectURL(f)));
    clearError("photos");
  };

  const submit = () => {
    const next: Errors = {};
    const numericPrice = Number(normalizeDigits(price).replace(/[,\s]/g, ""));
    if (photos.length === 0) next.photos = "validation.photos";
    if (!name.trim()) next.name = "validation.required";
    if (!(numericPrice > 0)) next.price = "validation.price";
    if (!category) next.category = "validation.required";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setStatus("submitting");
    window.setTimeout(() => setStatus("success"), 900);
  };

  return {
    photos,
    name,
    price,
    category,
    errors,
    status,
    selectPhotos,
    setName: (v: string) => {
      setName(v);
      clearError("name");
    },
    setPrice: (v: string) => {
      setPrice(v);
      clearError("price");
    },
    setCategory: (v: CategoryKey | "") => {
      setCategory(v);
      clearError("category");
    },
    submit,
    reset,
  };
}

```
```hooks/useParcelBooking.ts
import { useCallback, useEffect, useState } from "react";
import type { TranslationKey } from "../data/translations";
import { parcelWeights } from "../data/categories";
import type { ParcelWeight, SubmitStatus } from "../types/marketplace";
import { normalizeDigits } from "../utils/numbers";

type Field = "pickup" | "drop" | "phone";
type Errors = Partial<Record<Field, TranslationKey>>;

const PHONE_PATTERN = /^(?:\+?88)?01[3-9]\d{8}$/;

export function useParcelBooking(open: boolean) {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [weight, setWeight] = useState<ParcelWeight>("small");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [trackingId, setTrackingId] = useState("");

  const reset = useCallback(() => {
    setPickup("");
    setDrop("");
    setWeight("small");
    setPhone("");
    setErrors({});
    setStatus("idle");
    setTrackingId("");
  }, []);

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const clearError = (field: Field) => setErrors((e) => ({ ...e, [field]: undefined }));
  const fee = parcelWeights.find((w) => w.key === weight)?.fee ?? 0;

  const submit = () => {
    const next: Errors = {};
    if (!pickup.trim()) next.pickup = "validation.required";
    if (!drop.trim()) next.drop = "validation.required";
    if (!PHONE_PATTERN.test(normalizeDigits(phone).replace(/[\s-]/g, ""))) next.phone = "validation.phone";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setStatus("submitting");
    window.setTimeout(() => {
      setTrackingId(`PPB${Math.floor(100000 + Math.random() * 900000)}`);
      setStatus("success");
    }, 900);
  };

  return {
    pickup,
    drop,
    weight,
    phone,
    fee,
    errors,
    status,
    trackingId,
    setPickup: (v: string) => {
      setPickup(v);
      clearError("pickup");
    },
    setDrop: (v: string) => {
      setDrop(v);
      clearError("drop");
    },
    setPhone: (v: string) => {
      setPhone(v);
      clearError("phone");
    },
    setWeight,
    submit,
    reset,
  };
}

```
```components/Container.tsx
import React from "react";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className = "" }: ContainerProps) {
  return <div className={`mx-auto w-full max-w-[1240px] px-4 md:px-8 ${className}`}>{children}</div>;
}

```
```components/Button.tsx
import React from "react";
import { Loader2Icon } from "lucide-react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "../utils/buttonStyles";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  className = "",
  type = "button",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${buttonClasses(variant, size, fullWidth)} ${className}`}
      {...rest}
    >
      {loading && <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

```
```components/Logo.tsx
import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

export function Logo() {
  const { t } = useLanguage();
  return (
    <a href="#top" aria-label={t("brand.home")} className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg">
      <span className="h-3 w-3 rounded-full bg-brand-orange" aria-hidden="true" />
      <span className="text-[18px] font-bold leading-none text-brand-navy">{t("brand.name")}</span>
    </a>
  );
}

```
```components/LanguageSwitch.tsx
import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import type { TranslationKey } from "../data/translations";
import type { Language } from "../types/i18n";

const options: { value: Language; shortKey: TranslationKey; fullKey: TranslationKey }[] = [
  { value: "bn", shortKey: "lang.bnShort", fullKey: "lang.bnFull" },
  { value: "en", shortKey: "lang.enShort", fullKey: "lang.enFull" },
];

export function LanguageSwitch() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("lang.label")}
      className="flex h-11 shrink-0 items-center rounded-full border border-brand-border bg-brand-bg p-1"
    >
      {options.map((o) => {
        const active = language === o.value;
        return (
          <button
            key={o.value}
            type="button"
            lang={o.value}
            aria-pressed={active}
            aria-label={t(o.fullKey)}
            onClick={() => setLanguage(o.value)}
            className={`h-9 min-w-[44px] rounded-full px-3 text-[13px] font-semibold leading-none transition-colors duration-150 ${
              active ? "bg-brand-navy text-white" : "text-brand-muted hover:text-brand-navy"
            }`}
          >
            {t(o.shortKey)}
          </button>
        );
      })}
    </div>
  );
}

```
```components/SearchField.tsx
import React from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

type SearchFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function SearchField({ id, value, onChange, onSubmit }: SearchFieldProps) {
  const { t } = useLanguage();

  return (
    <form
      role="search"
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label htmlFor={id} className="sr-only">
        {t("search.label")}
      </label>
      <SearchIcon
        className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-brand-muted"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        value={value}
        enterKeyHint="search"
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("search.placeholder")}
        className="h-11 w-full rounded-full border border-brand-border bg-brand-bg pl-11 pr-11 text-[14px] text-brand-text placeholder:text-brand-muted transition-[border-color,background-color,box-shadow] duration-150 hover:border-brand-muted/40 focus:border-brand-green focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-green/10"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={t("search.clear")}
          className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-full text-brand-muted hover:text-brand-navy"
        >
          <XIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </form>
  );
}

```
```components/CartButton.tsx
import React from "react";
import { motion } from "framer-motion";
import { ShoppingCartIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

type CartButtonProps = {
  count: number;
  onClick: () => void;
};

export function CartButton({ count, onClick }: CartButtonProps) {
  const { t, formatNumber } = useLanguage();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("nav.cartWithCount", { count })}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-brand-navy transition-colors duration-150 hover:bg-brand-bg"
    >
      <ShoppingCartIcon className="h-5 w-5" aria-hidden="true" />
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 600, damping: 22 }}
          className="absolute right-0.5 top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-orange px-1 text-[11px] font-bold leading-none text-white ring-2 ring-white"
          aria-hidden="true"
        >
          {formatNumber(count)}
        </motion.span>
      )}
    </button>
  );
}

```
```components/SiteHeader.tsx
import React from "react";
import { PlusIcon, TruckIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { buttonClasses } from "../utils/buttonStyles";
import { Button } from "./Button";
import { CartButton } from "./CartButton";
import { Container } from "./Container";
import { LanguageSwitch } from "./LanguageSwitch";
import { Logo } from "./Logo";
import { SearchField } from "./SearchField";

type SiteHeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onPost: () => void;
  onParcel: () => void;
};

export function SiteHeader({
  query,
  onQueryChange,
  onSearchSubmit,
  cartCount,
  onOpenCart,
  onPost,
  onParcel,
}: SiteHeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border bg-white/95 backdrop-blur">
      <Container className="flex h-16 items-center gap-4 lg:gap-8">
        <Logo />
        <div className="hidden min-w-0 flex-1 md:block lg:max-w-xl">
          <SearchField id="search-desktop" value={query} onChange={onQueryChange} onSubmit={onSearchSubmit} />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <LanguageSwitch />
          <button type="button" onClick={onParcel} className={`${buttonClasses("ghost")} hidden lg:inline-flex`}>
            <TruckIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            {t("action.bookParcel")}
          </button>
          <CartButton count={cartCount} onClick={onOpenCart} />
          <Button className="hidden md:inline-flex" onClick={onPost}>
            <PlusIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            {t("action.postProduct")}
          </Button>
        </div>
      </Container>
    </header>
  );
}

```
```components/StatePanel.tsx
import React from "react";
import { BoxIcon } from "lucide-react";
type Tone = "neutral" | "danger" | "success";
type StatePanelProps = {
  icon: BoxIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: Tone;
  bordered?: boolean;
};
const toneClasses: Record<Tone, string> = {
  neutral: "bg-brand-bg text-brand-navy",
  danger: "bg-brand-danger-soft text-brand-danger",
  success: "bg-brand-mint text-brand-green"
};
export function StatePanel({
  icon: Icon,
  title,
  description,
  action,
  tone = "neutral",
  bordered = false
}: StatePanelProps) {
  return <div role={tone === "danger" ? "alert" : "status"} className={`flex flex-col items-center px-6 py-12 text-center ${bordered ? "rounded-2xl border border-brand-border bg-white md:py-16" : ""}`}>
      <span className={`flex h-14 w-14 items-center justify-center rounded-full ${toneClasses[tone]}`}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-[17px] font-semibold leading-snug text-brand-navy">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-brand-muted">{description}</p>}
      {action && <div className="mt-6 flex w-full justify-center">{action}</div>}
    </div>;
}
```
```components/TrendingChips.tsx
import React from "react";
import { TrendingUpIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { trendingTerms } from "../data/categories";

type TrendingChipsProps = {
  query: string;
  onSelect: (value: string) => void;
};

export function TrendingChips({ query, onSelect }: TrendingChipsProps) {
  const { t } = useLanguage();
  const normalized = query.trim().toLowerCase();

  return (
    <div
      role="group"
      aria-label={t("products.trendingLabel")}
      className="no-scrollbar -mx-4 mb-2 flex items-center gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
    >
      <span className="flex shrink-0 items-center gap-1.5 pr-1 text-[13px] font-medium text-brand-muted">
        <TrendingUpIcon className="h-4 w-4 text-brand-orange" aria-hidden="true" />
        {t("products.trending")}
      </span>
      {trendingTerms.map((term) => {
        const label = t(term.labelKey);
        const selected = normalized === label.toLowerCase();
        return (
          <button
            key={term.key}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(selected ? "" : label)}
            className="group flex h-11 shrink-0 items-center rounded-full"
          >
            <span
              className={`flex h-9 items-center whitespace-nowrap rounded-full border px-4 text-[13px] font-medium transition-colors duration-150 ${
                selected
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-brand-border bg-white text-brand-text group-hover:border-brand-navy/30"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

```
```components/ActiveFilters.tsx
import React from "react";
import { XIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

type ActiveFiltersProps = {
  query: string;
  categoryLabel: string | null;
  onClearQuery: () => void;
  onClearCategory: () => void;
  onClearAll: () => void;
};

export function ActiveFilters({ query, categoryLabel, onClearQuery, onClearCategory, onClearAll }: ActiveFiltersProps) {
  const { t } = useLanguage();
  const chips = [
    ...(categoryLabel ? [{ id: "category", label: categoryLabel, onRemove: onClearCategory }] : []),
    ...(query.trim() ? [{ id: "query", label: t("products.queryChip", { query: query.trim() }), onRemove: onClearQuery }] : []),
  ];

  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-2">
      <span className="text-[13px] text-brand-muted">{t("products.activeFilters")}</span>
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={chip.onRemove}
          aria-label={t("action.removeFilter", { label: chip.label })}
          className="group flex h-11 items-center rounded-full"
        >
          <span className="flex h-8 items-center gap-1.5 rounded-full bg-brand-mint pl-3 pr-2 text-[13px] font-medium text-brand-navy transition-colors duration-150 group-hover:bg-[#dcefe2]">
            {chip.label}
            <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="flex h-11 items-center rounded-lg px-2 text-[13px] font-semibold text-brand-green hover:underline"
      >
        {t("action.clearFilters")}
      </button>
    </div>
  );
}

```
```components/ProductSection.tsx
import React from "react";
import { PackageOpenIcon, PlusIcon, RotateCwIcon, SearchXIcon, WifiOffIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { categories } from "../data/categories";
import type { CategoryKey, FeedStatus, Product } from "../types/marketplace";
import { ActiveFilters } from "./ActiveFilters";
import { Button } from "./Button";
import { Container } from "./Container";
import { ProductCard } from "./ProductCard";
import { ProductSkeleton } from "./ProductSkeleton";
import { SectionHeader } from "./SectionHeader";
import { StatePanel } from "./StatePanel";
import { TrendingChips } from "./TrendingChips";

type ProductSectionProps = {
  status: FeedStatus;
  visible: Product[];
  query: string;
  category: CategoryKey | null;
  onQueryChange: (value: string) => void;
  onClearCategory: () => void;
  onClearAll: () => void;
  onRetry: () => void;
  onAdd: (product: Product) => void;
  onPost: () => void;
};

const GRID = "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6";

export function ProductSection({
  status,
  visible,
  query,
  category,
  onQueryChange,
  onClearCategory,
  onClearAll,
  onRetry,
  onAdd,
  onPost,
}: ProductSectionProps) {
  const { t } = useLanguage();
  const hasFilters = Boolean(query.trim()) || category !== null;
  const categoryEntry = categories.find((c) => c.key === category);

  let content: React.ReactNode;
  if (status === "loading") {
    content = (
      <div role="status">
        <span className="sr-only">{t("products.loading")}</span>
        <ul className={GRID}>
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i}>
              <ProductSkeleton />
            </li>
          ))}
        </ul>
      </div>
    );
  } else if (status === "error") {
    content = (
      <StatePanel
        bordered
        tone="danger"
        icon={WifiOffIcon}
        title={t("products.errorTitle")}
        description={t("products.errorDescription")}
        action={
          <Button variant="secondary" onClick={onRetry}>
            <RotateCwIcon className="h-4 w-4" aria-hidden="true" />
            {t("action.retry")}
          </Button>
        }
      />
    );
  } else if (visible.length === 0) {
    content = hasFilters ? (
      <StatePanel
        bordered
        icon={SearchXIcon}
        title={t("products.emptyTitle")}
        description={t("products.emptyDescription")}
        action={
          <Button variant="secondary" onClick={onClearAll}>
            {t("action.clearFilters")}
          </Button>
        }
      />
    ) : (
      <StatePanel
        bordered
        icon={PackageOpenIcon}
        title={t("products.emptyFeedTitle")}
        description={t("products.emptyFeedDescription")}
        action={
          <Button onClick={onPost}>
            <PlusIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            {t("action.postProduct")}
          </Button>
        }
      />
    );
  } else {
    content = (
      <ul className={GRID}>
        {visible.map((p) => (
          <li key={p.id} className="h-full">
            <ProductCard product={p} onAdd={onAdd} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section id="products" aria-labelledby="products-title" className="scroll-mt-24 pt-12 md:pt-20">
      <Container>
        <SectionHeader
          id="products-title"
          title={t("products.title")}
          description={status === "ready" ? t("products.count", { count: visible.length }) : undefined}
        />
        <TrendingChips query={query} onSelect={onQueryChange} />
        <ActiveFilters
          query={query}
          categoryLabel={categoryEntry ? t(categoryEntry.labelKey) : null}
          onClearQuery={() => onQueryChange("")}
          onClearCategory={onClearCategory}
          onClearAll={onClearAll}
        />
        <div className="mt-4">{content}</div>
      </Container>
    </section>
  );
}

```
```components/Dialog.tsx
import React, { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
};

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const EASE = [0.23, 1, 0.32, 1] as const;

export function Dialog({ open, onClose, title, description, children }: DialogProps) {
  const { t } = useLanguage();
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => panelRef.current?.focus());

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
          <motion.div
            className="absolute inset-0 bg-brand-navy/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl bg-white shadow-dialog focus:outline-none md:max-w-lg md:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
              <div className="min-w-0">
                <h2 id={titleId} className="text-[19px] font-bold leading-snug text-brand-navy md:text-[21px]">
                  {title}
                </h2>
                {description && (
                  <p id={descriptionId} className="mt-1 text-[14px] leading-relaxed text-brand-muted">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("action.close")}
                className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-brand-muted transition-colors duration-150 hover:bg-brand-bg hover:text-brand-navy"
              >
                <XIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

```
```components/FormField.tsx
import React from "react";
import { AlertCircleIcon } from "lucide-react";

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
};

export const inputClassName =
  "h-12 w-full rounded-btn border border-brand-border bg-white px-4 text-[15px] text-brand-text placeholder:text-brand-muted/80 transition-[border-color,box-shadow] duration-150 hover:border-brand-muted/50 focus:border-brand-green focus:outline-none focus:ring-4 focus:ring-brand-green/10 aria-[invalid=true]:border-brand-danger aria-[invalid=true]:focus:ring-brand-danger/10";

export function fieldErrorId(id: string) {
  return `${id}-error`;
}

export function FormField({ id, label, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[14px] font-medium text-brand-navy">
        {label}
      </label>
      {children}
      {error && (
        <p id={fieldErrorId(id)} className="flex items-center gap-1.5 text-[13px] text-brand-danger">
          <AlertCircleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

```
```components/PostProductDialog.tsx
import React, { useId } from "react";
import { CameraIcon, ChevronDownIcon, CircleCheckIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { categories } from "../data/categories";
import { usePostProductForm } from "../hooks/usePostProductForm";
import type { CategoryKey } from "../types/marketplace";
import { Button } from "./Button";
import { Dialog } from "./Dialog";
import { FormField, fieldErrorId, inputClassName } from "./FormField";
import { StatePanel } from "./StatePanel";

type PostProductDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function PostProductDialog({ open, onClose }: PostProductDialogProps) {
  const { t } = useLanguage();
  const form = usePostProductForm(open);
  const photosId = useId();
  const nameId = useId();
  const priceId = useId();
  const categoryId = useId();
  const success = form.status === "success";

  return (
    <Dialog open={open} onClose={onClose} title={t("post.title")} description={success ? undefined : t("post.description")}>
      {success ? (
        <StatePanel
          tone="success"
          icon={CircleCheckIcon}
          title={t("post.successTitle")}
          description={t("post.successDescription")}
          action={
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <Button variant="secondary" onClick={form.reset}>
                {t("post.postAnother")}
              </Button>
              <Button onClick={onClose}>{t("action.done")}</Button>
            </div>
          }
        />
      ) : (
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            form.submit();
          }}
        >
          <FormField id={photosId} label={t("post.photos")} error={form.errors.photos && t(form.errors.photos)}>
            <label
              className={`flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors duration-150 focus-within:border-brand-green hover:border-brand-green/50 hover:bg-brand-mint/50 ${
                form.errors.photos ? "border-brand-danger/60 bg-brand-danger-soft" : "border-brand-border bg-brand-bg"
              }`}
            >
              <CameraIcon className="mb-1 h-6 w-6 text-brand-green" aria-hidden="true" />
              <span className="text-[14px] font-medium text-brand-navy">
                {form.photos.length > 0 ? t("post.photosSelected", { count: form.photos.length }) : t("post.photosCta")}
              </span>
              <span className="text-[13px] text-brand-muted">{t("post.photosHint")}</span>
              <input
                id={photosId}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                aria-invalid={Boolean(form.errors.photos)}
                aria-describedby={form.errors.photos ? fieldErrorId(photosId) : undefined}
                onChange={(e) => form.selectPhotos(e.target.files)}
              />
            </label>
            {form.photos.length > 0 && (
              <ul className="flex gap-2">
                {form.photos.map((src, i) => (
                  <li key={src}>
                    <img
                      src={src}
                      alt={t("post.photoPreview", { count: i + 1 })}
                      className="h-14 w-14 rounded-xl border border-brand-border object-cover"
                    />
                  </li>
                ))}
              </ul>
            )}
          </FormField>

          <FormField id={nameId} label={t("post.name")} error={form.errors.name && t(form.errors.name)}>
            <input
              id={nameId}
              value={form.name}
              onChange={(e) => form.setName(e.target.value)}
              placeholder={t("post.namePlaceholder")}
              className={inputClassName}
              aria-invalid={Boolean(form.errors.name)}
              aria-describedby={form.errors.name ? fieldErrorId(nameId) : undefined}
            />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id={priceId} label={t("post.price")} error={form.errors.price && t(form.errors.price)}>
              <input
                id={priceId}
                inputMode="numeric"
                value={form.price}
                onChange={(e) => form.setPrice(e.target.value)}
                placeholder={t("post.pricePlaceholder")}
                className={inputClassName}
                aria-invalid={Boolean(form.errors.price)}
                aria-describedby={form.errors.price ? fieldErrorId(priceId) : undefined}
              />
            </FormField>
            <FormField id={categoryId} label={t("post.category")} error={form.errors.category && t(form.errors.category)}>
              <div className="relative">
                <select
                  id={categoryId}
                  value={form.category}
                  onChange={(e) => form.setCategory(e.target.value as CategoryKey | "")}
                  className={`${inputClassName} appearance-none pr-10 ${form.category ? "" : "text-brand-muted"}`}
                  aria-invalid={Boolean(form.errors.category)}
                  aria-describedby={form.errors.category ? fieldErrorId(categoryId) : undefined}
                >
                  <option value="">{t("post.categoryPlaceholder")}</option>
                  {categories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {t(c.labelKey)}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon
                  className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted"
                  aria-hidden="true"
                />
              </div>
            </FormField>
          </div>

          <div className="pt-1">
            <Button type="submit" size="lg" fullWidth loading={form.status === "submitting"}>
              {form.status === "submitting" ? t("post.submitting") : t("post.submit")}
            </Button>
            <p className="mt-3 text-center text-[13px] text-brand-muted">{t("post.note")}</p>
          </div>
        </form>
      )}
    </Dialog>
  );
}

```
```components/ParcelBookingDialog.tsx
import React, { useId } from "react";
import { CircleCheckIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { parcelWeights } from "../data/categories";
import { useParcelBooking } from "../hooks/useParcelBooking";
import { Button } from "./Button";
import { Dialog } from "./Dialog";
import { FormField, fieldErrorId, inputClassName } from "./FormField";
import { StatePanel } from "./StatePanel";

type ParcelBookingDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function ParcelBookingDialog({ open, onClose }: ParcelBookingDialogProps) {
  const { t, formatPrice } = useLanguage();
  const form = useParcelBooking(open);
  const pickupId = useId();
  const dropId = useId();
  const phoneId = useId();
  const weightName = useId();
  const success = form.status === "success";

  return (
    <Dialog open={open} onClose={onClose} title={t("parcel.title")} description={success ? undefined : t("parcel.description")}>
      {success ? (
        <StatePanel
          tone="success"
          icon={CircleCheckIcon}
          title={t("parcel.successTitle")}
          description={t("parcel.successDescription", { id: form.trackingId })}
          action={
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <Button variant="secondary" onClick={form.reset}>
                {t("parcel.bookAnother")}
              </Button>
              <Button onClick={onClose}>{t("action.done")}</Button>
            </div>
          }
        />
      ) : (
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            form.submit();
          }}
        >
          <FormField id={pickupId} label={t("parcel.pickup")} error={form.errors.pickup && t(form.errors.pickup)}>
            <input
              id={pickupId}
              value={form.pickup}
              autoComplete="street-address"
              onChange={(e) => form.setPickup(e.target.value)}
              placeholder={t("parcel.pickupPlaceholder")}
              className={inputClassName}
              aria-invalid={Boolean(form.errors.pickup)}
              aria-describedby={form.errors.pickup ? fieldErrorId(pickupId) : undefined}
            />
          </FormField>

          <FormField id={dropId} label={t("parcel.drop")} error={form.errors.drop && t(form.errors.drop)}>
            <input
              id={dropId}
              value={form.drop}
              onChange={(e) => form.setDrop(e.target.value)}
              placeholder={t("parcel.dropPlaceholder")}
              className={inputClassName}
              aria-invalid={Boolean(form.errors.drop)}
              aria-describedby={form.errors.drop ? fieldErrorId(dropId) : undefined}
            />
          </FormField>

          <fieldset>
            <legend className="text-[14px] font-medium text-brand-navy">{t("parcel.weight")}</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {parcelWeights.map((w) => {
                const selected = form.weight === w.key;
                return (
                  <label
                    key={w.key}
                    className={`flex min-h-[64px] cursor-pointer flex-col items-center justify-center gap-1 rounded-btn border px-2 py-2 text-center transition-colors duration-150 focus-within:ring-4 focus-within:ring-brand-green/15 ${
                      selected
                        ? "border-brand-green bg-brand-mint text-brand-navy"
                        : "border-brand-border bg-white text-brand-text hover:border-brand-green/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name={weightName}
                      value={w.key}
                      checked={selected}
                      onChange={() => form.setWeight(w.key)}
                      className="sr-only"
                    />
                    <span className="text-[13px] font-semibold leading-snug">{t(w.labelKey)}</span>
                    <span className="text-[12px] leading-none text-brand-muted">{formatPrice(w.fee)}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <FormField id={phoneId} label={t("parcel.phone")} error={form.errors.phone && t(form.errors.phone)}>
            <input
              id={phoneId}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => form.setPhone(e.target.value)}
              placeholder={t("parcel.phonePlaceholder")}
              className={inputClassName}
              aria-invalid={Boolean(form.errors.phone)}
              aria-describedby={form.errors.phone ? fieldErrorId(phoneId) : undefined}
            />
          </FormField>

          <div className="flex items-center justify-between gap-4 rounded-btn bg-brand-bg px-4 py-3">
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-brand-navy">{t("parcel.fee")}</p>
              <p className="text-[12px] text-brand-muted">{t("parcel.feeNote")}</p>
            </div>
            <p className="shrink-0 text-[20px] font-bold text-brand-navy" aria-live="polite">
              {formatPrice(form.fee)}
            </p>
          </div>

          <Button type="submit" size="lg" fullWidth loading={form.status === "submitting"}>
            {form.status === "submitting" ? t("parcel.submitting") : t("parcel.submit")}
          </Button>
        </form>
      )}
    </Dialog>
  );
}

```
```components/CartSheet.tsx
import React, { useEffect, useState } from "react";
import { CircleCheckIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import type { CartLine, SubmitStatus } from "../types/marketplace";
import { Button } from "./Button";
import { Dialog } from "./Dialog";
import { StatePanel } from "./StatePanel";

type CartSheetProps = {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
  count: number;
  subtotal: number;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onOrderPlaced: () => void;
  onBrowse: () => void;
};

export function CartSheet({
  open,
  onClose,
  lines,
  count,
  subtotal,
  onIncrement,
  onDecrement,
  onRemove,
  onOrderPlaced,
  onBrowse,
}: CartSheetProps) {
  const { t, localize, formatPrice, formatNumber } = useLanguage();
  const [status, setStatus] = useState<SubmitStatus>("idle");

  useEffect(() => {
    if (open) setStatus("idle");
  }, [open]);

  const checkout = () => {
    setStatus("submitting");
    window.setTimeout(() => {
      setStatus("success");
      onOrderPlaced();
    }, 900);
  };

  let body: React.ReactNode;
  if (status === "success") {
    body = (
      <StatePanel
        tone="success"
        icon={CircleCheckIcon}
        title={t("cart.successTitle")}
        description={t("cart.successDescription")}
        action={<Button onClick={onBrowse}>{t("cart.continue")}</Button>}
      />
    );
  } else if (lines.length === 0) {
    body = (
      <StatePanel
        icon={ShoppingBagIcon}
        title={t("cart.emptyTitle")}
        description={t("cart.emptyDescription")}
        action={<Button onClick={onBrowse}>{t("action.browseProducts")}</Button>}
      />
    );
  } else {
    body = (
      <>
        <ul className="divide-y divide-brand-border border-y border-brand-border">
          {lines.map(({ product, quantity }) => {
            const name = localize(product.name);
            return (
              <li key={product.id} className="flex gap-4 py-4">
                <img src={product.image} alt="" className="h-20 w-20 shrink-0 rounded-xl bg-brand-bg object-cover" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-brand-navy">{name}</p>
                  <p className="mt-1 text-[14px] font-semibold text-brand-text">{formatPrice(product.price)}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div role="group" aria-label={t("cart.quantity")} className="flex items-center rounded-full border border-brand-border">
                      <button
                        type="button"
                        onClick={() => onDecrement(product.id)}
                        aria-label={t("cart.decrease", { name })}
                        className="flex h-11 w-11 items-center justify-center rounded-full text-brand-navy hover:bg-brand-bg"
                      >
                        <MinusIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span className="min-w-[2ch] text-center text-[14px] font-semibold text-brand-navy" aria-live="polite">
                        {formatNumber(quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onIncrement(product.id)}
                        aria-label={t("cart.increase", { name })}
                        className="flex h-11 w-11 items-center justify-center rounded-full text-brand-navy hover:bg-brand-bg"
                      >
                        <PlusIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(product.id)}
                      aria-label={t("cart.removeLabel", { name })}
                      className="flex h-11 items-center rounded-lg px-2 text-[13px] font-medium text-brand-muted transition-colors duration-150 hover:text-brand-danger"
                    >
                      {t("cart.remove")}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="pt-5">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-[15px] font-medium text-brand-navy">{t("cart.subtotal")}</p>
            <p className="text-[20px] font-bold text-brand-navy">{formatPrice(subtotal)}</p>
          </div>
          <p className="mt-1 text-[13px] text-brand-muted">{t("cart.deliveryNote")}</p>
          <Button size="lg" fullWidth className="mt-5" loading={status === "submitting"} onClick={checkout}>
            {status === "submitting" ? t("cart.placing") : t("cart.checkout")}
          </Button>
        </div>
      </>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("cart.title")}
      description={lines.length > 0 && status !== "success" ? t("cart.itemCount", { count }) : undefined}
    >
      {body}
    </Dialog>
  );
}

```
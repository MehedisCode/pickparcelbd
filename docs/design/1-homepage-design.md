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
import { PhoneFrame } from "./components/PhoneFrame";
import { Home } from "./pages/Home";

type AppProps = {
  showDeviceFrame?: boolean;
};

export function App({ showDeviceFrame = true }: AppProps) {
  return (
    <PhoneFrame enabled={showDeviceFrame}>
      <Home />
    </PhoneFrame>
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

html,
body,
#root {
  height: 100%;
}
body {
  font-family: 'DM Sans', 'Noto Sans Bengali', system-ui, sans-serif;
  color: #24342e;
  font-size: 14px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
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
  background: #eef0eb;
}
.shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
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
          "orange-soft": "#fdeee7",
          navy: "#20352f",
          green: "#267658",
          mint: "#edf6ef",
          bg: "#f7f8f4",
          text: "#24342e",
          muted: "#7c8780",
          border: "#e8ebe5",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', '"Noto Sans Bengali"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        btn: "10px",
      },
      boxShadow: {
        card: "0 4px 16px rgba(32,53,47,0.06)",
        "card-hover": "0 10px 28px rgba(32,53,47,0.12)",
        fab: "0 8px 20px rgba(237,99,51,0.40)",
      },
    },
  },
};

```
```types/marketplace.ts
export type Product = {
  id: string;
  name: string;
  seller: string;
  price: number;
  originalPrice: number;
  image: string;
};

export type CategoryKey =
  | "fashion"
  | "electronics"
  | "food"
  | "beauty"
  | "home"
  | "other";

export type Category = {
  key: CategoryKey;
  label: string;
  shortLabel: string;
};

```
```data/products.ts
import type { Product } from "../types/marketplace";

export const products: Product[] = [
  {
    id: "p1",
    name: "হাতে বোনা জামদানি শাড়ি — লাল সোনালি",
    seller: "তাঁতঘর টাঙ্গাইল",
    price: 4250,
    originalPrice: 5300,
    image:
      "https://cdn.magicpatterns.com/patterns/generated-images/52595bc0-5fb1-4658-ab15-b44f02253761.jpg",
  },
  {
    id: "p2",
    name: "অর্গানিক সুন্দরবনের মধু ৫০০গ্রাম",
    seller: "খাঁটি খাবার",
    price: 850,
    originalPrice: 1050,
    image:
      "https://cdn.magicpatterns.com/patterns/generated-images/5c8282e8-3e9a-4786-9c44-4ccf734c93a5.jpg",
  },
  {
    id: "p3",
    name: "স্মার্টফোন কভার — ম্যাট সিলিকন",
    seller: "গ্যাজেট বাজার",
    price: 320,
    originalPrice: 450,
    image:
      "https://cdn.magicpatterns.com/patterns/generated-images/6e9b89cd-a179-4579-83bd-510371dbc38f.jpg",
  },
  {
    id: "p4",
    name: "নকশিকাঁথা কুশন কভার (২ পিস)",
    seller: "যশোরের কারুশিল্প",
    price: 690,
    originalPrice: 900,
    image:
      "https://cdn.magicpatterns.com/patterns/generated-images/7da7ed1f-f8fb-4951-b538-126e0ba27bb7.jpg",
  },
  {
    id: "p5",
    name: "হাতে তৈরি চামড়ার স্যান্ডেল",
    seller: "চামড়া কুটির",
    price: 1450,
    originalPrice: 1800,
    image:
      "https://cdn.magicpatterns.com/patterns/generated-images/b722eb31-66b1-48ef-bc35-5217d44f7ece.jpg",
  },
];

```
```data/categories.ts
import type { Category } from "../types/marketplace";

export const categories: Category[] = [
  { key: "fashion", label: "ফ্যাশন", shortLabel: "পোশাক" },
  { key: "electronics", label: "ইলেকট্রনিক্স", shortLabel: "ইলেকট্রনিক্স" },
  { key: "food", label: "খাবার", shortLabel: "খাদ্য" },
  { key: "beauty", label: "সৌন্দর্য", shortLabel: "সৌন্দর্য" },
  { key: "home", label: "গৃহসজ্জা", shortLabel: "গৃহসজ্জা" },
  { key: "other", label: "অন্যান্য", shortLabel: "অন্যান্য" },
];

export const trendingSearches = [
  "শাড়ি",
  "মোবাইল",
  "জুতা",
  "ব্যাগ",
  "কসমেটিক্স",
  "শার্ট",
];

export const sellerBenefits = [
  "বিনামূল্যে দোকান খুলুন",
  "সারাদেশে ডেলিভারি সুবিধা",
  "নিরাপদ পেমেন্ট গ্যারান্টি",
];

```
```utils/bangla.ts
const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBanglaDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

export function formatTaka(amount: number): string {
  return `৳ ${toBanglaDigits(amount.toLocaleString("en-IN"))}`;
}

export function discountPercent(price: number, original: number): number {
  return Math.round(((original - price) / original) * 100);
}

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
```components/TopNav.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { SearchIcon, ShoppingCartIcon } from "lucide-react";
import { categories } from "../data/categories";
import { toBanglaDigits } from "../utils/bangla";
import type { CategoryKey } from "../types/marketplace";

type TopNavProps = {
  cartCount: number;
};

export function TopNav({ cartCount }: TopNavProps) {
  const [active, setActive] = useState<CategoryKey | "all">("all");

  return (
    <header className="sticky top-0 z-30 border-b border-brand-border bg-white">
      <div className="flex h-14 items-center gap-2.5 px-4">
        <a href="#" className="flex shrink-0 items-center gap-1.5" aria-label="পিকপার্সেল হোম">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-orange" />
          <span className="text-[17px] font-bold tracking-tight text-brand-navy">পিকপার্সেল</span>
        </a>

        <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-brand-bg px-3 ring-1 ring-brand-border focus-within:ring-brand-orange">
          <SearchIcon className="h-4 w-4 shrink-0 text-brand-muted" aria-hidden="true" />
          <input
            type="search"
            placeholder="পণ্য খুঁজুন..."
            className="w-full min-w-0 bg-transparent text-[13px] text-brand-text placeholder:text-brand-muted focus:outline-none"
          />
        </label>

        <button
          type="button"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-brand-navy hover:bg-brand-bg"
          aria-label={`কার্ট, ${toBanglaDigits(cartCount)}টি পণ্য`}
        >
          <ShoppingCartIcon className="h-5 w-5" />
          <motion.span
            key={cartCount}
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
            className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] font-bold leading-none text-white"
          >
            {toBanglaDigits(cartCount)}
          </motion.span>
        </button>

        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy text-[13px] font-semibold text-white"
          aria-label="প্রোফাইল"
        >
          র
        </button>
      </div>

      <nav aria-label="ক্যাটাগরি" className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
        {[{ key: "all" as const, label: "সব" }, ...categories].map((c) => {
          const isActive = active === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setActive(c.key)}
              aria-pressed={isActive}
              className={`h-8 shrink-0 whitespace-nowrap rounded-full px-3.5 text-[13px] font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-brand-navy text-white"
                  : "bg-brand-bg text-brand-text ring-1 ring-brand-border hover:bg-white"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

```
```components/HeroBanner.tsx
import React from "react";
import { BadgeCheckIcon, PackagePlusIcon, ShoppingBagIcon } from "lucide-react";

export function HeroBanner() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden rounded-card p-4 pt-5 text-white"
      style={{ background: "linear-gradient(135deg, #ed6333 0%, #c8471d 100%)" }}
    >
      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
        <BadgeCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
        ৫০,০০০+ বিক্রেতা
      </span>

      <h1 id="hero-title" className="mt-6 max-w-[260px] text-[22px] font-bold leading-[1.35]">
        আপনার পণ্য বিক্রি করুন, ঘরে বসেই!
      </h1>
      <p className="mt-1.5 text-[13px] leading-relaxed text-white/90">
        বাংলাদেশের সেরা মার্কেটপ্লেসে বিক্রেতা হিসেবে যোগ দিন
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <a
          href="#products"
          className="flex h-11 items-center justify-center gap-1.5 rounded-btn bg-white text-[14px] font-semibold text-brand-orange-dark transition-transform duration-150 active:scale-[0.97]"
        >
          <ShoppingBagIcon className="h-4 w-4" aria-hidden="true" />
          পণ্য দেখুন
        </a>
        <button
          type="button"
          className="flex h-11 items-center justify-center gap-1.5 rounded-btn border-[1.5px] border-white text-[14px] font-semibold text-white transition-[transform,background-color] duration-150 hover:bg-white/10 active:scale-[0.97]"
        >
          <PackagePlusIcon className="h-4 w-4" aria-hidden="true" />
          পণ্য পোস্ট করুন
        </button>
      </div>
    </section>
  );
}

```
```components/QuickPostCard.tsx
import React from "react";
import {
  ArrowRightIcon,
  CameraIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  FilePenLineIcon,
  RocketIcon,
} from "lucide-react";

const steps = [
  { label: "ছবি তুলুন", Icon: CameraIcon },
  { label: "তথ্য দিন", Icon: FilePenLineIcon },
  { label: "পোস্ট করুন", Icon: CircleCheckIcon },
];

export function QuickPostCard() {
  return (
    <section
      aria-labelledby="quick-post-title"
      className="rounded-card border-l-4 border-brand-orange bg-white p-4 shadow-card"
    >
      <div className="flex items-center gap-2">
        <RocketIcon className="h-5 w-5 text-brand-orange" aria-hidden="true" />
        <h2 id="quick-post-title" className="text-[18px] font-bold text-brand-navy">
          এখনই পণ্য যোগ করুন
        </h2>
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-brand-muted">
        মাত্র ৩টি ধাপে আপনার পণ্য লাখো ক্রেতার কাছে পৌঁছান
      </p>

      <ol className="mt-4 flex items-start justify-between">
        {steps.map(({ label, Icon }, i) => (
          <React.Fragment key={label}>
            <li className="flex w-[76px] flex-col items-center gap-1.5 text-center">
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange-soft text-brand-orange">
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-brand-navy text-[10px] font-bold text-white">
                  {["১", "২", "৩"][i]}
                </span>
              </span>
              <span className="whitespace-nowrap text-[12px] font-medium text-brand-text">{label}</span>
            </li>
            {i < steps.length - 1 && (
              <ChevronRightIcon className="mt-3.5 h-4 w-4 shrink-0 text-brand-border" aria-hidden="true" />
            )}
          </React.Fragment>
        ))}
      </ol>

      <button
        type="button"
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-brand-orange text-[15px] font-semibold text-white transition-[transform,background-color] duration-150 hover:bg-brand-orange-dark active:scale-[0.98]"
      >
        পণ্য পোস্ট করুন
        <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
      </button>
      <p className="mt-2.5 text-center text-[12px] text-brand-muted">
        বিনামূল্যে • কোনো কমিশন নেই • ৩০ সেকেন্ডে শেষ
      </p>
    </section>
  );
}

```
```components/TrustStrip.tsx
import React from "react";
import { HeartHandshakeIcon, LockIcon, MapPinIcon, TruckIcon } from "lucide-react";

const items = [
  { label: "দ্রুত ডেলিভারি", Icon: TruckIcon },
  { label: "নিরাপদ পেমেন্ট", Icon: LockIcon },
  { label: "লোকেশন ট্র্যাকিং", Icon: MapPinIcon },
  { label: "বিশ্বস্ত সেলার", Icon: HeartHandshakeIcon },
];

export function TrustStrip() {
  return (
    <section aria-label="আমাদের সুবিধা" className="-mx-4">
      <ul className="no-scrollbar flex gap-2.5 overflow-x-auto px-4">
        {items.map(({ label, Icon }) => (
          <li
            key={label}
            className="flex h-20 w-[96px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-card bg-white text-center ring-1 ring-brand-border"
          >
            <Icon className="h-5 w-5 text-brand-green" aria-hidden="true" />
            <span className="whitespace-nowrap text-[11.5px] font-medium text-brand-text">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

```
```components/ProductCard.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckIcon, HeartIcon, PlusIcon, StoreIcon } from "lucide-react";
import type { Product } from "../types/marketplace";
import { discountPercent, formatTaka, toBanglaDigits } from "../utils/bangla";

type ProductCardProps = {
  product: Product;
  onAdd: () => void;
};

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);
  const discount = discountPercent(product.price, product.originalPrice);

  const handleAdd = () => {
    onAdd();
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.article
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
      className="relative flex flex-col rounded-card bg-white p-2 shadow-card transition-shadow duration-200 hover:shadow-card-hover"
    >
      <div className="relative aspect-square overflow-hidden rounded-[10px] bg-brand-bg">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
        <span className="absolute left-2 top-2 rounded-full bg-brand-orange px-2 py-0.5 text-[11px] font-semibold text-white">
          {toBanglaDigits(discount)}% ছাড়
        </span>
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          aria-pressed={liked}
          aria-label={liked ? "উইশলিস্ট থেকে সরান" : "উইশলিস্টে যোগ করুন"}
          className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm">
            <HeartIcon
              className={`h-4 w-4 transition-colors duration-150 ${
                liked ? "fill-brand-orange text-brand-orange" : "text-brand-navy"
              }`}
            />
          </span>
        </button>
      </div>

      <div className="flex flex-1 flex-col px-1 pt-2">
        <h3 className="line-clamp-2 min-h-[2.8em] text-[14px] font-semibold leading-[1.4] text-brand-text">
          {product.name}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-[11.5px] text-brand-muted">
          <StoreIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{product.seller}</span>
        </p>
        <div className="mt-auto flex items-end justify-between gap-1 pt-1.5">
          <div className="leading-tight">
            <p className="text-[15px] font-bold text-brand-orange">{formatTaka(product.price)}</p>
            <p className="text-[11.5px] text-brand-muted line-through">{formatTaka(product.originalPrice)}</p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`${product.name} ব্যাগে যোগ করুন`}
            className={`-mb-1 -mr-1 flex h-11 w-11 shrink-0 items-center justify-center`}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-white transition-[background-color,transform] duration-150 active:scale-90 ${
                added ? "bg-brand-green" : "bg-brand-orange hover:bg-brand-orange-dark"
              }`}
            >
              {added ? <CheckIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
            </span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}

```
```components/ProductSkeleton.tsx
import React from "react";

export function ProductSkeleton() {
  return (
    <div
      className="flex flex-col rounded-card bg-white p-2 shadow-card"
      role="status"
      aria-label="পণ্য লোড হচ্ছে"
    >
      <div className="shimmer aspect-square rounded-[10px]" />
      <div className="px-1 pt-2.5">
        <div className="shimmer h-3.5 w-full rounded" />
        <div className="shimmer mt-1.5 h-3.5 w-2/3 rounded" />
        <div className="shimmer mt-2.5 h-2.5 w-1/2 rounded" />
        <div className="mt-3 flex items-end justify-between">
          <div className="shimmer h-4 w-14 rounded" />
          <div className="shimmer h-9 w-9 rounded-full" />
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
  eyebrow?: string;
  actionLabel?: string;
};

export function SectionHeader({ id, title, eyebrow, actionLabel }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="text-[12px] font-medium text-brand-orange">{eyebrow}</p>}
        <h2 id={id} className="text-[18px] font-bold leading-snug text-brand-navy">
          {title}
        </h2>
      </div>
      {actionLabel && (
        <a
          href="#"
          className="flex h-9 shrink-0 items-center whitespace-nowrap text-[13px] font-semibold text-brand-green hover:underline"
        >
          {actionLabel}
        </a>
      )}
    </div>
  );
}

```
```components/ProductGrid.tsx
import React from "react";
import { products } from "../data/products";
import { ProductCard } from "./ProductCard";
import { ProductSkeleton } from "./ProductSkeleton";
import { SectionHeader } from "./SectionHeader";

type ProductGridProps = {
  onAdd: () => void;
};

export function ProductGrid({ onAdd }: ProductGridProps) {
  return (
    <section id="products" aria-labelledby="products-title">
      <SectionHeader id="products-title" eyebrow="আজকের সেরা" title="জনপ্রিয় পণ্যসমূহ" actionLabel="সব দেখুন →" />
      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onAdd={onAdd} />
        ))}
        <ProductSkeleton />
      </div>
    </section>
  );
}

```
```components/CategoryGrid.tsx
import React from "react";
import { categories } from "../data/categories";
import { CategoryIcon } from "./CategoryIcon";
import { SectionHeader } from "./SectionHeader";

export function CategoryGrid() {
  return (
    <section aria-labelledby="category-title">
      <SectionHeader id="category-title" title="ক্যাটাগরি অনুযায়ী কিনুন" />
      <ul className="grid grid-cols-3 gap-2.5">
        {categories.map((c) => (
          <li key={c.key}>
            <a
              href="#"
              className="flex h-[92px] flex-col items-center justify-center gap-2 rounded-card bg-white shadow-card transition-[transform,box-shadow] duration-200 hover:scale-[1.02] hover:shadow-card-hover active:scale-[0.98]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-bg text-brand-navy">
                <CategoryIcon category={c.key} className="h-5 w-5" />
              </span>
              <span className="whitespace-nowrap text-[12.5px] font-medium text-brand-text">{c.shortLabel}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

```
```components/SellerSpotlight.tsx
import React from "react";
import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { sellerBenefits } from "../data/categories";

export function SellerSpotlight() {
  return (
    <section aria-labelledby="seller-title" className="rounded-card bg-brand-mint p-5">
      <h2 id="seller-title" className="text-[18px] font-bold text-brand-navy">
        বিক্রেতা হিসেবে যোগ দিন
      </h2>
      <p className="mt-0.5 text-[13px] text-brand-muted">হাজারো বিক্রেতা প্রতিদিন আয় করছেন</p>
      <ul className="mt-4 space-y-2.5">
        {sellerBenefits.map((b) => (
          <li key={b} className="flex items-center gap-2.5 text-[14px] font-medium text-brand-text">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green text-white">
              <CheckIcon className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
            </span>
            {b}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-brand-green text-[15px] font-semibold text-white transition-[transform,background-color] duration-150 hover:bg-brand-navy active:scale-[0.98]"
      >
        আজই শুরু করুন
        <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </section>
  );
}

```
```components/TrendingSearch.tsx
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDownIcon, TrendingUpIcon } from "lucide-react";
import { trendingSearches } from "../data/categories";

export function TrendingSearch() {
  const [open, setOpen] = useState(true);

  return (
    <section aria-labelledby="trending-title" className="rounded-card bg-white shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="trending-list"
        className="flex h-12 w-full items-center justify-between px-4"
      >
        <span id="trending-title" className="flex items-center gap-2 text-[15px] font-semibold text-brand-navy">
          <TrendingUpIcon className="h-4 w-4 text-brand-orange" aria-hidden="true" />
          ট্রেন্ডিং সার্চ:
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 text-brand-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="trending-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <ul className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-4">
              {trendingSearches.map((t) => (
                <li key={t}>
                  <a
                    href="#"
                    className="flex h-9 items-center whitespace-nowrap rounded-full bg-brand-bg px-4 text-[13px] text-brand-text ring-1 ring-brand-border transition-colors duration-150 hover:bg-brand-orange-soft hover:text-brand-orange-dark"
                  >
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

```
```components/BottomNav.tsx
import React, { useState } from "react";
import { HomeIcon, PlusIcon, SearchIcon, ShoppingCartIcon, UserIcon } from "lucide-react";
import { toBanglaDigits } from "../utils/bangla";

type BottomNavProps = {
  cartCount: number;
};

type Tab = "home" | "search" | "cart" | "profile";

const tabs: { key: Tab; label: string; Icon: typeof HomeIcon }[] = [
  { key: "home", label: "হোম", Icon: HomeIcon },
  { key: "search", label: "খুঁজুন", Icon: SearchIcon },
  { key: "cart", label: "কার্ট", Icon: ShoppingCartIcon },
  { key: "profile", label: "প্রোফাইল", Icon: UserIcon },
];

export function BottomNav({ cartCount }: BottomNavProps) {
  const [active, setActive] = useState<Tab>("home");

  const renderTab = ({ key, label, Icon }: (typeof tabs)[number]) => {
    const isActive = active === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => setActive(key)}
        aria-current={isActive ? "page" : undefined}
        className={`relative flex h-14 flex-1 flex-col items-center justify-center gap-0.5 transition-colors duration-150 ${
          isActive ? "text-brand-orange" : "text-brand-muted hover:text-brand-navy"
        }`}
      >
        <span className="relative">
          <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.4 : 2} aria-hidden="true" />
          {key === "cart" && cartCount > 0 && (
            <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-orange px-1 text-[9px] font-bold leading-none text-white">
              {toBanglaDigits(cartCount)}
            </span>
          )}
        </span>
        <span className="text-[11px] font-medium leading-tight">{label}</span>
      </button>
    );
  };

  return (
    <nav aria-label="প্রধান নেভিগেশন" className="relative z-30 shrink-0 border-t border-brand-border bg-white pb-2">
      <div className="flex items-end">
        {tabs.slice(0, 2).map(renderTab)}
        <div className="flex flex-1 flex-col items-center">
          <button
            type="button"
            aria-label="পণ্য পোস্ট করুন"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange text-white shadow-fab ring-4 ring-white transition-[transform,background-color] duration-150 hover:bg-brand-orange-dark active:scale-95"
          >
            <PlusIcon className="h-7 w-7" strokeWidth={2.5} />
          </button>
          <span className="mt-0.5 whitespace-nowrap text-[11px] font-semibold leading-tight text-brand-orange">
            পোস্ট করুন
          </span>
        </div>
        {tabs.slice(2).map(renderTab)}
      </div>
    </nav>
  );
}

```
```components/Footer.tsx
import React from "react";

const links = ["সম্পর্কে", "শর্তাবলী", "যোগাযোগ"];

export function Footer() {
  return (
    <footer className="border-t border-brand-border pt-5 text-center">
      <div className="flex items-center justify-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-brand-orange" />
        <span className="text-[16px] font-bold text-brand-navy">পিকপার্সেল বিডি</span>
        <span className="ml-1 text-[13px] text-brand-muted">🇧🇩 বাংলাদেশ</span>
      </div>
      <ul className="mt-2 flex items-center justify-center text-[13px] text-brand-text">
        {links.map((l, i) => (
          <li key={l} className="flex items-center">
            {i > 0 && <span className="text-brand-border" aria-hidden="true">|</span>}
            <a href="#" className="flex h-10 items-center px-3 hover:text-brand-orange">
              {l}
            </a>
          </li>
        ))}
      </ul>
      <p className="text-[12px] text-brand-muted">© ২০২৬ পিকপার্সেল বিডি</p>
    </footer>
  );
}

```
```components/PhoneFrame.tsx
import React from "react";
import { BatteryFullIcon, SignalIcon, WifiIcon } from "lucide-react";

type PhoneFrameProps = {
  enabled: boolean;
  children: React.ReactNode;
};

export function PhoneFrame({ enabled, children }: PhoneFrameProps) {
  if (!enabled) {
    return <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-brand-bg">{children}</div>;
  }

  return (
    <div className="flex min-h-full w-full items-center justify-center bg-[#e9ece5] md:py-8">
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-brand-bg md:h-[844px] md:w-[390px] md:rounded-[54px] md:border-[10px] md:border-[#17201c] md:shadow-[0_30px_60px_rgba(32,53,47,0.25)]">
        <div className="hidden h-11 shrink-0 items-center justify-between bg-white px-7 text-[14px] font-semibold text-brand-navy md:flex">
          <span>৯:৪১</span>
          <span className="absolute left-1/2 top-2.5 h-[30px] w-[110px] -translate-x-1/2 rounded-full bg-[#17201c]" />
          <span className="flex items-center gap-1.5">
            <SignalIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <WifiIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <BatteryFullIcon className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

```
```pages/Home.tsx
import React, { useState } from "react";
import { TopNav } from "../components/TopNav";
import { HeroBanner } from "../components/HeroBanner";
import { QuickPostCard } from "../components/QuickPostCard";
import { TrustStrip } from "../components/TrustStrip";
import { ProductGrid } from "../components/ProductGrid";
import { CategoryGrid } from "../components/CategoryGrid";
import { SellerSpotlight } from "../components/SellerSpotlight";
import { TrendingSearch } from "../components/TrendingSearch";
import { BottomNav } from "../components/BottomNav";
import { Footer } from "../components/Footer";

export function Home() {
  const [cartCount, setCartCount] = useState(3);
  const addToCart = () => setCartCount((c) => c + 1);

  return (
    <>
      <div className="no-scrollbar relative flex-1 overflow-y-auto">
        <TopNav cartCount={cartCount} />
        <main className="space-y-5 px-4 pb-6 pt-4">
          <HeroBanner />
          <QuickPostCard />
          <TrustStrip />
          <ProductGrid onAdd={addToCart} />
          <CategoryGrid />
          <SellerSpotlight />
          <TrendingSearch />
          <Footer />
        </main>
      </div>
      <BottomNav cartCount={cartCount} />
    </>
  );
}

```
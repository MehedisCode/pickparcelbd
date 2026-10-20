"use client";

import { useI18n, useToast } from "@/components/providers";
import type { Product } from "@/lib/types";
import {
  Check,
  CheckCircle2,
  Heart,
  Package,
  Plus,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";
import { ProductMedia } from "@/components/product-media";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "../cart";
import { discountPercent } from "@/lib/bangla";
import { localizedNumber, localizedPrice } from "./format";

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

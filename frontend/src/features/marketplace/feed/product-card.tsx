"use client";

import { useI18n, useSession, useToast } from "@/components/providers";
import { Avatar } from "@/components/shell";
import { ProductMedia } from "@/components/product-media";
import { discountPercent } from "@/lib/bangla";
import type { Product } from "@/lib/types";
import { useCart } from "../cart";
import { categories, digits } from "./format";
import {
  Check,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function FeedProduct({
  product: p,
  following,
  onFollow,
  eager = false,
}: {
  product: Product;
  following: boolean;
  onFollow: (id: number) => Promise<void>;
  eager?: boolean;
}) {
  const { locale } = useI18n();
  const { session } = useSession();
  const toast = useToast();
  const cart = useCart();
  const [followBusy, setFollowBusy] = useState(false);
  const discount = p.discount_percent
    ? Math.round(Number(p.discount_percent))
    : discountPercent(Number(p.effective_price), Number(p.price));
  const sellerHref = p.seller_public_id
    ? `/sellers/${encodeURIComponent(p.seller_public_id)}`
    : `/products/${p.id}`;
  const messageHref = session?.user
    ? `/dashboard/messages/${p.user_id}`
    : `/login?return=${encodeURIComponent(`/dashboard/messages/${p.user_id}`)}`;
  const share = async () => {
    const url = `${window.location.origin}/products/${p.id}`;
    try {
      if (navigator.share) await navigator.share({ title: p.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast(
          locale === "bn" ? "পণ্যের লিংক কপি হয়েছে" : "Product link copied",
        );
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast(
        locale === "bn" ? "লিংক শেয়ার করা যায়নি" : "Could not share link",
        "error",
      );
    }
  };
  return (
    <article className="v2-product-card">
      <div className="v2-product-top">
        <Link
          href={sellerHref}
          className="v2-seller-avatar"
          aria-label={p.seller_name || "Seller"}
        >
          {p.seller_avatar ? (
            <Image
              src={p.seller_avatar}
              alt=""
              width={48}
              height={48}
              unoptimized
            />
          ) : (
            <Avatar name={p.seller_name || "S"} />
          )}
        </Link>
        <div className="v2-seller-meta">
          <Link href={sellerHref} className="v2-seller-name">
            {p.seller_name || (locale === "bn" ? "বিক্রেতা" : "Seller")}
            {p.seller_verified && (
              <ShieldCheck size={16} aria-label="Verified" />
            )}
          </Link>
          <span>
            <MapPin size={13} />
            {p.seller_district || (locale === "bn" ? "বাংলাদেশ" : "Bangladesh")}
          </span>
        </div>
        {session?.user?.id !== p.user_id && (
          <button
            type="button"
            className={`v2-follow ${following ? "is-following" : ""}`}
            disabled={followBusy}
            onClick={async () => {
              setFollowBusy(true);
              try {
                await onFollow(p.user_id);
              } finally {
                setFollowBusy(false);
              }
            }}
          >
            {following ? <Check size={15} /> : <Users size={15} />}
            {following
              ? locale === "bn"
                ? "অনুসরণ করছেন"
                : "Following"
              : locale === "bn"
                ? "অনুসরণ"
                : "Follow"}
          </button>
        )}
      </div>
      <div className="v2-product-copy">
        <Link href={`/products/${p.id}`}>
          <h2>{p.name}</h2>
        </Link>
        {p.description && <p>{p.description}</p>}
      </div>
      <Link
        href={`/products/${p.id}`}
        className="v2-product-media"
        aria-label={p.name}
      >
        <ProductMedia src={p.image_url} alt={p.name} eager={eager} />
        {discount > 0 && (
          <span className="v2-discount">
            {digits(discount, locale)}% {locale === "bn" ? "ছাড়" : "off"}
          </span>
        )}
      </Link>
      <div className="v2-product-price">
        <div>
          <strong>৳ {digits(Number(p.effective_price), locale)}</strong>
          {Number(p.effective_price) < Number(p.price) && (
            <s>৳ {digits(Number(p.price), locale)}</s>
          )}
        </div>
        <span>
          {categories.find((item) => item.id === p.category)?.[locale] ||
            p.category}
        </span>
      </div>
      <div className="v2-product-actions">
        <button
          type="button"
          className="v2-add-cart"
          onClick={() => {
            cart.add({
              product_id: p.id,
              seller_id: p.user_id,
              quantity: 1,
              name: p.name,
              price: p.effective_price,
              image_url: p.image_url,
              seller_name: p.seller_name || "Seller",
            });
            toast(locale === "bn" ? "কার্টে যোগ করা হয়েছে" : "Added to cart");
          }}
        >
          <ShoppingCart size={18} />
          {locale === "bn" ? "কার্টে যোগ করুন" : "Add to cart"}
        </button>
        <Link href={messageHref} className="v2-message">
          <MessageCircle size={18} />
          {locale === "bn" ? "মেসেজ" : "Message"}
        </Link>
        <button
          type="button"
          className="v2-share"
          onClick={share}
          aria-label={locale === "bn" ? "পণ্য শেয়ার করুন" : "Share product"}
        >
          <Share2 size={18} />
        </button>
      </div>
    </article>
  );
}

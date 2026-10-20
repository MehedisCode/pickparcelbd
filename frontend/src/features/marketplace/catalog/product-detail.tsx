"use client";

import { useI18n, useToast } from "@/components/providers";
import { Avatar, PublicFooter, PublicHeader } from "@/components/shell";
import { BackLink, Button, ErrorState, Loading } from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { money } from "@/lib/api";
import type { Product, Row } from "@/lib/types";
import { ArrowRight, MapPin, ShieldCheck, ShoppingBag } from "lucide-react";
import { ProductMedia } from "@/components/product-media";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "../cart";

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

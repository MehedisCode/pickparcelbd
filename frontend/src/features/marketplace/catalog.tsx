"use client";

import { useAction, useI18n, useSession, useToast } from "@/components/providers";
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
  SearchInput,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, money } from "@/lib/api";
import type { Paged, Product, Row } from "@/lib/types";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  MapPin,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Image from "next/image";
import { ProductMedia } from "@/components/product-media";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "./cart";

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

export function PackageArt() {
  const { t } = useI18n();
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="parcel-art">
        <div className="package-stamp" />
      </div>
      <div className="hero-floating one">
        <CheckCircle2 size={22} />
        <div>
          <strong>{t("marketplace.heroDeliveredTitle")}</strong>{t("marketplace.heroDeliveredSubtitle")}
        </div>
      </div>
      <div className="hero-floating two">
        <Truck size={22} />
        <div>
          <strong>{t("marketplace.heroOnWayTitle")}</strong>{t("marketplace.heroOnWaySubtitle")}
        </div>
      </div>
    </div>
  );
}
export function ProductCard({ product: p }: { product: Product }) {
  const cart = useCart();
  const toast = useToast();
  const { t } = useI18n();
  return (
    <article className="product-card">
      <Link href={`/products/${p.id}`} className="product-image">
        <ProductMedia src={p.image_url} alt={p.name} />{" "}
        {p.discount_percent && (
          <span className="discount">
            {Number(p.discount_percent)}{t("marketplace.offDiscount")}
          </span>
        )}
      </Link>
      <div className="product-card-info">
        <span className="category-label">{p.category}</span>
        <Link href={`/products/${p.id}`}>
          <h3>{p.name}</h3>
        </Link>
        <Link className="seller-line" href={`/sellers/${p.seller_public_id}`}>
          <StoreIcon />
          {p.seller_name}
          {!!p.seller_verified && <ShieldCheck size={12} />}
        </Link>
        <div className="price-row">
          <div>
            <strong>{money(p.effective_price)}</strong>
            {Number(p.effective_price) < Number(p.price) && (
              <del>{money(p.price)}</del>
            )}
          </div>
          <button
            className="icon-button"
            aria-label={`Add ${p.name} to bag`}
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
              toast(t("marketplace.addedToBag"));
            }}
          >
            <Plus size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
function StoreIcon() {
  return <ShoppingBag size={10} />;
}
export function CatalogScreen({
  home = false,
  seller,
}: {
  home?: boolean;
  seller?: string;
}) {
  const { t } = useI18n();
  const categories = getCategories(t);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({
    category,
    search,
    sort,
    page: String(page),
  });
  if (seller) params.set("seller", seller);
  const { data, error, loading, reload } = useResource<Paged<Product>>(
    `/products?${params}`,
  );
  return (
    <>
      <PublicHeader />
      <main className="public-container">
        {home ? (
          <>
            <section className="hero">
              <div>
                <span className="eyebrow">{t("marketplace.heroEyebrow")}</span>
                <h1>
                  {t("marketplace.heroHeading1")}
                  <br />
                  {t("marketplace.heroHeading2")}
                  <br />
                  <em>{t("marketplace.heroHeading3")}</em>
                </h1>
                <p>{t("marketplace.heroSubtitle")}</p>
                <div className="button-row">
                  <Link href="#discover" className="button primary">
                    {t("marketplace.heroExploreBtn")} <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/dashboard/parcels/new"
                    className="button secondary"
                  >
                    {t("marketplace.heroSendParcelBtn")} <Package size={16} />
                  </Link>
                </div>
              </div>
              <PackageArt />
            </section>
            <div className="trust-row">
              <div>
                <Truck size={25} />
                <div>
                  <strong>{t("marketplace.trustDoorTitle")}</strong>
                  <small>{t("marketplace.trustDoorSub")}</small>
                </div>
              </div>
              <div>
                <ShieldCheck size={25} />
                <div>
                  <strong>{t("marketplace.trustTrustTitle")}</strong>
                  <small>{t("marketplace.trustTrustSub")}</small>
                </div>
              </div>
              <div>
                <Package size={25} />
                <div>
                  <strong>{t("marketplace.trustTrackTitle")}</strong>
                  <small>{t("marketplace.trustTrackSub")}</small>
                </div>
              </div>
              <div>
                <Heart size={25} />
                <div>
                  <strong>{t("marketplace.trustBusinessTitle")}</strong>
                  <small>{t("marketplace.trustBusinessSub")}</small>
                </div>
              </div>
            </div>
          </>
        ) : (
          <PageHeading
            eyebrow={t("marketplace.headingEyebrow")}
            title={t("marketplace.headingTitle")}
            description={t("marketplace.headingSubtitle")}
          />
        )}
        <section id="discover">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{t("marketplace.discoverEyebrow")}</span>
              <h2>
                {seller ? t("marketplace.discoverFromSeller") : t("marketplace.discoverTitle")}
              </h2>
              <p>{t("marketplace.discoverSubtitle")}</p>
            </div>
            {home && (
              <Link href="/products" className="text-link">
                {t("marketplace.exploreAll")} <ArrowRight size={14} />
              </Link>
            )}
          </div>
          <div className="category-pills">
            {categories.map((c) => (
              <button
                className={category === c.id ? "active" : ""}
                key={c.id}
                onClick={() => {
                  setCategory(c.id);
                  setPage(1);
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
          {!home && (
            <div className="market-toolbar">
              <SearchInput
                value={search}
                onChange={(s) => {
                  setSearch(s);
                  setPage(1);
                }}
                placeholder={t("marketplace.searchPlaceholder")}
              />
              <select
                aria-label={t("common.search")}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="latest">{t("marketplace.sortLatest")}</option>
                <option value="price_asc">{t("marketplace.sortPriceAsc")}</option>
                <option value="price_desc">{t("marketplace.sortPriceDesc")}</option>
              </select>
            </div>
          )}
          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="skeleton" />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} retry={reload} />
          ) : data?.data.length ? (
            <>
              <div className="product-grid">
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
              title={t("common.emptyTitle")}
              description={t("common.emptyDescription")}
            />
          )}
        </section>
      </main>
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
          label={locale === "bn" ? "মার্কেটপ্লেসে ফিরে যান" : "Back to discoveries"}
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
                  {data.product.category} · {locale === "bn" ? "নির্বাচিত পণ্য" : "A LOCAL DISCOVERY"}
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
                      {String(data.seller.district || (locale === "bn" ? "বাংলাদেশ" : "Bangladesh"))}
                    </p>
                  </div>
                  <Link
                    className="button secondary"
                    href={`/sellers/${data.seller.public_id}`}
                  >
                    {locale === "bn" ? "দোকান ভিজিট করুন" : "Visit shop"} <ArrowRight size={13} />
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
  const sellers = new Set(cart.items.map((i) => i.seller_id || i.seller_name))
    .size;
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
                  <strong>{locale === "bn" ? "চেকআউটে নির্ধারিত হবে" : "Calculated at checkout"}</strong>
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
                    <option value="cod">{t("marketplace.cart.paymentCod")}</option>
                    <option value="prepaid">{t("marketplace.cart.paymentPrepaid")}</option>
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
                              {locale === "bn" ? "পণ্য" : "Items"} {money(g.subtotal)} + {t("marketplace.cart.deliveryLabel")}{" "}
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
                        </Link>
                        {" "}{t("marketplace.cart.termsAgree")}
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
                      {t("marketplace.cart.placeOrder")} <ArrowRight size={16} />
                    </Button>
                  </>
                ) : (
                  <Link
                    className="button primary full-width"
                    href="/login?return=/cart"
                  >
                    {t("marketplace.cart.signInToCheckout")} <ArrowRight size={16} />
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

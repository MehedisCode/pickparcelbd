"use client";

import { useAction, useI18n, useSession } from "@/components/providers";
import { PublicFooter, PublicHeader } from "@/components/shell";
import { Button, Empty, PageHeading, Panel } from "@/components/ui";
import { api, money } from "@/lib/api";
import { ArrowRight, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "../cart";

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

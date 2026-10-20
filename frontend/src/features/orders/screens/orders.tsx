"use client";

import { useI18n } from "@/components/providers";
import {
  Badge,
  Empty,
  ErrorState,
  Loading,
  PageHeading,
  Pagination,
  Panel,
  SearchInput,
  Tabs,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { date, money } from "@/lib/api";
import type { Paged } from "@/lib/types";
import type { Order } from "./types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function OrdersScreen() {
  const { t, locale } = useI18n();
  const [side, setSide] = useState("purchases");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, error, loading, reload } = useResource<Paged<Order>>(
    `/orders?side=${side}&page=${page}&search=${encodeURIComponent(search)}`,
  );
  return (
    <>
      <PageHeading
        eyebrow={
          locale === "bn"
            ? "ব্যবসা ও কেনাকাটার পূর্ণ বিবরণ"
            : "YOUR BUSINESS, TOGETHER"
        }
        title={
          locale === "bn"
            ? "প্রতিটি অর্ডারের স্পষ্ট হিসাব"
            : "Every order has a story."
        }
        description={
          locale === "bn"
            ? "ক্রয়, বিক্রয় এবং ডেলিভারির প্রতিটি পদক্ষেপের ট্র্যাক রাখুন।"
            : "Keep track of purchases, sales, and the next steps."
        }
      />
      <Tabs
        active={side}
        onChange={(s) => {
          setSide(s);
          setPage(1);
        }}
        items={[
          {
            id: "purchases",
            label: locale === "bn" ? "আমার ক্রয়সমূহ" : "My purchases",
          },
          {
            id: "sales",
            label: locale === "bn" ? "আমার বিক্রয়সমূহ" : "My sales",
          },
        ]}
      />
      <div className="filter-row">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={
            locale === "bn"
              ? "অর্ডার নম্বর দিয়ে খুঁজুন…"
              : "Search an order number…"
          }
        />
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : data?.data.length ? (
        <Panel>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("orders.colOrder")}</th>
                  <th>
                    {side === "purchases"
                      ? t("orders.colSeller")
                      : t("orders.colBuyer")}
                  </th>
                  <th>{t("orders.colStatus")}</th>
                  <th>{t("orders.colTotal")}</th>
                  <th>{t("orders.colPayment")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.data.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <strong>#{o.id}</strong>
                      <small>{date(o.created_at)}</small>
                    </td>
                    <td>
                      {side === "purchases" ? o.seller_name : o.buyer_name}
                    </td>
                    <td>
                      <Badge value={o.status} />
                    </td>
                    <td>{money(o.total)}</td>
                    <td>
                      {o.cod_enabled ? t("orders.cod") : t("orders.prepaid")}
                    </td>
                    <td>
                      <Link
                        className="text-link"
                        href={`/dashboard/orders/${o.id}`}
                      >
                        {t("orders.details")} <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={data.current_page}
            last={data.last_page}
            onChange={setPage}
          />
        </Panel>
      ) : (
        <Panel>
          <Empty
            title={
              side === "sales"
                ? locale === "bn"
                  ? "এখনো কোনো বিক্রয় অর্ডার নেই"
                  : "Your next customer is out there."
                : locale === "bn"
                  ? "এখনো কোনো ক্রয় অর্ডার নেই"
                  : "A little discovery is waiting."
            }
            description={
              side === "sales"
                ? locale === "bn"
                  ? "মার্কেটপ্লেসে নতুন পণ্য যোগ করুন এবং আপনার দোকান শেয়ার করে অর্ডার পাওয়া শুরু করুন।"
                  : "Publish products and share your shop to start receiving orders."
                : locale === "bn"
                  ? "মার্কেটপ্লেস ব্রাউজ করে আপনার প্রথম অর্ডারটি সম্পন্ন করুন।"
                  : "Explore the marketplace to place your first order."
            }
            action={
              <Link
                className="button primary"
                href={
                  side === "sales" ? "/dashboard/products/new" : "/products"
                }
              >
                {side === "sales"
                  ? t("orders.listProduct")
                  : t("orders.exploreMarketplace")}
                <ArrowRight size={15} />
              </Link>
            }
          />
        </Panel>
      )}
    </>
  );
}

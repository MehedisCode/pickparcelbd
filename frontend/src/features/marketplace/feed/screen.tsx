"use client";

import { useI18n, useSession, useToast } from "@/components/providers";
import { Avatar, PublicFooter } from "@/components/shell";
import { ErrorState } from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/lib/api";
import type { Paged, Product } from "@/lib/types";
import { categories } from "./format";
import { FeedHeader } from "./header";
import { FeedProduct } from "./product-card";
import {
  Check,
  ChevronDown,
  CirclePlus,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  PackagePlus,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Store,
  Truck,
  UserRound,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SocialFeedScreen({
  initialSearch = "",
}: {
  initialSearch?: string;
}) {
  const { locale } = useI18n();
  const { session } = useSession();
  const toast = useToast();
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const [tab, setTab] = useState<"all" | "following">("all");
  const [extra, setExtra] = useState<Product[]>([]);
  const [nextPage, setNextPage] = useState(2);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [followChanges, setFollowChanges] = useState<Record<number, boolean>>(
    {},
  );
  const params = new URLSearchParams({ category, search, sort, page: "1" });
  if (tab === "following") params.set("following", "1");
  const { data, loading, error, reload } = useResource<Paged<Product>>(
    `/products?${params}`,
  );
  const followed = useResource<{ data: { id: number }[] }>(
    session?.user ? "/following" : null,
  );
  const followedIds = new Set(followed.data?.data.map((user) => user.id) || []);
  const isFollowing = (id: number) => followChanges[id] ?? followedIds.has(id);
  const visible = [...(data?.data || []), ...extra];
  const suggestedSellers = [
    ...new Map(visible.map((product) => [product.user_id, product])).values(),
  ].slice(0, 3);
  const reset = () => {
    setExtra([]);
    setNextPage(2);
    setMoreError("");
  };
  const updateSearch = (value: string) => {
    setSearch(value);
    reset();
  };
  const updateCategory = (value: string) => {
    setCategory(value);
    reset();
  };
  const updateSort = (value: string) => {
    setSort(value);
    reset();
  };
  const updateTab = (value: "all" | "following") => {
    if (value === "following" && !session?.user) {
      router.push("/login?return=/");
      return;
    }
    setTab(value);
    reset();
  };
  const follow = async (id: number) => {
    if (!session?.user) {
      router.push("/login?return=/");
      return;
    }
    try {
      const response = await api.post<{ following: boolean }>(
        `/profiles/${id}/follow`,
      );
      setFollowChanges((current) => ({ ...current, [id]: response.following }));
      if (tab === "following") {
        reset();
        reload();
      }
      toast(
        response.following
          ? locale === "bn"
            ? "অনুসরণ করছেন"
            : "Following seller"
          : locale === "bn"
            ? "অনুসরণ বন্ধ হয়েছে"
            : "Unfollowed seller",
      );
    } catch (e) {
      toast(
        e instanceof Error ? e.message : "Could not update follow",
        "error",
      );
    }
  };
  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    setMoreError("");
    try {
      const next = new URLSearchParams({
        category,
        search,
        sort,
        page: String(nextPage),
      });
      if (tab === "following") next.set("following", "1");
      const result = await api.get<Paged<Product>>(`/products?${next}`);
      setExtra((current) => [...current, ...result.data]);
      setNextPage((value) => value + 1);
    } catch (e) {
      setMoreError(
        e instanceof Error ? e.message : "Unable to load more products.",
      );
    } finally {
      setLoadingMore(false);
    }
  };
  return (
    <>
      <FeedHeader search={search} onSearch={updateSearch} />
      <div className="v2-page-grid">
        <aside
          className="v2-side v2-left-side"
          aria-label={locale === "bn" ? "নেভিগেশন" : "Navigation"}
        >
          <Link href="/" className="active">
            <Home size={19} />
            {locale === "bn" ? "হোম ফিড" : "Home feed"}
          </Link>
          <Link href="/dashboard/following">
            <Users size={19} />
            {locale === "bn" ? "অনুসরণ" : "Following"}
          </Link>
          <Link href="/products">
            <Store size={19} />
            {locale === "bn" ? "মার্কেটপ্লেস" : "Marketplace"}
          </Link>
          <Link href="/dashboard">
            <UserRound size={19} />
            {locale === "bn" ? "আমার ওয়ার্কস্পেস" : "My workspace"}
          </Link>
          <Link href="/dashboard/orders">
            <ShoppingCart size={19} />
            {locale === "bn" ? "অর্ডারসমূহ" : "Orders"}
          </Link>
          <Link href="/dashboard/parcels">
            <Truck size={19} />
            {locale === "bn" ? "আমার পার্সেল" : "My parcels"}
          </Link>
          <Link href="/tracking">
            <Search size={19} />
            {locale === "bn" ? "ট্র্যাকিং" : "Tracking"}
          </Link>
          <Link href="/ride-share">
            <Heart size={19} />
            {locale === "bn" ? "রাইড শেয়ার" : "Ride share"}
          </Link>
          <div className="v2-left-divider" />
          <span className="v2-left-label">
            {locale === "bn" ? "বিক্রেতার টুলস" : "Seller tools"}
          </span>
          <Link href="/dashboard/products">
            <PackagePlus size={19} />
            {locale === "bn" ? "আমার পণ্য" : "My products"}
          </Link>
          <Link href="/help">
            <MessageCircle size={19} />
            {locale === "bn" ? "সাহায্য ও সহায়তা" : "Help & support"}
          </Link>
        </aside>
        <main className="v2-feed-main">
          <section
            className="v2-composer"
            aria-label={
              locale === "bn" ? "নতুন পণ্য বা পার্সেল" : "Product or parcel"
            }
          >
            <div className="v2-composer-top">
              <span className="v2-composer-avatar">
                {session?.user?.avatar_url ? (
                  <Image
                    src={session.user.avatar_url}
                    alt=""
                    width={44}
                    height={44}
                    unoptimized
                  />
                ) : (
                  <UserRound size={22} />
                )}
              </span>
              <Link href="/dashboard/products/new">
                {locale === "bn"
                  ? "আপনার পণ্য বিক্রি করতে চান? পোস্ট লিখুন..."
                  : "Want to sell something? Create a listing..."}
              </Link>
            </div>
            <div className="v2-composer-actions">
              <Link href="/dashboard/products/new">
                <CirclePlus size={20} />
                {locale === "bn" ? "পণ্য পোস্ট করুন" : "Post a product"}
              </Link>
              <Link href="/dashboard/parcels/new">
                <Truck size={20} />
                {locale === "bn" ? "পার্সেল বুক করুন" : "Book a parcel"}
              </Link>
            </div>
          </section>
          <section
            className="v2-feed-controls"
            aria-label={locale === "bn" ? "ফিড ফিল্টার" : "Feed filters"}
          >
            <div className="v2-feed-tabs">
              <button
                type="button"
                className={tab === "all" ? "active" : ""}
                onClick={() => updateTab("all")}
              >
                <Store size={18} />
                {locale === "bn" ? "সব পণ্য" : "All products"}
              </button>
              <button
                type="button"
                className={tab === "following" ? "active" : ""}
                onClick={() => updateTab("following")}
              >
                <Users size={18} />
                {locale === "bn" ? "অনুসরণকৃত" : "Following"}
              </button>
            </div>
            <label className="v2-sort">
              <SlidersHorizontal size={17} />
              <span className="sr-only">
                {locale === "bn" ? "সাজান" : "Sort"}
              </span>
              <select
                value={sort}
                onChange={(event) => updateSort(event.target.value)}
              >
                <option value="latest">
                  {locale === "bn" ? "নতুন পণ্য" : "Newest"}
                </option>
                <option value="price_asc">
                  {locale === "bn" ? "কম দাম" : "Lowest price"}
                </option>
                <option value="price_desc">
                  {locale === "bn" ? "বেশি দাম" : "Highest price"}
                </option>
              </select>
              <ChevronDown size={15} />
            </label>
          </section>
          <div
            id="categories"
            className="v2-category-list"
            aria-label={locale === "bn" ? "ক্যাটাগরি" : "Categories"}
          >
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                className={category === item.id ? "active" : ""}
                onClick={() => updateCategory(item.id)}
              >
                {item[locale]}
              </button>
            ))}
          </div>
          <section
            id="feed"
            className="v2-feed"
            aria-label={locale === "bn" ? "পণ্যের ফিড" : "Product feed"}
          >
            {search && (
              <div className="v2-result-label">
                {locale === "bn" ? "অনুসন্ধান:" : "Search:"}{" "}
                <strong>{search}</strong>
                <button type="button" onClick={() => updateSearch("")}>
                  ×
                </button>
              </div>
            )}
            {loading ? (
              <div className="v2-feed-loading" role="status">
                {locale === "bn" ? "পণ্য লোড হচ্ছে..." : "Loading products..."}
              </div>
            ) : error ? (
              <ErrorState message={error} retry={reload} />
            ) : visible.length ? (
              visible.map((p, index) => (
                <FeedProduct
                  key={p.id}
                  product={p}
                  following={isFollowing(p.user_id)}
                  onFollow={follow}
                  eager={index === 0}
                />
              ))
            ) : (
              <div className="v2-empty">
                <Store size={34} />
                <h2>
                  {tab === "following"
                    ? locale === "bn"
                      ? "অনুসরণ করা বিক্রেতার পণ্য নেই"
                      : "No products from followed sellers"
                    : locale === "bn"
                      ? "কোনো পণ্য পাওয়া যায়নি"
                      : "No products found"}
                </h2>
                <p>
                  {locale === "bn"
                    ? "অন্য ক্যাটাগরি বা অনুসন্ধান দিয়ে চেষ্টা করুন।"
                    : "Try another category or search."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTab("all");
                    setCategory("all");
                    updateSearch("");
                  }}
                >
                  {locale === "bn" ? "সব পণ্য দেখুন" : "Show all products"}
                </button>
              </div>
            )}
            {moreError && (
              <p className="v2-more-error" role="alert">
                {moreError}
              </p>
            )}
            {data && nextPage <= data.last_page && (
              <button
                type="button"
                className="v2-load-more"
                disabled={loadingMore}
                onClick={loadMore}
              >
                {loadingMore
                  ? locale === "bn"
                    ? "লোড হচ্ছে..."
                    : "Loading..."
                  : locale === "bn"
                    ? "আরও পণ্য দেখুন"
                    : "Show more products"}
              </button>
            )}
          </section>
        </main>
        <aside
          className="v2-side v2-right-side"
          aria-label={locale === "bn" ? "দ্রুত কাজ" : "Quick actions"}
        >
          <section className="v2-utility-card">
            <div className="v2-utility-title">
              <span className="v2-utility-icon">
                <MapPin size={20} />
              </span>
              <h2>
                {locale === "bn" ? "পার্সেল ট্র্যাকিং" : "Track a parcel"}
              </h2>
            </div>
            <form
              className="v2-tracking-form"
              onSubmit={(event) => {
                event.preventDefault();
                router.push(
                  trackingCode.trim()
                    ? `/tracking?code=${encodeURIComponent(trackingCode.trim())}`
                    : "/tracking",
                );
              }}
            >
              <label className="sr-only" htmlFor="v2-tracking-code">
                {locale === "bn" ? "ট্র্যাকিং নম্বর" : "Tracking number"}
              </label>
              <input
                id="v2-tracking-code"
                value={trackingCode}
                onChange={(event) => setTrackingCode(event.target.value)}
                placeholder={
                  locale === "bn"
                    ? "ট্র্যাকিং নম্বর লিখুন"
                    : "Enter tracking number"
                }
              />
              <button type="submit">
                {locale === "bn" ? "খুঁজুন" : "Find"}
              </button>
            </form>
          </section>
          <section className="v2-utility-card v2-parcel-card">
            <div className="v2-utility-title">
              <span className="v2-utility-icon orange">
                <Truck size={21} />
              </span>
              <h2>{locale === "bn" ? "পার্সেল বুকিং" : "Parcel booking"}</h2>
            </div>
            <p>
              {locale === "bn"
                ? "আপনার দোকানের পণ্য সারা বাংলাদেশে পাঠান। বুকিং ও ডেলিভারির তথ্য এক জায়গায় রাখুন।"
                : "Ship your store's products across Bangladesh and manage delivery in one place."}
            </p>
            <Link className="v2-utility-primary" href="/dashboard/parcels/new">
              <PackagePlus size={18} />
              {locale === "bn" ? "নতুন পার্সেল পাঠান" : "Send a parcel"}
            </Link>
          </section>
          <section className="v2-utility-card v2-seller-card">
            <div className="v2-utility-heading">
              <h2>
                {locale === "bn" ? "ফিডের বিক্রেতারা" : "Sellers in your feed"}
              </h2>
              <Link href="/products">
                {locale === "bn" ? "সব দেখুন" : "View all"}
              </Link>
            </div>
            {suggestedSellers.length ? (
              suggestedSellers.map((seller) => (
                <div key={seller.user_id} className="v2-suggested-seller">
                  <Link
                    href={
                      seller.seller_public_id
                        ? `/sellers/${encodeURIComponent(seller.seller_public_id)}`
                        : `/products/${seller.id}`
                    }
                    className="v2-seller-avatar"
                    aria-label={seller.seller_name || "Seller"}
                  >
                    {seller.seller_avatar ? (
                      <Image
                        src={seller.seller_avatar}
                        alt=""
                        width={42}
                        height={42}
                        unoptimized
                      />
                    ) : (
                      <Avatar name={seller.seller_name || "S"} />
                    )}
                  </Link>
                  <div>
                    <strong>
                      {seller.seller_name ||
                        (locale === "bn" ? "বিক্রেতা" : "Seller")}
                    </strong>
                    <span>
                      {seller.seller_district ||
                        (locale === "bn" ? "বাংলাদেশ" : "Bangladesh")}
                    </span>
                  </div>
                  {session?.user?.id !== seller.user_id && (
                    <button
                      type="button"
                      onClick={() => follow(seller.user_id)}
                      aria-label={
                        isFollowing(seller.user_id)
                          ? locale === "bn"
                            ? "অনুসরণ বন্ধ করুন"
                            : "Unfollow"
                          : locale === "bn"
                            ? "অনুসরণ করুন"
                            : "Follow"
                      }
                    >
                      {isFollowing(seller.user_id) ? (
                        <Check size={17} />
                      ) : (
                        <CirclePlus size={17} />
                      )}
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="v2-seller-empty">
                {locale === "bn"
                  ? "পণ্য এলে এখানে বিক্রেতা দেখা যাবে।"
                  : "Sellers will appear here when products are available."}
              </p>
            )}
          </section>
          <div className="v2-utility-footer">
            <Link href="/help">{locale === "bn" ? "সাহায্য" : "Help"}</Link>
            <Link href="/tracking">
              {locale === "bn" ? "ট্র্যাকিং" : "Tracking"}
            </Link>
          </div>
        </aside>
      </div>
      <nav
        className="v2-bottom-nav"
        aria-label={locale === "bn" ? "মোবাইল নেভিগেশন" : "Mobile navigation"}
      >
        <Link href="/" className="active">
          <Home size={23} />
          <span>{locale === "bn" ? "হোম" : "Home"}</span>
        </Link>
        <a
          href="#v2-search-input"
          onClick={() => document.getElementById("v2-search-input")?.focus()}
        >
          <Search size={23} />
          <span>{locale === "bn" ? "অনুসন্ধান" : "Search"}</span>
        </a>
        <Link href="/dashboard/products/new" className="v2-post-nav">
          <span>
            <CirclePlus size={29} />
          </span>
          <small>{locale === "bn" ? "পোস্ট" : "Post"}</small>
        </Link>
        <Link href="/dashboard/parcels">
          <Truck size={23} />
          <span>{locale === "bn" ? "পার্সেল" : "Parcels"}</span>
        </Link>
        <Link href={session?.user ? "/dashboard" : "/login"}>
          <UserRound size={23} />
          <span>{locale === "bn" ? "প্রোফাইল" : "Profile"}</span>
        </Link>
      </nav>
      <div className="v2-home-footer">
        <PublicFooter />
      </div>
    </>
  );
}

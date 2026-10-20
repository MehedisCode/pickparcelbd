"use client";

import { useI18n, useSession } from "@/components/providers";
import { Brand, LanguageSwitcher } from "@/components/shell";
import { useCart } from "../cart";
import { digits } from "./format";
import {
  Bell,
  MessageCircle,
  Search,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function FeedHeader({
  search,
  onSearch,
}: {
  search: string;
  onSearch: (value: string) => void;
}) {
  const { locale } = useI18n();
  const { session } = useSession();
  const cart = useCart();
  const [input, setInput] = useState(search);
  const count = cart.items.reduce((total, item) => total + item.quantity, 0);
  return (
    <header className="v2-header">
      <div className="v2-header-inner">
        <div className="v2-header-top">
          <Brand />
          <div className="v2-header-actions">
            <LanguageSwitcher />
            <Link
              href={
                session?.user
                  ? "/dashboard/messages"
                  : "/login?return=/dashboard/messages"
              }
              aria-label={locale === "bn" ? "বার্তা" : "Messages"}
              className="v2-icon-link"
            >
              <MessageCircle size={22} />
            </Link>
            <Link
              href={
                session?.user
                  ? "/dashboard/notifications"
                  : "/login?return=/dashboard/notifications"
              }
              aria-label={locale === "bn" ? "বিজ্ঞপ্তি" : "Notifications"}
              className="v2-icon-link"
            >
              <Bell size={22} />
            </Link>
            <Link
              href="/cart"
              aria-label={locale === "bn" ? "কার্ট" : "Cart"}
              className="v2-icon-link v2-cart-icon"
            >
              <ShoppingCart size={22} />
              {count > 0 && <span>{digits(count, locale)}</span>}
            </Link>
            <Link
              href={session?.user ? "/dashboard/settings" : "/login"}
              aria-label={locale === "bn" ? "প্রোফাইল" : "Profile"}
              className="v2-profile-icon"
            >
              {session?.user?.avatar_url ? (
                <Image
                  src={session.user.avatar_url}
                  alt=""
                  width={38}
                  height={38}
                  unoptimized
                />
              ) : (
                <UserRound size={22} />
              )}
            </Link>
          </div>
        </div>
        <form
          className="v2-search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            onSearch(input.trim());
            document
              .getElementById("feed")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <Search size={21} aria-hidden="true" />
          <label className="sr-only" htmlFor="v2-search-input">
            {locale === "bn"
              ? "পণ্য বা বিক্রেতা খুঁজুন"
              : "Search products or sellers"}
          </label>
          <input
            id="v2-search-input"
            type="search"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={
              locale === "bn"
                ? "পণ্য বা বিক্রেতা খুঁজুন..."
                : "Search products or sellers..."
            }
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setInput("");
                onSearch("");
              }}
              aria-label={locale === "bn" ? "সার্চ মুছুন" : "Clear search"}
            >
              ×
            </button>
          )}
        </form>
      </div>
    </header>
  );
}

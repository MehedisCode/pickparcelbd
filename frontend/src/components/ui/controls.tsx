"use client";

import { useI18n } from "@/components/providers";
import { ArrowLeft, ArrowRight, Search, X } from "lucide-react";
import { Button } from "./button";

export function Pagination({
  page,
  last,
  onChange,
}: {
  page: number;
  last: number;
  onChange: (n: number) => void;
}) {
  const { t, locale } = useI18n();
  if (last <= 1) return null;
  return (
    <div className="pagination">
      <Button
        tone="secondary"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ArrowLeft size={15} /> {t("common.previous")}
      </Button>
      <span>
        {locale === "bn"
          ? `পৃষ্ঠা ${page} এর ${last}`
          : `Page ${page} of ${last}`}
      </span>
      <Button
        tone="secondary"
        disabled={page >= last}
        onClick={() => onChange(page + 1)}
      >
        {t("common.next")} <ArrowRight size={15} />
      </Button>
    </div>
  );
}
export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
}) {
  const { t } = useI18n();
  const ph = placeholder || t("common.search");
  return (
    <div className="search-input">
      <Search size={17} />
      <input
        aria-label={ph}
        placeholder={ph}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button onClick={() => onChange("")} aria-label={t("common.remove")}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export function Tabs({
  items,
  active,
  onChange,
}: {
  items: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="tabs">
      {items.map((i) => (
        <button
          key={i.id}
          className={active === i.id ? "active" : ""}
          onClick={() => onChange(i.id)}
        >
          {i.label}
          {i.count !== undefined && <span>{i.count}</span>}
        </button>
      ))}
    </div>
  );
}

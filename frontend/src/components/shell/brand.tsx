"use client";

import { useI18n } from "@/components/providers";
import { Languages } from "lucide-react";
import Link from "next/link";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  return (
    <button
      type="button"
      className={`lang-toggle ${className}`}
      onClick={() => setLocale(locale === "bn" ? "en" : "bn")}
      aria-label={locale === "bn" ? "Switch to English" : "বাংলা ভাষায় দেখুন"}
      title={locale === "bn" ? "Switch to English" : "বাংলা ভাষায় দেখুন"}
    >
      <Languages size={15} />
      <span>{locale === "bn" ? "English" : "বাংলা"}</span>
    </button>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  return (
    <Link href="/" className="brand">
      <span className="brand-mark">
        <svg
          width={compact ? 23 : 27}
          height={compact ? 23 : 27}
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
        >
          <path d="M16 3 28 9.5 16 16 4 9.5 16 3Z" fill="#FF8B47" />
          <path d="M4 9.5 16 16v13L4 22V9.5Z" fill="#E9FFFA" />
          <path d="M28 9.5 16 16v13l12-7V9.5Z" fill="#80D7C9" />
          <path d="m11 6 12 6.6" stroke="#FFE1C5" strokeWidth="1.8" />
        </svg>
      </span>
      <span>
        PickParcel<span className="brand-bd">BD</span>
        <small>{t("nav.brandTagline")}</small>
      </span>
    </Link>
  );
}
export function Avatar({ name, size = "" }: { name: string; size?: string }) {
  return (
    <span className={`avatar ${size}`}>
      {name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")}
    </span>
  );
}

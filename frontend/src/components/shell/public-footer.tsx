"use client";

import { useI18n } from "@/components/providers";
import { Headphones } from "lucide-react";
import Link from "next/link";
import { Brand } from "./brand";

export function PublicFooter() {
  const { t } = useI18n();
  return (
    <footer className="public-footer public-footer-v2">
      <div className="public-footer-grid">
        <div className="public-footer-brand">
          <Brand compact />
          <p>{t("footer.tagline")}</p>
        </div>
        <nav aria-label={t("nav.marketplace")}>
          <strong>{t("nav.marketplace")}</strong>
          <Link href="/products">{t("marketplace.home.browseProducts")}</Link>
          <Link href="/#categories">{t("marketplace.home.allCategories")}</Link>
          <Link href="/dashboard/products/new">
            {t("marketplace.home.postProduct")}
          </Link>
        </nav>
        <nav aria-label={t("footer.contact")}>
          <strong>{t("footer.contact")}</strong>
          <Link href="/tracking">{t("nav.tracking")}</Link>
          <Link href="/help">{t("nav.help")}</Link>
          <Link href="/terms">{t("footer.terms")}</Link>
        </nav>
        <div className="public-footer-help">
          <strong>{t("nav.helpTitle")}</strong>
          <p>{t("nav.helpSubtitle")}</p>
          <Link href="/help">
            <Headphones size={16} /> {t("nav.helpTalk")}
          </Link>
        </div>
      </div>
      <div className="public-footer-bottom">
        <span>
          © {new Date().getFullYear()} PickParcelBD · {t("footer.rights")}
        </span>
        <span>{t("footer.note")}</span>
      </div>
    </footer>
  );
}

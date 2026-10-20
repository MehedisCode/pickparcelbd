import { toBanglaDigits } from "@/lib/bangla";

export function getCategories(t: (key: string) => string) {
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

export function localizedNumber(value: number | string, locale: "bn" | "en") {
  const formatted =
    typeof value === "number" ? value.toLocaleString("en-BD") : String(value);
  return locale === "bn" ? toBanglaDigits(formatted) : formatted;
}

export function localizedPrice(value: number, locale: "bn" | "en") {
  return `৳ ${localizedNumber(value, locale)}`;
}

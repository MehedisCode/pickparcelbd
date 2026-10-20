import { toBanglaDigits } from "@/lib/bangla";

export const categories = [
  { id: "all", bn: "সব পণ্য", en: "All products" },
  { id: "fashion", bn: "ফ্যাশন", en: "Fashion" },
  { id: "electronics", bn: "ইলেকট্রনিক্স", en: "Electronics" },
  { id: "home", bn: "বাড়ি-ঘর", en: "Home" },
  { id: "beauty", bn: "সৌন্দর্য", en: "Beauty" },
  { id: "food", bn: "খাবার", en: "Food" },
  { id: "other", bn: "আরও", en: "More" },
] as const;

export function digits(value: number | string, locale: "bn" | "en") {
  const formatted =
    typeof value === "number" ? value.toLocaleString("en-BD") : String(value);
  return locale === "bn" ? toBanglaDigits(formatted) : formatted;
}

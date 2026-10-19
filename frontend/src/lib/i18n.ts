"use client";

import bnMessages from "@/messages/bn.json";
import enMessages from "@/messages/en.json";
import { createContext, useContext } from "react";

export type Locale = "bn" | "en";

export type Messages = typeof bnMessages;

type RecursiveKeyOf<T> = T extends object
  ? {
      [K in keyof T & (string | number)]: T[K] extends object
        ? `${K}` | `${K}.${RecursiveKeyOf<T[K]>}`
        : `${K}`;
    }[keyof T & (string | number)]
  : never;

export type MessageKey = RecursiveKeyOf<Messages>;

export const catalogs: Record<Locale, Messages> = {
  bn: bnMessages,
  en: enMessages,
};

function getNestedValue(obj: unknown, path: string): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

export function createTranslator(locale: Locale) {
  const currentCatalog = catalogs[locale] || catalogs.bn;
  const fallbackCatalog = catalogs.bn;

  return function t(
    key: MessageKey | (string & {}),
    params?: Record<string, string | number>,
  ): string {
    let message =
      getNestedValue(currentCatalog, key) ??
      getNestedValue(fallbackCatalog, key) ??
      key;

    if (params) {
      for (const [k, v] of Object.entries(params)) {
        message = message.replaceAll(`{${k}}`, String(v));
      }
    }
    return message;
  };
}

export interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (
    key: MessageKey | (string & {}),
    params?: Record<string, string | number>,
  ) => string;
  messages: Messages;
  formatMoney: (value: unknown) => string;
  translateStatus: (status: string) => string;
}

export const defaultTranslator = createTranslator("bn");

export const LanguageContext = createContext<LanguageContextType>({
  locale: "bn",
  setLocale: () => {},
  t: defaultTranslator,
  messages: catalogs.bn,
  formatMoney: (v) => `৳ ${Number(v || 0).toLocaleString("en-BD")}`,
  translateStatus: (s) => s,
});

export function useI18n() {
  return useContext(LanguageContext);
}

export function formatTaka(value: unknown): string {
  const num = Number(value || 0);
  return `৳ ${num.toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function translateStatus(status: string, locale: Locale = "bn"): string {
  const key = String(status).toLowerCase().trim();
  const catalog = catalogs[locale] || catalogs.bn;
  const statuses = catalog.status as Record<string, string>;

  if (statuses && key in statuses) {
    return statuses[key];
  }
  return String(status).replaceAll("_", " ");
}

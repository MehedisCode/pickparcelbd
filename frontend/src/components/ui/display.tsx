"use client";

import { label } from "@/lib/api";
import { useI18n } from "@/components/providers";
import { Inbox, LoaderCircle, TriangleAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Badge({ value }: { value: unknown }) {
  const { translateStatus } = useI18n();
  return (
    <span className={`badge ${String(value)}`}>
      {translateStatus(String(value))}
    </span>
  );
}
export function Empty({
  title,
  description,
  action,
  icon,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <div className={`empty-state ${className}`.trim()}>
      <div className="empty-icon">{icon || <Inbox size={28} />}</div>
      <h3>{title || t("common.emptyTitle")}</h3>
      <p>{description || t("common.emptyDescription")}</p>
      {action}
    </div>
  );
}
export function Loading({ message }: { message?: string }) {
  const { t } = useI18n();
  return (
    <div className="loading-state" role="status">
      <LoaderCircle className="spin" size={24} />
      <span>{message || t("common.loadingWorkspace")}</span>
    </div>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="error-state" role="alert">
      <TriangleAlert size={22} />
      <h3>{t("common.errorTitle")}</h3>
      <p>{message}</p>
      {retry && (
        <Button tone="secondary" onClick={retry}>
          {t("common.errorRetry")}
        </Button>
      )}
    </div>
  );
}
export function Panel({
  children,
  title,
  action,
  className = "",
}: {
  children: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <div className="panel-heading">
          <h2>{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function BackLink({
  href,
  label: caption,
}: {
  href: string;
  label?: string;
}) {
  const { t } = useI18n();
  return (
    <Link href={href} className="back-link">
      <ArrowLeft size={16} />
      {caption || t("common.back")}
    </Link>
  );
}
export function KeyValue({
  label: caption,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="key-value">
      <span>{caption}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}
export function HumanText({ value }: { value: unknown }) {
  return <span className="capitalize">{label(value)}</span>;
}

"use client";

import { label } from "@/lib/api";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Inbox,
  LoaderCircle,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useAction, useI18n } from "./providers";

export function Button({
  children,
  tone = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button type="button" className={`button ${tone} ${className}`} {...props}>
      {children}
    </button>
  );
}
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
  const { formatStatus } = useI18n();
  return (
    <span className={`badge ${String(value)}`}>
      {formatStatus(String(value))}
    </span>
  );
}
export function Empty({
  title,
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Inbox size={28} />
      </div>
      <h3>{title || t.emptyTitle}</h3>
      <p>{description || t.emptyDescription}</p>
      {action}
    </div>
  );
}
export function Loading({ message }: { message?: string }) {
  const { t } = useI18n();
  return (
    <div className="loading-state" role="status">
      <LoaderCircle className="spin" size={24} />
      <span>{message || t.loadingWorkspace}</span>
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
      <h3>{t.errorTitle}</h3>
      <p>{message}</p>
      {retry && (
        <Button tone="secondary" onClick={retry}>
          {t.errorRetry}
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
export function Pagination({
  page,
  last,
  onChange,
}: {
  page: number;
  last: number;
  onChange: (n: number) => void;
}) {
  const { locale } = useI18n();
  if (last <= 1) return null;
  return (
    <div className="pagination">
      <Button
        tone="secondary"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ArrowLeft size={15} /> {locale === "bn" ? "পূর্ববর্তী" : "Previous"}
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
        {locale === "bn" ? "পরবর্তী" : "Next"} <ArrowRight size={15} />
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
  const ph = placeholder || t.searchPlaceholder;
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
        <button onClick={() => onChange("")} aria-label={t.remove}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLElement>(null);
  const closeFromKeyboard = useEffectEvent(onClose);
  useEffect(() => {
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const node = dialog.current;
    const selector =
      'button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex="0"]';
    node?.querySelector<HTMLElement>(selector)?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeFromKeyboard();
      }
      if (event.key === "Tab" && node) {
        const items = Array.from(node.querySelectorAll<HTMLElement>(selector));
        const first = items[0],
          last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        ref={dialog}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="panel-heading">
          <h2>{title}</h2>
          <Button tone="ghost" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}
export type Field = {
  refreshKey?: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: string;
  help?: string;
};
export function Form({
  fields,
  initial = {},
  submit = "Save changes",
  onSubmit,
  onValueChange,
}: {
  fields: Field[];
  initial?: Record<string, unknown>;
  submit?: string;
  onSubmit: (values: Record<string, unknown>) => Promise<unknown>;
  onValueChange?: (name: string, value: string) => void;
}) {
  const { run, busy } = useAction();
  return (
    <form
      className="form-grid"
      onChange={(e) => {
        const target = e.target;
        if (
          (target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            target instanceof HTMLSelectElement) &&
          target.name
        )
          onValueChange?.(target.name, target.value);
      }}
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const values: Record<string, unknown> = {};
        for (const f of fields) {
          const raw = data.get(f.name);
          if (f.type === "checkbox") values[f.name] = raw === "on";
          else if (f.type === "file") values[f.name] = raw;
          else if (raw !== null && String(raw) !== "")
            values[f.name] = String(raw);
          else if (!f.required) values[f.name] = null;
        }
        await run(() => onSubmit(values));
      }}
    >
      {fields.map((f) => (
        <label
          className={`field ${f.type === "textarea" ? "full" : ""} ${f.type === "checkbox" ? "checkbox-field" : ""}`}
          key={`${f.name}-${f.refreshKey || ""}`}
        >
          {f.type !== "checkbox" && (
            <span>
              {f.label}
              {f.required && <b> *</b>}
            </span>
          )}
          {f.type === "textarea" ? (
            <textarea
              name={f.name}
              defaultValue={String(initial[f.name] ?? "")}
              required={f.required}
              placeholder={f.placeholder}
              rows={4}
            />
          ) : f.options ? (
            <select
              name={f.name}
              defaultValue={String(initial[f.name] ?? "")}
              required={f.required}
            >
              <option value="">Select…</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : f.type === "checkbox" ? (
            <>
              <input
                type="checkbox"
                name={f.name}
                required={f.required}
                defaultChecked={Boolean(initial[f.name])}
              />
              <span>{f.label}</span>
            </>
          ) : (
            <input
              name={f.name}
              type={f.type || "text"}
              defaultValue={
                f.type === "file" ? undefined : String(initial[f.name] ?? "")
              }
              required={f.required}
              placeholder={f.placeholder}
              min={f.min}
              max={f.max}
              step={f.step}
            />
          )}{" "}
          {f.help && <small>{f.help}</small>}
        </label>
      ))}
      <div className="form-actions">
        <Button type="submit" disabled={busy}>
          {busy ? (
            <LoaderCircle size={17} className="spin" />
          ) : (
            <CheckCircle2 size={17} />
          )}{" "}
          {busy ? "Saving…" : submit}
        </Button>
      </div>
    </form>
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
      {caption || t.back}
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
export function ConfirmAction({
  title,
  description,
  onConfirm,
  children,
}: {
  title: string;
  description: string;
  onConfirm: () => Promise<unknown>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { run, busy } = useAction();
  return (
    <>
      <Button tone="secondary" onClick={() => setOpen(true)}>
        {children}
      </Button>
      {open && (
        <Modal title={title} onClose={() => setOpen(false)}>
          <p>{description}</p>
          <div className="button-row">
            <Button tone="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={busy}
              onClick={async () => {
                if (await run(onConfirm)) setOpen(false);
              }}
            >
              Confirm
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

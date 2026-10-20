"use client";

import { useAction } from "@/components/providers";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { Button } from "./button";

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

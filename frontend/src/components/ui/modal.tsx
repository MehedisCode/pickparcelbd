"use client";

import { useAction, useI18n } from "@/components/providers";
import { X } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Button } from "./button";

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
  const { t } = useI18n();
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
              {t("common.cancel")}
            </Button>
            <Button
              disabled={busy}
              onClick={async () => {
                if (await run(onConfirm)) setOpen(false);
              }}
            >
              {t("common.confirm")}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

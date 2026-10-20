"use client";

import { useAction } from "@/components/providers";
import { BackLink, Button, Form, PageHeading, Panel } from "@/components/ui";
import { api } from "@/lib/api";
import type { Transfer } from "./types";
import { CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { QrScanner } from "@/components/qr-scanner";
import { useState } from "react";

export function TransferReceiveScreen() {
  const params = useSearchParams();
  const [token, setToken] = useState(params.get("token") || "");
  const [preview, setPreview] = useState<{
    transfer: Transfer;
    items: { code: string; status: string; delivery_district: string }[];
  }>();
  const [selected, setSelected] = useState<string[]>([]);
  const { run, busy } = useAction();
  const router = useRouter();
  return (
    <>
      <BackLink href="/operations/transfers" label="Back to handovers" />
      <PageHeading
        eyebrow="KEEP THE JOURNEY CONNECTED"
        title="Receive a handover"
        description="Scan the sender’s QR with your camera app, or paste the transfer token below."
      />
      <Panel title="Handover token">
        <QrScanner onScan={(value) => setToken(value)} />
        <Form
          key={token}
          initial={{ token }}
          fields={[
            {
              name: "token",
              label: "QR token or handover link",
              required: true,
              type: "textarea",
              placeholder: "Paste the sender’s QR link or 64-character token",
            },
          ]}
          submit="Preview parcels"
          onSubmit={async (d) => {
            const raw = String(d.token).trim();
            let extracted = raw;
            try {
              extracted = new URL(raw).searchParams.get("token") || raw;
            } catch {}
            const result = await api.post<{
              transfer: Transfer;
              items: {
                code: string;
                status: string;
                delivery_district: string;
              }[];
            }>("/transfers/preview", { token: extracted });
            setToken(extracted);
            setPreview(result);
            setSelected(result.items.map((p) => p.code));
          }}
        />
      </Panel>
      {preview && (
        <Panel
          title={`Select parcels from ${preview.transfer.code}`}
          className="receive-preview"
        >
          <div className="panel-body">
            {preview.items.map((p) => (
              <label className="person-card" key={p.code}>
                <input
                  type="checkbox"
                  checked={selected.includes(p.code)}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked
                        ? [...selected, p.code]
                        : selected.filter((c) => c !== p.code),
                    )
                  }
                />
                <div>
                  <strong>RFD{p.code}</strong>
                  <p>
                    {p.delivery_district || "Bangladesh"} · {p.status}
                  </p>
                </div>
              </label>
            ))}
            <div className="info-notice" style={{ marginTop: 20 }}>
              <CheckCircle2 size={18} />
              <p>
                Confirm only the parcels physically received. Unselected parcels
                stay with the sender and this handover closes after receipt.
              </p>
            </div>
            <Button
              disabled={busy || !selected.length}
              onClick={() =>
                void run(async () => {
                  const out = await api.post<{ id: number }>(
                    "/transfers/accept",
                    { token, codes: selected },
                  );
                  router.push(`/operations/transfers/${out.id}`);
                }, "Parcels received.")
              }
            >
              Confirm receipt of {selected.length} parcel
              {selected.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </Panel>
      )}
    </>
  );
}

"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import type { Parcel } from "@/lib/types";
import { Button, Form, Panel } from "@/components/ui";
import { useAction } from "@/components/providers";
export function BatchPickup() {
  const [batch, setBatch] = useState<Parcel[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [otp, setOtp] = useState("");
  const [anchor, setAnchor] = useState("");
  const { run, busy } = useAction();
  return (
    <Panel title="Verify a pickup batch">
      <Form
        fields={[
          {
            name: "parcel_code",
            label: "One parcel code from this batch",
            required: true,
          },
          {
            name: "otp",
            label: "Sender’s six-digit pickup code",
            required: true,
          },
        ]}
        submit="Preview pickup batch"
        onSubmit={async (d) => {
          const result = await api.post<{ data: Parcel[] }>(
            "/parcels/pickup-batch",
            d,
          );
          setBatch(result.data);
          setSelected(result.data.map((p) => p.code));
          setOtp(String(d.otp));
          setAnchor(String(d.parcel_code));
        }}
      />
      {batch.length > 0 && (
        <div className="panel-body">
          {batch.map((p) => (
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
                  {p.delivery_name} · {p.delivery_district}
                </p>
              </div>
            </label>
          ))}
          <Button
            disabled={busy || !selected.length}
            onClick={() =>
              void run(async () => {
                await api.post("/parcels/pickup-batch", {
                  otp,
                  parcel_code: anchor,
                  codes: selected,
                });
                setBatch([]);
              }, "Pickup verified.")
            }
          >
            Confirm physical receipt of {selected.length} parcels
          </Button>
        </div>
      )}
    </Panel>
  );
}

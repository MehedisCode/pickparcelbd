"use client";

import { BackLink, Form, PageHeading, Panel } from "@/components/ui";
import { api } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

export function TransferCreateScreen() {
  const params = useSearchParams();
  const router = useRouter();
  return (
    <>
      <BackLink href="/operations/transfers" label="Back to handovers" />
      <PageHeading
        eyebrow="THE NEXT LINK IN THE JOURNEY"
        title="Create a parcel handover"
        description="Select parcels in your custody and share the QR with the next member."
      />
      <Panel title="Your handover details">
        <Form
          initial={{ codes: params.get("codes") || "" }}
          fields={[
            {
              name: "codes",
              label: "Parcel codes",
              required: true,
              type: "textarea",
              placeholder: "670847, 312456",
              help: "Comma-separated six-digit parcel codes. You must hold each parcel.",
            },
            { name: "note", label: "Handover note", type: "textarea" },
          ]}
          submit="Create handover QR"
          onSubmit={async (d) => {
            const codes = String(d.codes)
              .split(/[\s,]+/)
              .filter(Boolean)
              .map((c) => c.replace(/^RFD/i, ""));
            const result = await api.post<{ id: number }>("/transfers", {
              codes,
              note: d.note,
            });
            router.push(`/operations/transfers/${result.id}`);
          }}
        />
      </Panel>
    </>
  );
}

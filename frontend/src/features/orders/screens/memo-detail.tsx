"use client";

import { useAction, useSession } from "@/components/providers";
import {
  BackLink,
  Badge,
  Button,
  ConfirmAction,
  ErrorState,
  Loading,
  PageHeading,
  Panel,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/lib/api";
import type { MemoDetail } from "./types";
import { ArrowRight, ImagePlus, Printer, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function MemoDetailScreen({ id }: { id: string }) {
  const { data, error, loading, reload } = useResource<MemoDetail>(
    `/cash-memos/${id}`,
  );
  const { session } = useSession();
  const { run, busy } = useAction();
  const [files, setFiles] = useState<Record<string, File>>({});
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;
  if (!data) return null;
  const seller = Number(data.memo.seller_id) === session?.user?.id;
  return (
    <>
      <BackLink href="/dashboard/cash-memos" label="Back to cash memos" />
      <PageHeading
        eyebrow="A CLEAR RECORD OF YOUR ORDER"
        title={`Cash memo #${id}`}
        description={`${data.buyer.name} → ${data.seller.name}`}
        action={
          <Button tone="secondary" onClick={() => window.print()}>
            <Printer size={15} />
            Print memo
          </Button>
        }
      />
      <Panel title="Your documents">
        <div className="document-grid">
          {["buyer", "seller", "payment"].map((role) => {
            const doc = data.documents.find((d) => d.role === role);
            const allowed = seller ? role === "seller" : role !== "seller";
            return (
              <section className="document-card" key={role}>
                {doc ? (
                  <a
                    href={`/api/v1/documents/${doc.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Image
                      src={`/api/v1/documents/${doc.id}`}
                      alt={`${role} document`}
                      width={400}
                      height={300}
                      unoptimized
                    />
                  </a>
                ) : (
                  <div className="empty-state" style={{ padding: 25 }}>
                    <ImagePlus size={30} color="var(--muted)" />
                  </div>
                )}
                <h3>
                  {role === "buyer"
                    ? "Buyer’s order list"
                    : role === "seller"
                      ? "Completed seller memo"
                      : "Payment proof"}
                </h3>
                {allowed && data.memo.status === "draft" && (
                  <>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      aria-label={`Upload ${role} document`}
                      onChange={(e) => {
                        if (e.target.files?.[0])
                          setFiles((s) => ({
                            ...s,
                            [role]: e.target.files![0],
                          }));
                      }}
                    />
                    <div className="button-row">
                      <Button
                        tone="secondary"
                        disabled={!files[role] || busy}
                        onClick={() =>
                          void run(async () => {
                            const fd = new FormData();
                            fd.set("role", role);
                            fd.set("image", files[role]);
                            await api.post(`/cash-memos/${id}/documents`, fd);
                          }, "Document uploaded.")
                        }
                      >
                        Upload image
                      </Button>
                      {doc && (
                        <ConfirmAction
                          title="Remove document?"
                          description="This removes your image from the draft memo."
                          onConfirm={() => api.delete(`/documents/${doc.id}`)}
                        >
                          <Trash2 size={13} />
                          Remove
                        </ConfirmAction>
                      )}
                    </div>
                  </>
                )}
              </section>
            );
          })}
        </div>
        <div className="panel-body">
          <div className="button-row">
            {seller && data.memo.status === "draft" && (
              <Button
                disabled={busy}
                onClick={() =>
                  void run(
                    () => api.post(`/cash-memos/${id}/send`),
                    "Cash memo sent for delivery.",
                  )
                }
              >
                Send to PickParcelBD <ArrowRight size={14} />
              </Button>
            )}
            {data.order && (
              <Link
                href={`/dashboard/orders/${data.order.id}`}
                className="button secondary"
              >
                View delivery order #{data.order.id}
              </Link>
            )}
            <Badge value={data.memo.status} />
          </div>
          <p style={{ fontSize: 11, marginTop: 18 }}>
            Buyer and seller images are required before requesting delivery.
            Your payment proof is visible only to the order participants.
          </p>
        </div>
      </Panel>
    </>
  );
}

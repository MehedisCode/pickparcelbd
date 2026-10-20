"use client";

import { useAction, useToast } from "@/components/providers";
import {
  BackLink,
  Badge,
  Button,
  ErrorState,
  KeyValue,
  Loading,
  PageHeading,
  Panel,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, date, money } from "@/lib/api";
import type { TransferDetail } from "./types";
import { Copy, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

export function TransferDetailScreen({ id }: { id: string }) {
  const { data, error, loading, reload } = useResource<TransferDetail>(
    `/transfers/${id}`,
  );
  const [qr, setQr] = useState<string>();
  const toast = useToast();
  const { run, busy } = useAction();
  useEffect(() => {
    let active = true;
    if (data?.token) {
      const url = `${window.location.origin}/operations/transfers/receive?token=${data.token}`;
      QRCode.toDataURL(url, {
        width: 240,
        margin: 2,
        color: { dark: "#20352f", light: "#ffffff" },
      })
        .then((src) => {
          if (active) setQr(src);
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [data?.token]);
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;
  if (!data) return null;
  return (
    <>
      <BackLink href="/operations/transfers" label="Back to handovers" />
      <PageHeading
        eyebrow="HANDOVER RECORD"
        title={data.transfer.code}
        description={`Created ${date(data.transfer.created_at)}`}
        action={<Badge value={data.transfer.status} />}
      />
      <div className="detail-grid">
        <Panel title="Parcels in this handover">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Parcel</th>
                  <th>Recipient</th>
                  <th>Received</th>
                  <th>Collection</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((p) => (
                  <tr key={p.code}>
                    <td>
                      <Link
                        className="text-link"
                        href={`/dashboard/parcels/${p.code}`}
                      >
                        RFD{p.code}
                      </Link>
                    </td>
                    <td>
                      {p.delivery_name}
                      <small>{p.delivery_district}</small>
                    </td>
                    <td>
                      {p.received_at ? (
                        <Badge value="received" />
                      ) : (
                        "Not received"
                      )}
                    </td>
                    <td>{money(p.collection_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="panel-body button-row">
            <a
              className="button secondary"
              href={`/api/v1/transfers/${id}/export`}
            >
              <Download size={15} />
              Download CSV
            </a>
            {data.transfer.status === "accepted" && (
              <Button
                disabled={busy}
                onClick={() =>
                  void run(
                    () => api.post(`/transfers/${id}/collection-handover`),
                    "Collection handover acknowledged.",
                  )
                }
              >
                Acknowledge collection handover
              </Button>
            )}
          </div>
        </Panel>
        <Panel title={data.token ? "Scan to receive" : "Handover information"}>
          {data.token ? (
            <div className="qr-card">
              {qr ? (
                <Image
                  src={qr}
                  alt="QR code to receive this parcel handover"
                  width={240}
                  height={240}
                  unoptimized
                />
              ) : (
                <Loading />
              )}
              <p style={{ fontSize: 11 }}>
                The receiving member scans this code and chooses the parcels
                they receive.
              </p>
              <KeyValue
                label="Expires"
                value={new Date(data.transfer.expires_at).toLocaleString(
                  "en-BD",
                )}
              />
              <code>{data.token}</code>
              <Button
                tone="secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `${window.location.origin}/operations/transfers/receive?token=${data.token}`,
                    );
                    toast("Handover link copied.");
                  } catch {
                    toast("Copy the token shown above.", "error");
                  }
                }}
              >
                <Copy size={14} />
                Copy handover link
              </Button>
            </div>
          ) : (
            <div className="panel-body">
              <KeyValue label="Status" value={data.transfer.status} />
              <p>
                {data.transfer.note ||
                  "This handover is saved in your history."}
              </p>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}

"use client";
import { useAction, useToast } from "@/components/providers";
import {
  BackLink,
  Badge,
  Button,
  Empty,
  ErrorState,
  Form,
  KeyValue,
  Loading,
  PageHeading,
  Pagination,
  Panel,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, date, money } from "@/lib/api";
import type { Paged } from "@/lib/types";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Download,
  Plus,
  ScanLine,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { QrScanner } from "@/components/qr-scanner";
import { useEffect, useState } from "react";

type Transfer = {
  id: number;
  code: string;
  status: string;
  created_at: string;
  expires_at: string;
  sender_name: string;
  receiver_name: string | null;
};
export function TransferListScreen() {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useResource<Paged<Transfer>>(
    `/transfers?page=${page}`,
  );
  return (
    <>
      <PageHeading
        eyebrow="A CONNECTED DELIVERY NETWORK"
        title="Good handovers. Clear history."
        description="Every parcel, passed on with confidence."
        action={
          <Link className="button primary" href="/operations/transfers/new">
            <Plus size={15} />
            Create handover
          </Link>
        }
      />
      <div className="button-row" style={{ marginBottom: 20 }}>
        <Link className="button secondary" href="/operations/transfers/receive">
          <ScanLine size={16} />
          Receive a handover
        </Link>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : data?.data.length ? (
        <Panel>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transfer</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.data.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.code}</strong>
                    </td>
                    <td>{t.sender_name}</td>
                    <td>{t.receiver_name || "Awaiting receipt"}</td>
                    <td>
                      <Badge value={t.status} />
                    </td>
                    <td>{date(t.created_at)}</td>
                    <td>
                      <Link
                        className="text-link"
                        href={`/operations/transfers/${t.id}`}
                      >
                        Details <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={data.current_page}
            last={data.last_page}
            onChange={setPage}
          />
        </Panel>
      ) : (
        <Panel>
          <Empty
            title="A clear chain of care"
            description="Your handovers will appear here once you create or receive one."
          />
        </Panel>
      )}
    </>
  );
}
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
type TransferDetail = {
  transfer: Transfer & { note: string | null };
  token: string | null;
  items: {
    code: string;
    delivery_name: string;
    delivery_district: string;
    received_at: string | null;
    collection_amount: string;
    collection_handed_over_at: string | null;
  }[];
};
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

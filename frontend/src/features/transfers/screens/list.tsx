"use client";

import {
  Badge,
  Empty,
  ErrorState,
  Loading,
  PageHeading,
  Pagination,
  Panel,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { date } from "@/lib/api";
import type { Paged } from "@/lib/types";
import type { Transfer } from "./types";
import { ArrowRight, Plus, ScanLine } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

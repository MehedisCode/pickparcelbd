"use client";

import {
  Badge,
  Button,
  Empty,
  ErrorState,
  Form,
  Loading,
  Modal,
  PageHeading,
  Pagination,
  Panel,
  SearchInput,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, date } from "@/lib/api";
import type { Paged } from "@/lib/types";
import type { Memo } from "./types";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function MemosScreen() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data, error, loading, reload } = useResource<Paged<Memo>>(
    `/cash-memos?page=${page}`,
  );
  const { data: people } = useResource<{
    data: { id: number; name: string; public_id: string }[];
  }>(
    search.length >= 2 ? `/people?search=${encodeURIComponent(search)}` : null,
  );
  const router = useRouter();
  return (
    <>
      <PageHeading
        eyebrow="THE DETAILS THAT KEEP BUSINESS MOVING"
        title="Cash memos"
        description="Order lists, seller memos, and payment proofs, together."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={15} />
            New cash memo
          </Button>
        }
      />
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
                  <th>Memo</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.data.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <strong>#{m.id}</strong>
                    </td>
                    <td>{m.buyer_name}</td>
                    <td>{m.seller_name}</td>
                    <td>
                      <Badge value={m.status} />
                    </td>
                    <td>{date(m.created_at)}</td>
                    <td>
                      <Link
                        className="text-link"
                        href={`/dashboard/cash-memos/${m.id}`}
                      >
                        Open memo <ArrowRight size={13} />
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
            title="Keep every detail in good order."
            description="Start a cash memo with your seller, then upload the order list and completed memo."
          />
        </Panel>
      )}
      {open && (
        <Modal title="Start a cash memo" onClose={() => setOpen(false)}>
          <div className="panel-body">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Find a seller by name or public ID…"
            />
          </div>
          <Form
            fields={[
              {
                name: "seller_id",
                label: "Choose a seller",
                required: true,
                options: (people?.data || []).map((p) => ({
                  value: String(p.id),
                  label: `${p.name} · ${p.public_id}`,
                })),
              },
            ]}
            submit="Create cash memo"
            onSubmit={async (d) => {
              const m = await api.post<{ id: number }>("/cash-memos", {
                seller_id: Number(d.seller_id),
              });
              router.push(`/dashboard/cash-memos/${m.id}`);
            }}
          />
        </Modal>
      )}
    </>
  );
}

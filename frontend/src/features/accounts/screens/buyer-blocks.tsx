"use client";

import { useAction } from "@/components/providers";
import { Avatar } from "@/components/shell";
import {
  Button,
  Empty,
  ErrorState,
  KeyValue,
  Loading,
  PageHeading,
  Panel,
  SearchInput,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { useState } from "react";

export function BuyerBlocksScreen() {
  const [search, setSearch] = useState("");
  const [phone, setPhone] = useState("");
  const [history, setHistory] = useState<{
    total: number;
    delivered: number;
    returned: number;
    pending: number;
  }>();
  const { data, error, loading, reload } = useResource<{
    data: Pick<User, "id" | "name" | "public_id">[];
  }>("/buyer-blocks");
  const { data: people } = useResource<{
    data: Pick<User, "id" | "name" | "public_id">[];
  }>(
    search.length >= 2 ? `/people?search=${encodeURIComponent(search)}` : null,
  );
  const { run, busy } = useAction();
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE MORE CONTROL"
        title="Buyer preferences & history"
        description="Manage your blocklist and check delivery outcomes from your own orders."
      />
      <div className="detail-grid">
        <Panel title="Your blocked buyers">
          <div className="panel-body">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Find an account by name or public ID…"
            />
            {people?.data.map((u) => (
              <div className="person-card" key={u.id}>
                <div>
                  <h3>{u.name}</h3>
                  <p>{u.public_id}</p>
                </div>
                <Button
                  tone="secondary"
                  disabled={busy}
                  onClick={() =>
                    void run(
                      () => api.post(`/buyer-blocks/${u.id}`),
                      "Buyer blocked.",
                    )
                  }
                >
                  Block buyer
                </Button>
              </div>
            ))}
          </div>
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorState message={error} retry={reload} />
          ) : data?.data.length ? (
            data.data.map((u) => (
              <div className="person-card" key={u.id}>
                <Avatar name={u.name} />
                <div>
                  <h3>{u.name}</h3>
                  <p>{u.public_id}</p>
                </div>
                <Button
                  tone="secondary"
                  disabled={busy}
                  onClick={() =>
                    void run(
                      () => api.delete(`/buyer-blocks/${u.id}`),
                      "Buyer unblocked.",
                    )
                  }
                >
                  Unblock
                </Button>
              </div>
            ))
          ) : (
            <Empty
              title="Your blocklist is empty."
              description="Blocked buyers cannot place new orders or exchange messages with you."
            />
          )}
        </Panel>
        <Panel title="Check a buyer’s delivery history">
          <div className="panel-body">
            <p style={{ fontSize: 11 }}>
              Only delivery outcomes from parcels you sent are included.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void run(
                  async () =>
                    setHistory(
                      await api.get(
                        `/fraud-check?phone=${encodeURIComponent(phone)}`,
                      ),
                    ),
                  "Delivery history loaded.",
                );
              }}
            >
              <label className="field">
                <span>Recipient phone</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  minLength={7}
                  required
                  type="tel"
                />
              </label>
              <Button type="submit" style={{ marginTop: 15 }} disabled={busy}>
                Check history
              </Button>
            </form>
            {history && (
              <div style={{ marginTop: 20 }}>
                {Object.entries(history).map(([k, v]) => (
                  <KeyValue key={k} label={k} value={v} />
                ))}
              </div>
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}

"use client";

import {
  Empty,
  ErrorState,
  Loading,
  PageHeading,
  Pagination,
  Panel,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { date, money } from "@/lib/api";
import type { Paged } from "@/lib/types";
import { useState } from "react";

export function WalletScreen() {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useResource<{
    balance: string;
    transactions: Paged<{
      id: number;
      code: string | null;
      type: string;
      amount: string;
      balance_after: string;
      created_at: string;
      note: string;
    }>;
  }>(`/wallet?page=${page}`);
  return (
    <>
      <PageHeading
        eyebrow="THE NUMBERS THAT KEEP YOU MOVING"
        title="Your wallet"
        description="Every confirmed credit, with a clear record."
      />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : (
        data && (
          <>
            <section className="wallet-hero">
              <span>AVAILABLE WALLET BALANCE</span>
              <strong>{money(data.balance)}</strong>
              <p>
                Confirmed COD and commission credits. Every movement is recorded
                below.
              </p>
            </section>
            <Panel title="Wallet activity">
              {data.transactions.data.length ? (
                <>
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Activity</th>
                          <th>Parcel</th>
                          <th>Amount</th>
                          <th>Balance after</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.transactions.data.map((t) => (
                          <tr key={t.id}>
                            <td className="capitalize">
                              <strong>{t.type.replaceAll("_", " ")}</strong>
                              <small>{t.note}</small>
                            </td>
                            <td>{t.code ? `RFD${t.code}` : "—"}</td>
                            <td style={{ color: "var(--green)" }}>
                              {money(t.amount)}
                            </td>
                            <td>{money(t.balance_after)}</td>
                            <td>{date(t.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    page={data.transactions.current_page}
                    last={data.transactions.last_page}
                    onChange={setPage}
                  />
                </>
              ) : (
                <Empty
                  title="Good things add up."
                  description="Your confirmed delivery and commission credits will appear here."
                />
              )}
            </Panel>
          </>
        )
      )}
    </>
  );
}

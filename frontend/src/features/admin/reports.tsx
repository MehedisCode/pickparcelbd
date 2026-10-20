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
import { date, label } from "@/lib/api";
import type { Paged } from "@/lib/types";
import { useState } from "react";

export function ReportsScreen() {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useResource<
    Paged<{
      id: number;
      action: string;
      resource_type: string;
      resource_id: string;
      actor_name: string;
      reason: string | null;
      created_at: string;
    }>
  >(`/admin/logs?page=${page}`);
  return (
    <>
      <PageHeading
        eyebrow="THE RECORD BEHIND EVERY DECISION"
        title="District activity & reports"
        description="An attributable history of administrative and financial changes."
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
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Record</th>
                  <th>Reason</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((l) => (
                  <tr key={l.id}>
                    <td className="capitalize">
                      <strong>{label(l.action)}</strong>
                    </td>
                    <td>{l.actor_name}</td>
                    <td>
                      {l.resource_type} #{l.resource_id}
                    </td>
                    <td>{l.reason || "—"}</td>
                    <td>{date(l.created_at)}</td>
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
            title="Decisions, documented."
            description="Administrative activity will appear here as operations are completed."
          />
        </Panel>
      )}
    </>
  );
}

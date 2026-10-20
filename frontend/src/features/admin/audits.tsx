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
  Panel,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, date, label } from "@/lib/api";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";

type AuditsData = {
  runs: { id: number; type: string; summary: string; created_at: string }[];
  findings: {
    id: number;
    code: string | null;
    type: string;
    severity: string;
    details: string;
    status: string;
  }[];
};
export function AuditsScreen() {
  const { data, error, loading, reload } =
    useResource<AuditsData>("/admin/audits");
  const [resolve, setResolve] = useState<number>();
  return (
    <>
      <PageHeading
        eyebrow="A CLEAR PICTURE OF YOUR DISTRICT"
        title="Audits & reconciliation"
        description="Find discrepancies, review the evidence, and record the resolution."
      />
      <div className="detail-grid" style={{ marginBottom: 23 }}>
        <Panel title="Run a district scan">
          <Form
            fields={[
              {
                name: "type",
                label: "Scan type",
                required: true,
                options: [
                  { value: "financial", label: "Financial integrity" },
                  { value: "custody", label: "Parcel custody" },
                  { value: "returns", label: "Returns integrity" },
                  {
                    value: "member_accountability",
                    label: "Member accountability",
                  },
                  {
                    value: "production_readiness",
                    label: "Combined readiness scan",
                  },
                ],
              },
            ]}
            submit="Run scan"
            onSubmit={(d) => api.post("/admin/audits", d)}
          />
        </Panel>
        <div className="info-notice">
          <ShieldCheck size={20} />
          <p>
            Scans report findings without changing parcel or wallet records.
            Corrections use separate, audited recovery or finance operations.
          </p>
        </div>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : (
        data && (
          <>
            <Panel title="Findings">
              {data.findings.length ? (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Parcel</th>
                        <th>Finding</th>
                        <th>Severity</th>
                        <th>Status</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {data.findings.map((f) => (
                        <tr key={f.id}>
                          <td>{f.code ? `RFD${f.code}` : "District"}</td>
                          <td>
                            <strong className="capitalize">
                              {label(f.type)}
                            </strong>
                            <small>{f.details}</small>
                          </td>
                          <td>
                            <Badge value={f.severity} />
                          </td>
                          <td>
                            <Badge value={f.status} />
                          </td>
                          <td>
                            {f.status === "open" && (
                              <Button
                                tone="secondary"
                                onClick={() => setResolve(f.id)}
                              >
                                Record resolution
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty
                  title="A clean slate for your next scan."
                  description="Run a scan to check this district’s records."
                />
              )}
            </Panel>
            <div style={{ height: 23 }} />
            <Panel title="Audit run history">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Run</th>
                      <th>Type</th>
                      <th>Summary</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.runs.map((r) => (
                      <tr key={r.id}>
                        <td>#{r.id}</td>
                        <td className="capitalize">{label(r.type)}</td>
                        <td>{auditSummary(r.summary)}</td>
                        <td>{date(r.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </>
        )
      )}
      {resolve && (
        <Modal
          title="Record a finding resolution"
          onClose={() => setResolve(undefined)}
        >
          <Form
            fields={[
              {
                name: "reason",
                label: "How was this issue resolved?",
                type: "textarea",
                required: true,
              },
            ]}
            submit="Record resolution"
            onSubmit={async (d) => {
              await api.post(`/admin/findings/${resolve}/resolve`, d);
              setResolve(undefined);
            }}
          />
        </Modal>
      )}
    </>
  );
}
function auditSummary(value: string) {
  try {
    const x = JSON.parse(value);
    return `${x.parcels_checked || 0} parcels · ${x.findings || 0} findings · ${x.critical || 0} critical`;
  } catch {
    return value;
  }
}

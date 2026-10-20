"use client";

import { Empty, Form, PageHeading, Panel } from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, date } from "@/lib/api";
import type { Paged, User } from "@/lib/types";
import { ShieldCheck } from "lucide-react";

export function RecoveryScreen() {
  const { data } = useResource<{
    data: { id: number; code: string; created_at: string; note: string }[];
  }>("/admin/snapshots");
  const { data: members } = useResource<Paged<User>>("/admin/users?members=1");
  return (
    <>
      <PageHeading
        eyebrow="CAREFUL CORRECTIONS. CLEAR HISTORY."
        title="Recovery & safety snapshots"
        description="Every corrective action requires a reason and creates an audit record."
      />
      <div className="info-notice">
        <ShieldCheck size={21} />
        <p>
          These operations affect live business state in the configured
          environment. Review the parcel and use the smallest applicable
          correction. Financial history is not overwritten by custody recovery.
        </p>
      </div>
      <Panel title="A controlled correction">
        <Form
          fields={[
            {
              name: "code",
              label: "Parcel code",
              required: true,
              placeholder: "RFD670847",
            },
            {
              name: "action",
              label: "Recovery operation",
              required: true,
              options: [
                { value: "snapshot", label: "Create safety snapshot" },
                {
                  value: "restore-custody",
                  label: "Restore an eligible snapshot holder",
                },
                { value: "cancel-transfer", label: "Cancel pending handover" },
                { value: "reassign", label: "Reassign an unpicked parcel" },
                {
                  value: "controlled-transfer",
                  label: "Controlled custody handover",
                },
                {
                  value: "clear-closed-custody",
                  label: "Clear custody for a closed parcel",
                },
              ],
            },
            {
              name: "member_id",
              label: "Target member (for reassignment / controlled transfer)",
              options: (members?.data || []).map((m) => ({
                value: String(m.id),
                label: m.name,
              })),
            },
            {
              name: "snapshot_id",
              label: "Snapshot (for restore)",
              options: (data?.data || []).map((s) => ({
                value: String(s.id),
                label: `#${s.id} · RFD${s.code} · ${date(s.created_at)}`,
              })),
            },
            {
              name: "reason",
              label: "Reason and supporting details",
              required: true,
              type: "textarea",
            },
          ]}
          submit="Apply and record correction"
          onSubmit={(d) => api.post("/admin/recovery", d)}
        />
      </Panel>
      <div style={{ height: 23 }} />
      <FinancialRecoveryForm />
      <div style={{ height: 23 }} />
      <Panel title="Safety snapshot history">
        {data?.data.length ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Snapshot</th>
                  <th>Parcel</th>
                  <th>Reason</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((s) => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td>RFD{s.code}</td>
                    <td>{s.note}</td>
                    <td>{date(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="No snapshots yet."
            description="Create a snapshot before a corrective operation when appropriate."
          />
        )}
      </Panel>
    </>
  );
}
function FinancialRecoveryForm() {
  return (
    <Panel title="Recover from recorded financial evidence">
      <div className="panel-body">
        <p>
          These operations require an existing verified delivery, sender return
          receipt, or paid settlement record. Conflicting financial history is
          rejected for review.
        </p>
      </div>
      <Form
        fields={[
          { name: "code", label: "Parcel code", required: true },
          {
            name: "action",
            label: "Operation",
            required: true,
            options: [
              {
                value: "repair-member-credit",
                label: "Restore a missing credit from a paid member settlement",
              },
              {
                value: "reconcile-delivery",
                label: "Reconcile collection amount from verified delivery",
              },
              {
                value: "repair-return",
                label: "Restore return state from the sender’s receipt",
              },
              {
                value: "repair-return-request",
                label: "Restore pending return custody from a recorded request",
              },
            ],
          },
          {
            name: "public_id",
            label: "Member public ID (for settlement credit recovery)",
            placeholder: "PP1234567890",
          },
          {
            name: "reason",
            label: "Reason and supporting evidence",
            type: "textarea",
            required: true,
          },
        ]}
        submit="Review evidence and apply"
        onSubmit={(d) =>
          api.post(
            `/admin/finance/${encodeURIComponent(String(d.code))}/recovery/${d.action}`,
            { public_id: d.public_id, reason: d.reason },
          )
        }
      />
    </Panel>
  );
}

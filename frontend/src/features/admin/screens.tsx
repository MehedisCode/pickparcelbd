"use client";
import { useAction } from "@/components/providers";
import { Avatar } from "@/components/shell";
import {
  BackLink,
  Badge,
  Button,
  ConfirmAction,
  Empty,
  ErrorState,
  Form,
  KeyValue,
  Loading,
  Modal,
  PageHeading,
  Pagination,
  Panel,
  SearchInput,
  Tabs,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, date, label, money } from "@/lib/api";
import type { Paged, Parcel, Row, User } from "@/lib/types";
import { ArrowRight, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
export function AdminPeopleScreen({ members = false }: { members?: boolean }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<User>();
  const { data, error, loading, reload } = useResource<Paged<User>>(
    `/admin/users?members=${members ? 1 : 0}&search=${encodeURIComponent(search)}&page=${page}`,
  );
  return (
    <>
      <PageHeading
        eyebrow="YOUR DISTRICT COMMUNITY"
        title={
          members
            ? "The people who keep things moving."
            : "People, permissions & trust."
        }
        description="Manage district membership, roles, and account verification."
      />
      <div className="filter-row">
        <SearchInput
          value={search}
          onChange={(s) => {
            setSearch(s);
            setPage(1);
          }}
          placeholder="Search a name, phone, or public ID…"
        />
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
                  <th>Person</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Verification</th>
                  <th>Wallet</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.data.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="button-row">
                        <Avatar name={u.name} />
                        <div>
                          <strong>{u.name}</strong>
                          <small>{u.public_id}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {u.phone}
                      <small>
                        {u.upazila}, {u.district}
                      </small>
                    </td>
                    <td>
                      <Badge value={u.role} />
                    </td>
                    <td>
                      <Badge value={u.verified ? "verified" : "unverified"} />
                    </td>
                    <td>{money(u.wallet_balance)}</td>
                    <td>
                      <div className="button-row">
                        <Button tone="secondary" onClick={() => setEdit(u)}>
                          Manage
                        </Button>
                        <Link
                          className="text-link"
                          href={`/admin/riders-agents/${u.id}`}
                        >
                          Details <ArrowRight size={13} />
                        </Link>
                      </div>
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
            title="No people match this search."
            description="Try another name or public ID."
          />
        </Panel>
      )}
      {edit && (
        <Modal title={`Manage ${edit.name}`} onClose={() => setEdit(undefined)}>
          <Form
            initial={edit}
            fields={[
              {
                name: "role",
                label: "Account role",
                required: true,
                options: [
                  "customer",
                  "rider",
                  "union_agent",
                  "upazila_agent",
                  "district_agent",
                ].map((v) => ({ value: v, label: label(v) })),
              },
              { name: "verified", label: "Verified account", type: "checkbox" },
            ]}
            onSubmit={async (d) => {
              await api.patch(`/admin/users/${edit.id}`, d);
              setEdit(undefined);
            }}
          />
        </Modal>
      )}
    </>
  );
}
export function MemberReportScreen({ id }: { id: string }) {
  const { data, error, loading, reload } = useResource<{
    user: User;
    parcels: Parcel[];
    commissions: Row[];
    transactions: Row[];
  }>(`/admin/users/${id}/report`);
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;
  if (!data) return null;
  return (
    <>
      <BackLink href="/admin/riders-agents" label="Back to district members" />
      <PageHeading
        eyebrow={data.user.public_id}
        title={data.user.name}
        description={`${label(data.user.role)} · ${data.user.upazila}, ${data.user.district}`}
        action={
          <Badge value={data.user.verified ? "verified" : "unverified"} />
        }
      />
      <div className="stats-grid">
        {[
          { name: "Handled parcels", value: data.parcels.length },
          {
            name: "Delivered",
            value: data.parcels.filter((p) => p.status === "delivered").length,
          },
          {
            name: "Pending collections",
            value: money(
              data.parcels
                .filter(
                  (p) =>
                    p.status === "delivered" &&
                    p.collection_status === "pending",
                )
                .reduce((s, p) => s + Number(p.collected_amount), 0),
            ),
          },
          { name: "Wallet balance", value: money(data.user.wallet_balance) },
        ].map((s) => (
          <section className="stat-card" key={s.name}>
            <div className="stat-top">
              <span>{s.name}</span>
            </div>
            <strong>{s.value}</strong>
          </section>
        ))}
      </div>
      <Panel title="Parcel accountability">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Parcel</th>
                <th>Recipient</th>
                <th>Status</th>
                <th>Collection</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {data.parcels.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link
                      className="text-link"
                      href={`/dashboard/parcels/${p.code}`}
                    >
                      RFD{p.code}
                    </Link>
                  </td>
                  <td>{p.delivery_name}</td>
                  <td>
                    <Badge value={p.status} />
                  </td>
                  <td>{money(p.collected_amount)}</td>
                  <td>
                    <Badge value={p.collection_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data.parcels.length && (
          <Empty title="No parcels in this member’s current report." />
        )}
      </Panel>
      <div style={{ height: 20 }} />
      <Panel title="Commission allocations">
        <div className="panel-body">
          {data.commissions.length ? (
            data.commissions.map((c) => (
              <KeyValue
                key={String(c.id)}
                label={`Commission #${c.commission_id}`}
                value={`${money(c.amount)} · ${c.settled_at ? "settled" : "unpaid"}`}
              />
            ))
          ) : (
            <p>No calculated commissions yet.</p>
          )}
        </div>
      </Panel>
    </>
  );
}

type FinanceData = {
  beneficiaries: { id: number; name: string; public_id: string }[];
  pages: Record<string, number>;
  summary: Record<string, string>;
  collections: Parcel[];
  commissions: {
    id: number;
    parcel_id: number;
    code: string;
    delivery_charge: string;
    member_amount: string;
    company_amount: string;
    company_settled_at: string | null;
  }[];
  participants: {
    id: number;
    commission_id: number;
    user_id: number;
    name: string;
    amount: string;
    settled_at: string | null;
  }[];
  settlements: {
    id: number;
    reference: string;
    type: string;
    amount: string;
    created_at: string;
  }[];
  rules: {
    rider_percent: string;
    agent_percent: string;
    company_percent: string;
  } | null;
};
export function FinanceScreen() {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useResource<FinanceData>(
    `/admin/finance?page=${page}`,
  );
  const [tab, setTab] = useState("collections");
  const [modal, setModal] = useState<string>();
  const { run, busy } = useAction();
  return (
    <>
      <PageHeading
        eyebrow="CLEAR NUMBERS. CONFIDENT DECISIONS."
        title="District finance & settlements"
        description="Collections first. Confirmed credits. A record for every movement."
        action={
          <Button onClick={() => setModal("settlement")}>
            <Plus size={15} />
            Settle commissions
          </Button>
        }
      />
      {data && (
        <div className="stats-grid">
          {Object.entries(data.summary).map(([key, value]) => (
            <section className="stat-card" key={key}>
              <div className="stat-top">
                <span>{label(key)}</span>
              </div>
              <strong>{money(value)}</strong>
            </section>
          ))}
        </div>
      )}
      <Tabs
        active={tab}
        onChange={(value) => {
          setTab(value);
          setPage(1);
        }}
        items={[
          { id: "collections", label: "Delivery collections" },
          { id: "commissions", label: "Commission allocations" },
          { id: "settlements", label: "Settlement history" },
          { id: "rules", label: "Commission rules" },
        ]}
      />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : (
        data && (
          <>
            {tab === "collections" && (
              <Panel title="Delivery & return collections">
                {data.collections.length ? (
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Parcel</th>
                          <th>Delivery</th>
                          <th>Collection amount</th>
                          <th>Collection state</th>
                          <th>Next action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.collections.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <Link
                                className="text-link"
                                href={`/dashboard/parcels/${p.code}`}
                              >
                                RFD{p.code}
                              </Link>
                            </td>
                            <td>
                              <Badge value={p.status} />
                            </td>
                            <td>{money(p.collected_amount)}</td>
                            <td>
                              <Badge value={p.collection_status} />
                            </td>
                            <td>
                              <div className="button-row">
                                {p.status === "delivered" &&
                                  p.collection_status === "pending" && (
                                    <ConfirmAction
                                      title="Confirm collection received?"
                                      description={`Record that the company has received ${money(p.collected_amount)} for RFD${p.code}.`}
                                      onConfirm={() =>
                                        api.post(
                                          `/admin/finance/${p.code}/receive-collection`,
                                        )
                                      }
                                    >
                                      Receive collection
                                    </ConfirmAction>
                                  )}
                                {p.status === "delivered" &&
                                  p.collection_status === "received" && (
                                    <>
                                      <ConfirmAction
                                        title="Credit sender wallet?"
                                        description={`Credit the sender’s COD entitlement for RFD${p.code}. Existing credits cannot be repeated.`}
                                        onConfirm={() =>
                                          api.post(
                                            `/admin/finance/${p.code}/confirm-wallet`,
                                          )
                                        }
                                      >
                                        Confirm sender credit
                                      </ConfirmAction>
                                      <Button
                                        tone="secondary"
                                        disabled={busy}
                                        onClick={() =>
                                          void run(
                                            () =>
                                              api.post(
                                                `/admin/finance/${p.code}/calculate-commission`,
                                              ),
                                            "Commission calculated.",
                                          )
                                        }
                                      >
                                        Calculate commission
                                      </Button>
                                    </>
                                  )}
                                {p.status === "returned" &&
                                  p.collection_status !== "return_received" && (
                                    <ConfirmAction
                                      title="Confirm return collection?"
                                      description="Record the company’s confirmation of this completed return."
                                      onConfirm={() =>
                                        api.post(
                                          `/admin/finance/${p.code}/receive-return`,
                                        )
                                      }
                                    >
                                      Confirm return
                                    </ConfirmAction>
                                  )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty title="Collections will appear after delivery." />
                )}
              </Panel>
            )}
            {tab === "commissions" && (
              <Panel title="Calculated commission allocations">
                {data.commissions.length ? (
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Parcel</th>
                          <th>Delivery fee</th>
                          <th>Members’ pool</th>
                          <th>Company share</th>
                          <th>Member allocations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.commissions.map((c) => (
                          <tr key={c.id}>
                            <td>
                              <strong>RFD{c.code}</strong>
                            </td>
                            <td>{money(c.delivery_charge)}</td>
                            <td>{money(c.member_amount)}</td>
                            <td>
                              {money(c.company_amount)}
                              <small>
                                {c.company_settled_at ? "Settled" : "Unpaid"}
                              </small>
                            </td>
                            <td>
                              {data.participants
                                .filter(
                                  (p) =>
                                    Number(p.commission_id) === Number(c.id),
                                )
                                .map((p) => (
                                  <div key={p.id} style={{ marginBottom: 7 }}>
                                    {p.name} · {money(p.amount)}{" "}
                                    <Badge
                                      value={
                                        p.settled_at ? "settled" : "pending"
                                      }
                                    />
                                  </div>
                                ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty
                    title="No commissions calculated yet."
                    description="Receive delivery collections, then calculate the commission for each parcel."
                  />
                )}
              </Panel>
            )}
            {tab === "settlements" && (
              <Panel title="Confirmed settlement history">
                {data.settlements.length ? (
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Reference</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.settlements.map((s) => (
                          <tr key={s.id}>
                            <td>
                              <strong>{s.reference}</strong>
                            </td>
                            <td className="capitalize">{s.type}</td>
                            <td>{money(s.amount)}</td>
                            <td>{date(s.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty title="Every settlement will have a clear record." />
                )}
              </Panel>
            )}
            {tab === "rules" && (
              <div className="detail-grid">
                <DeliveryRatesForm />
                <Panel title="Delivery commission rule">
                  <Form
                    initial={
                      data.rules || {
                        rider_percent: 40,
                        agent_percent: 30,
                        company_percent: 30,
                      }
                    }
                    fields={[
                      {
                        name: "rider_percent",
                        label: "Rider percentage",
                        required: true,
                        type: "number",
                        min: 0,
                        max: 100,
                        step: "0.01",
                      },
                      {
                        name: "agent_percent",
                        label: "Agent percentage",
                        required: true,
                        type: "number",
                        min: 0,
                        max: 100,
                        step: "0.01",
                      },
                      {
                        name: "company_percent",
                        label: "Company percentage",
                        required: true,
                        type: "number",
                        min: 0,
                        max: 100,
                        step: "0.01",
                      },
                    ]}
                    onSubmit={(d) => api.put("/admin/commission-rules", d)}
                  />
                </Panel>
                <div className="info-notice">
                  <ShieldCheck size={20} />
                  <p>
                    Percentages must total 100%. The rider and agent pools are
                    combined and shared equally among unique eligible parcel
                    handlers. Historical calculated commissions retain their
                    recorded amounts.
                  </p>
                </div>
              </div>
            )}
          </>
        )
      )}
      {data && data.pages[tab] && (
        <Pagination page={page} last={data.pages[tab]} onChange={setPage} />
      )}
      {modal === "settlement" && (
        <Modal
          title="Settle unpaid commissions"
          onClose={() => setModal(undefined)}
        >
          <div className="panel-body">
            <p>
              All eligible unpaid items for the selected beneficiary are
              included. Member settlements credit the member wallet once per
              parcel.
            </p>
          </div>
          <Form
            fields={[
              {
                name: "type",
                label: "Settlement type",
                required: true,
                options: [
                  { value: "member", label: "Member commission" },
                  { value: "company", label: "Company share" },
                ],
              },
              {
                name: "user_id",
                label: "Member (required for member settlement)",
                options: (data?.beneficiaries || []).map((m) => ({
                  value: String(m.id),
                  label: `${m.name} · ${m.public_id}`,
                })),
              },
              { name: "note", label: "Settlement note", type: "textarea" },
            ]}
            submit="Confirm settlement"
            onSubmit={async (d) => {
              await api.post("/admin/settlements", {
                ...d,
                user_id: d.user_id ? Number(d.user_id) : null,
              });
              setModal(undefined);
            }}
          />
        </Modal>
      )}
    </>
  );
}

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

function DeliveryRatesForm() {
  const { data } = useResource<{
    rates: { base_charge: string; extra_per_100g: string };
  }>("/config");
  return data ? (
    <Panel title="Delivery rates (all districts)">
      <Form
        initial={data.rates}
        fields={[
          {
            name: "base_charge",
            label: "Up to 1 kg (৳)",
            type: "number",
            min: 0,
            step: "0.01",
            required: true,
          },
          {
            name: "extra_per_100g",
            label: "Each additional started 100 g (৳)",
            type: "number",
            min: 0,
            step: "0.01",
            required: true,
          },
        ]}
        onSubmit={(d) => api.patch("/admin/rates", d)}
      />
    </Panel>
  ) : (
    <Loading />
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

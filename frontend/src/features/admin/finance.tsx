"use client";

import { useAction } from "@/components/providers";
import {
  Badge,
  Button,
  ConfirmAction,
  Empty,
  ErrorState,
  Form,
  Loading,
  Modal,
  PageHeading,
  Pagination,
  Panel,
  Tabs,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, date, label, money } from "@/lib/api";
import type { Parcel } from "@/lib/types";
import { Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

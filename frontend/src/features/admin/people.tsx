"use client";

import { Avatar } from "@/components/shell";
import {
  BackLink,
  Badge,
  Button,
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
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, label, money } from "@/lib/api";
import type { Paged, Parcel, Row, User } from "@/lib/types";
import { ArrowRight } from "lucide-react";
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

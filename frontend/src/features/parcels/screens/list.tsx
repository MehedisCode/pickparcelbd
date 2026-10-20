"use client";

import { useI18n } from "@/components/providers";
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
  SearchInput,
  Tabs,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, date, label, money } from "@/lib/api";
import { translateStatus } from "@/lib/i18n";
import type { Paged, Parcel, User } from "@/lib/types";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const statuses = [
  "pending",
  "assigned",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "return_pending",
  "returned",
];
export function ParcelListScreen({
  mode = "customer",
  view,
}: {
  mode?: "customer" | "operations" | "admin";
  view?: string;
}) {
  const { t, locale } = useI18n();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const [status, setStatus] = useState("");
  const [bucket, setBucket] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [assign, setAssign] = useState(false);
  const router = useRouter();
  const query = new URLSearchParams({
    search,
    status,
    bucket,
    page: String(page),
  });
  if (mode === "customer") query.set("mine", "1");
  if (view) query.set("view", view);
  const { data, error, loading, reload } = useResource<Paged<Parcel>>(
    `/parcels?${query}`,
  );
  const { data: members } = useResource<{
    data: Pick<User, "id" | "name" | "role">[];
  }>(assign ? "/members" : null);
  const title =
    view === "custody"
      ? t("nav.operations.custody")
      : view === "assigned"
        ? t("nav.operations.requests")
        : mode === "admin"
          ? t("nav.admin.parcels")
          : mode === "operations"
            ? t("nav.operations.overview")
            : t("parcels.listTitle");
  return (
    <>
      <PageHeading
        eyebrow={
          mode === "operations"
            ? t("parcels.listEyebrowOps")
            : t("parcels.listEyebrowCustomer")
        }
        title={title}
        description={t("parcels.listDescription")}
        action={
          <Link href="/dashboard/parcels/new" className="button primary">
            <Plus size={15} />
            {t("parcels.bookParcel")}
          </Link>
        }
      />
      <Tabs
        active={status}
        onChange={(s) => {
          setStatus(s);
          setPage(1);
        }}
        items={[
          { id: "", label: t("parcels.tabs.all") },
          { id: "pending", label: t("parcels.tabs.pending") },
          { id: "in_transit", label: t("parcels.tabs.inTransit") },
          { id: "delivered", label: t("parcels.tabs.delivered") },
          { id: "returned", label: t("parcels.tabs.returned") },
        ]}
      />
      <div className="filter-row">
        {mode === "operations" && (
          <select
            aria-label="Filter custody list"
            value={bucket}
            onChange={(e) => {
              setBucket(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All lists</option>
            {["pickup", "custody", "delivery", "return_pending"].map((v) => (
              <option key={v} value={v}>
                {label(v)}
              </option>
            ))}
          </select>
        )}
        <SearchInput
          value={search}
          onChange={(s) => {
            setSearch(s);
            setPage(1);
          }}
          placeholder={t("parcels.searchPlaceholder")}
        />
        <select
          value={status}
          aria-label={t("parcels.filterStatusAria")}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t("parcels.allStatuses")}</option>
          {statuses.map((s) => (
            <option value={s} key={s}>
              {translateStatus(s, locale)}
            </option>
          ))}
        </select>
        {selected.length > 0 && (
          <>
            <Button tone="secondary" onClick={() => setAssign(true)}>
              {t("parcels.selectedAssign", { count: selected.length })}
            </Button>
            {mode !== "operations" && (
              <ConfirmAction
                title={t("parcels.cancelConfirmTitle")}
                description={t("parcels.cancelConfirmDesc")}
                onConfirm={async () => {
                  await api.post("/parcels/cancel-assignments", {
                    codes: selected,
                  });
                  setSelected([]);
                }}
              >
                {t("parcels.cancelSelected")}
              </ConfirmAction>
            )}
            {mode === "operations" && (
              <Button
                onClick={async () => {
                  router.push(
                    `/operations/transfers/new?codes=${selected.join(",")}`,
                  );
                }}
              >
                {t("parcels.createHandover")}
              </Button>
            )}
          </>
        )}
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
                  <th>
                    <input
                      type="checkbox"
                      aria-label="Select all parcels on this page"
                      checked={data.data.every((p) =>
                        selected.includes(p.code),
                      )}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked ? data.data.map((p) => p.code) : [],
                        )
                      }
                    />
                  </th>
                  <th>{t("parcels.colParcelDate")}</th>
                  <th>{t("parcels.colRecipient")}</th>
                  <th>{t("parcels.colDestination")}</th>
                  <th>{t("parcels.colStatus")}</th>
                  <th>{t("parcels.colChargeCod")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.data.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Select RFD${p.code}`}
                        checked={selected.includes(p.code)}
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? [...selected, p.code]
                              : selected.filter((c) => c !== p.code),
                          )
                        }
                      />
                    </td>
                    <td>
                      <Link href={`/dashboard/parcels/${p.code}`}>
                        <strong>RFD{p.code}</strong>
                        <small>{date(p.created_at)}</small>
                      </Link>
                    </td>
                    <td>
                      {p.delivery_name}
                      <small>{p.delivery_phone}</small>
                    </td>
                    <td>
                      {p.delivery_district || "Bangladesh"}
                      <small>{p.delivery_upazila}</small>
                    </td>
                    <td>
                      <Badge value={p.status} />
                    </td>
                    <td>
                      <strong>{money(p.delivery_charge)}</strong>
                      <small>
                        {p.cod_enabled
                          ? `COD ${money(p.cod_amount)}`
                          : "No COD"}
                      </small>
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/parcels/${p.code}`}
                        className="icon-button"
                        aria-label={`View RFD${p.code}`}
                      >
                        <ArrowRight size={16} />
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
            title={t("parcels.noParcelsTitle")}
            description={t("parcels.noParcelsDesc")}
            action={
              <Link href="/dashboard/parcels/new" className="button primary">
                {t("parcels.bookFirstParcel")} <Plus size={15} />
              </Link>
            }
          />
        </Panel>
      )}
      {assign && (
        <Modal title="Assign a pickup batch" onClose={() => setAssign(false)}>
          <Form
            fields={[
              {
                name: "member_id",
                label: "Rider or agent",
                required: true,
                options: (members?.data || []).map((u) => ({
                  value: String(u.id),
                  label: `${u.name} · ${label(u.role)}`,
                })),
              },
            ]}
            submit="Assign selected parcels"
            onSubmit={async (d) => {
              await api.post("/parcels/assign", {
                codes: selected,
                member_id: Number(d.member_id),
              });
              setSelected([]);
              setAssign(false);
            }}
          />
        </Modal>
      )}
    </>
  );
}

"use client";

import { useI18n, useSession } from "@/components/providers";
import { BackLink, Form, PageHeading, Panel } from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, money } from "@/lib/api";
import type { Parcel } from "@/lib/types";
import { Package, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function BookParcelScreen() {
  const { session } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  const { data } = useResource<{
    rates: { base_charge: string; extra_per_100g: string };
  }>("/config");
  return (
    <>
      <BackLink href="/dashboard/parcels" label={t("parcels.backToList")} />
      <PageHeading
        eyebrow={t("parcels.newEyebrow")}
        title={t("parcels.newTitle")}
        description={t("parcels.newDescription")}
      />
      <div className="detail-grid">
        <Panel title={t("parcels.formTitle")}>
          <Form
            initial={{
              pickup_address: session?.user?.address || "",
              weight_grams: 1000,
              cod_enabled: false,
            }}
            submit={t("parcels.submitBook")}
            fields={[
              {
                name: "delivery_name",
                label: t("parcels.recipientName"),
                required: true,
                placeholder: t("parcels.recipientNamePlaceholder"),
              },
              {
                name: "delivery_phone",
                label: t("parcels.recipientPhone"),
                required: true,
                type: "tel",
                placeholder: "01XXXXXXXXX",
              },
              {
                name: "delivery_address",
                label: t("parcels.recipientAddress"),
                required: true,
                type: "textarea",
                placeholder: t("parcels.recipientAddressPlaceholder"),
              },
              {
                name: "delivery_district",
                label: t("parcels.district"),
                placeholder: t("parcels.districtPlaceholder"),
              },
              {
                name: "delivery_upazila",
                label: t("parcels.upazila"),
                placeholder: t("parcels.upazilaPlaceholder"),
              },
              {
                name: "pickup_address",
                label: t("parcels.pickupAddress"),
                required: true,
                type: "textarea",
              },
              {
                name: "weight_grams",
                label: t("parcels.weightGrams"),
                type: "number",
                required: true,
                min: 1,
                max: 1000000,
                help: t("parcels.weightHelp"),
              },
              {
                name: "cod_enabled",
                label: t("parcels.codEnabled"),
                type: "checkbox",
              },
              {
                name: "cod_amount",
                label: t("parcels.codAmount"),
                type: "number",
                min: 0.01,
                step: "0.01",
                help: t("parcels.codHelp"),
              },
              {
                name: "note",
                label: t("parcels.note"),
                type: "textarea",
              },
              {
                name: "terms_accepted",
                label: t("parcels.termsAccepted"),
                type: "checkbox",
                required: true,
              },
            ]}
            onSubmit={async (d) => {
              const out = await api.post<{ parcel: Parcel }>("/parcels", {
                ...d,
                weight_grams: Number(d.weight_grams),
                cod_amount: d.cod_enabled ? d.cod_amount : null,
              });
              router.push(`/dashboard/parcels/${out.parcel.code}`);
            }}
          />
          <div className="panel-body">
            <Link href="/terms" target="_blank" className="text-link">
              {t("parcels.readTerms")}
            </Link>
          </div>
        </Panel>
        <div>
          <Panel title={t("parcels.ratePanelTitle")}>
            <div className="panel-body">
              <div className="key-value">
                <span>{t("parcels.rateBase")}</span>
                <strong>{money(data?.rates.base_charge || 60)}</strong>
              </div>
              <div className="key-value">
                <span>{t("parcels.rateExtra")}</span>
                <strong>{money(data?.rates.extra_per_100g || 3)}</strong>
              </div>
              <p style={{ fontSize: 11, marginTop: 18 }}>
                {t("parcels.rateExplanation")}
              </p>
              <div className="info-notice">
                <ShieldCheck size={18} />
                <p>{t("parcels.otpNotice")}</p>
              </div>
              <div className="info-notice">
                <Package size={18} />
                <p>{t("parcels.packingNotice")}</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

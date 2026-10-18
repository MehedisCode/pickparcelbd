"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Printer } from "lucide-react";
import QRCode from "qrcode";
import { useResource } from "@/hooks/use-resource";
import { money } from "@/lib/api";
import type { Parcel } from "@/lib/types";
import { BackLink, Button, ErrorState, Loading } from "@/components/ui";
export function ParcelLabel({ code }: { code: string }) {
  const { data, error, loading, reload } = useResource<{ parcel: Parcel }>(
    `/parcels/${code}`,
  );
  const [qr, setQr] = useState<string>();
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(
      `${window.location.origin}/tracking?code=${encodeURIComponent(code)}`,
      { width: 180, margin: 1 },
    ).then((value) => {
      if (active) setQr(value);
    });
    return () => {
      active = false;
    };
  }, [code]);
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;
  if (!data) return null;
  const p = data.parcel;
  return (
    <>
      <BackLink href={`/dashboard/parcels/${code}`} label="Back to parcel" />
      <div className="button-row" style={{ marginBottom: 20 }}>
        <Button onClick={() => window.print()}>
          <Printer size={16} />
          Print shipping label
        </Button>
      </div>
      <article className="shipping-label">
        <header>
          <strong>PickParcelBD</strong>
          <h1>RFD{p.code}</h1>
        </header>
        {qr && (
          <Image
            src={qr}
            alt={`Public tracking QR for RFD${p.code}`}
            width={140}
            height={140}
            unoptimized
          />
        )}
        <section>
          <small>FROM / প্রেরক</small>
          <h3>{p.pickup_name}</h3>
          <p>
            {p.pickup_phone}
            <br />
            {p.pickup_address}
            <br />
            {p.pickup_upazila}, {p.pickup_district}
          </p>
        </section>
        <section>
          <small>TO / প্রাপক</small>
          <h3>{p.delivery_name}</h3>
          <p>
            {p.delivery_phone}
            <br />
            {p.delivery_address}
            <br />
            {p.delivery_upazila} {p.delivery_district}
          </p>
        </section>
        <section>
          <p>Weight: {Number(p.weight_grams) / 1000} kg</p>
          <p>
            Delivery: {money(p.delivery_charge)} · COD:{" "}
            {p.cod_enabled ? money(p.cod_amount) : "Prepaid"}
          </p>
          <h3>Total collection: {money(p.total_collection)}</h3>
        </section>
        <small>
          Scan the QR to track this parcel. Verification codes are shared
          separately.
        </small>
      </article>
    </>
  );
}

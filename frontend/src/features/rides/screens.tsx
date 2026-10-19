"use client";
import { useAction, useI18n, useSession, useToast } from "@/components/providers";
import {
  Badge,
  Button,
  Empty,
  ErrorState,
  Form,
  Loading,
  PageHeading,
  Panel,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, date } from "@/lib/api";
import { Bike, CheckCircle2, MapPin, Navigation } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
type Ride = {
  id: number;
  pickup: string;
  destination: string;
  status: string;
  driver_id: number | null;
  passenger_id: number;
  driver_name: string | null;
  driver_phone: string | null;
  created_at: string;
};
type RideData = {
  data: Ride[];
  driver_state: {
    available: boolean;
    latitude: string;
    longitude: string;
    location_updated_at: string;
  } | null;
  online_count: number;
};
type RideRequest = {
  id: number;
  pickup: string;
  destination: string;
  passenger_name: string;
  distance_km: number;
  created_at: string;
};
export function RideScreen({ driver = false }: { driver?: boolean }) {
  const { session } = useSession();
  const { t, locale } = useI18n();
  const { data, error, loading, reload } = useResource<RideData>(
    "/rides",
    15000,
  );
  const { data: requests } = useResource<{ data: RideRequest[] }>(
    driver ? "/rides/requests" : null,
    15000,
  );
  const [gps, setGps] = useState<{ latitude: number; longitude: number }>();
  const { run, busy } = useAction();
  const toast = useToast();
  async function locate() {
    if (!navigator.geolocation) {
      toast(
        locale === "bn"
          ? "এই ব্রাউজারে জিপিএস সুবিধা সমর্থিত নয়।"
          : "This browser does not support GPS.",
        "error",
      );
      return;
    }
    await run(
      () =>
        new Promise<void>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(
            async (p) => {
              try {
                const coords = {
                  latitude: p.coords.latitude,
                  longitude: p.coords.longitude,
                };
                await api.post("/account/location", {
                  ...coords,
                  location_accuracy: p.coords.accuracy,
                });
                setGps(coords);
                resolve();
              } catch (e) {
                reject(e);
              }
            },
            () =>
              reject(
                new Error(
                  locale === "bn"
                    ? "লোকেশন পাওয়া যায়নি। জিপিএস চালু করে পুনরায় চেষ্টা করুন।"
                    : "Location access was unavailable. Turn on GPS and allow location access, then try again.",
                ),
              ),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 },
          ),
        ),
      locale === "bn" ? "জিপিএস লোকেশন আপডেট করা হয়েছে।" : "GPS location updated.",
    );
  }
  return (
    <>
      <PageHeading
        eyebrow={t("rides.eyebrow")}
        title={t("rides.title")}
        description={t("rides.subtitle")}
        action={
          <Button
            tone="secondary"
            disabled={busy}
            onClick={() => void locate()}
          >
            <Navigation size={15} />
            {gps
              ? locale === "bn"
                ? "জিপিএস আপডেট"
                : "Update GPS"
              : locale === "bn"
                ? "আমার অবস্থান দিন"
                : "Set my location"}
          </Button>
        }
      />
      <div className="tabs">
        <Link
          className={`button ghost ${!driver ? "active" : ""}`}
          href="/ride-share"
        >
          {t("rides.passengerMode")}
        </Link>
        <Link
          className={`button ghost ${driver ? "active" : ""}`}
          href="/ride-share/driver"
        >
          {t("rides.driverMode")}
        </Link>
      </div>
      <div className="info-notice">
        <MapPin size={19} />
        <p>
          {locale === "bn"
            ? `${data?.online_count ?? 0} জন রাইডার অনলাইনে সক্রিয় আছেন। নিকটবর্তী রাইড অনুরোধ মেলাতে জিপিএস ব্যবহার করা হয়।`
            : `${data?.online_count ?? 0} drivers recently online. GPS is used to match nearby requests.`}
        </p>
      </div>
      {error ? (
        <ErrorState message={error} retry={reload} />
      ) : loading ? (
        <Loading />
      ) : (
        <div className="detail-grid">
          <div>
            {driver ? (
              <Panel
                title={
                  locale === "bn"
                    ? "নিকটবর্তী রাইডের অনুরোধ"
                    : "Nearby requests"
                }
              >
                <div className="panel-body">
                  <div className="button-row">
                    <Button
                      disabled={busy}
                      tone={
                        data?.driver_state?.available ? "secondary" : "primary"
                      }
                      onClick={() =>
                        void run(
                          () =>
                            api.post("/rides/availability", {
                              available: !data?.driver_state?.available,
                            }),
                          locale === "bn"
                            ? "রাইডার স্ট্যাটাস আপডেট হয়েছে।"
                            : "Driver availability updated.",
                        )
                      }
                    >
                      {data?.driver_state?.available
                        ? locale === "bn"
                          ? "অফলাইন যান"
                          : "Go offline"
                        : locale === "bn"
                          ? "রাইডের জন্য প্রস্তুত"
                          : "I’m available for rides"}
                    </Button>
                    <Badge
                      value={
                        data?.driver_state?.available
                          ? locale === "bn"
                            ? "সক্রিয়"
                            : "available"
                          : locale === "bn"
                            ? "অফলাইন"
                            : "offline"
                      }
                    />
                  </div>
                  <p style={{ fontSize: 11, marginTop: 15, marginBottom: 0 }}>
                    {locale === "bn"
                      ? "প্রথমে জিপিএস আপডেট করুন। শুধুমাত্র নির্ধারিত দূরত্বের অনুরোধগুলো এখানে প্রদর্শিত হয়।"
                      : "Update your GPS first. Only requests within the matching radius are shown."}
                  </p>
                </div>
                {requests?.data.length ? (
                  requests.data.map((r) => (
                    <article className="ride-card" key={r.id}>
                      <Badge
                        value={
                          locale === "bn"
                            ? `${r.distance_km} কিমি দূরে`
                            : `${r.distance_km} km away`
                        }
                      />
                      <h3>
                        {r.pickup} → {r.destination}
                      </h3>
                      <p>
                        {r.passenger_name} · {date(r.created_at)}
                      </p>
                      <Button
                        disabled={busy}
                        onClick={() =>
                          void run(
                            () => api.post(`/rides/${r.id}/accept`),
                            locale === "bn"
                              ? "রাইড গ্রহণ করা হয়েছে।"
                              : "Ride accepted.",
                          )
                        }
                      >
                        {locale === "bn" ? "রাইড গ্রহণ করুন" : "Accept ride"}{" "}
                        <Bike size={15} />
                      </Button>
                    </article>
                  ))
                ) : (
                  <Empty
                    title={
                      locale === "bn"
                        ? "বর্তমানে কোনো অনুরোধ নেই"
                        : "A quiet moment on the road."
                    }
                    description={
                      locale === "bn"
                        ? "নিকটবর্তী অনুরোধ দেখতে ফ্রেশ জিপিএস লোকেশন নিয়ে অনলাইনে যান।"
                        : "Go online with a fresh GPS location to see nearby requests."}
                  />
                )}
              </Panel>
            ) : (
              <Panel
                title={
                  locale === "bn" ? "কোথায় যেতে চান?" : "Where are we headed?"
                }
              >
                <Form
                  fields={[
                    {
                      name: "pickup",
                      label: t("rides.pickupLabel"),
                      required: true,
                      placeholder:
                        locale === "bn"
                          ? "পরিচিত স্থান বা ঠিকানা"
                          : "A familiar landmark or address",
                    },
                    {
                      name: "destination",
                      label: t("rides.destinationLabel"),
                      required: true,
                      placeholder:
                        locale === "bn"
                          ? "আপনি কোথায় যেতে চান?"
                          : "Where would you like to go?",
                    },
                  ]}
                  submit={t("rides.requestBtn")}
                  onSubmit={async (d) => {
                    if (!gps)
                      throw new Error(
                        locale === "bn"
                          ? "অনুরোধ পাঠানোর আগে জিপিএস লোকেশন দিন।"
                          : "Set your GPS location before requesting a ride.",
                      );
                    return api.post("/rides", { ...d, ...gps });
                  }}
                />
                <div className="panel-body" style={{ paddingTop: 0 }}>
                  <small className="muted">
                    {gps
                      ? locale === "bn"
                        ? "আপনার জিপিএস প্রস্তুত। পুনরায় সাবমিট করলে বিদ্যমান অনুরোধ আপডেট হবে।"
                        : "Your GPS is ready. An existing active request is updated when you submit again."
                      : locale === "bn"
                        ? "অনুরোধ পাঠানোর পূর্বে “আমার অবস্থান দিন” নির্বাচন করুন।"
                        : "Choose “Set my location” before sending a request."}
                  </small>
                </div>
              </Panel>
            )}
          </div>
          <Panel
            title={
              driver
                ? locale === "bn"
                  ? "আপনার গৃহীত রাইড ও হিস্টোরি"
                  : "Your accepted rides & history"
                : locale === "bn"
                  ? "আপনার রাইডের অনুরোধ ও হিস্টোরি"
                  : "Your requests & history"
            }
          >
            {data?.data.length ? (
              data.data
                .filter((r) =>
                  driver
                    ? Number(r.driver_id) === session?.user?.id
                    : Number(r.passenger_id) === session?.user?.id,
                )
                .map((r) => (
                  <article className="ride-card" key={r.id}>
                    <Badge value={r.status} />
                    <h3>
                      {r.pickup} → {r.destination}
                    </h3>
                    <p>
                      {locale === "bn" ? "রাইড #" : "Ride #"}{r.id} · {date(r.created_at)}
                    </p>
                    {r.status === "accepted" && r.driver_name && (
                      <p>
                        {r.driver_name}
                        {r.driver_phone && (
                          <>
                            {" "}
                            ·{" "}
                            <a
                              className="text-link"
                              href={`tel:${r.driver_phone}`}
                            >
                              {r.driver_phone}
                            </a>
                          </>
                        )}
                      </p>
                    )}
                    {["searching", "accepted"].includes(r.status) && (
                      <div className="button-row">
                        <Button
                          tone="secondary"
                          disabled={busy}
                          onClick={() =>
                            void run(
                              () => api.post(`/rides/${r.id}/cancel`),
                              locale === "bn"
                                ? "রাইড বাতিল করা হয়েছে।"
                                : "Ride cancelled.",
                            )
                          }
                        >
                          {locale === "bn" ? "রাইড বাতিল করুন" : "Cancel ride"}
                        </Button>
                        {driver && r.status === "accepted" && (
                          <Button
                            disabled={busy}
                            onClick={() =>
                              void run(
                                () => api.post(`/rides/${r.id}/complete`),
                                locale === "bn"
                                  ? "রাইড সম্পন্ন হয়েছে।"
                                  : "Ride completed.",
                              )
                            }
                          >
                            <CheckCircle2 size={15} />
                            {locale === "bn"
                              ? "সম্পন্ন চিহ্নিত করুন"
                              : "Mark completed"}
                          </Button>
                        )}
                      </div>
                    )}
                  </article>
                ))
            ) : (
              <Empty
                title={
                  locale === "bn"
                    ? "কোনো রাইড তথ্য পাওয়া যায়নি"
                    : "New places, new possibilities."
                }
                description={
                  locale === "bn"
                    ? "আপনার রাইডের যাবতীয় ইতিহাস এখানে দেখা যাবে।"
                    : "Your ride history will appear here."}
              />
            )}
          </Panel>
        </div>
      )}
    </>
  );
}

"use client";
import { useAction, useSession, useToast } from "@/components/providers";
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
      toast("This browser does not support GPS.", "error");
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
                  "Location access was unavailable. Turn on GPS and allow location access, then try again.",
                ),
              ),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 },
          ),
        ),
      "GPS location updated.",
    );
  }
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE CLOSER TO WHERE YOU’RE GOING"
        title={driver ? "Your next ride is nearby." : "Let’s get you there."}
        description="Connect with an available driver within 3 km of your pickup."
        action={
          <Button
            tone="secondary"
            disabled={busy}
            onClick={() => void locate()}
          >
            <Navigation size={15} />
            {gps ? "Update GPS" : "Set my location"}
          </Button>
        }
      />
      <div className="tabs">
        <Link
          className={`button ghost ${!driver ? "active" : ""}`}
          href="/ride-share"
        >
          Find a ride
        </Link>
        <Link
          className={`button ghost ${driver ? "active" : ""}`}
          href="/ride-share/driver"
        >
          I’m a driver
        </Link>
      </div>
      <div className="info-notice">
        <MapPin size={19} />
        <p>
          {data?.online_count ?? 0} drivers recently online. GPS is used to
          match nearby requests. This service does not calculate a fare or take
          ride payments.
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
              <Panel title="Nearby requests">
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
                          "Driver availability updated.",
                        )
                      }
                    >
                      {data?.driver_state?.available
                        ? "Go offline"
                        : "I’m available for rides"}
                    </Button>
                    <Badge
                      value={
                        data?.driver_state?.available ? "available" : "offline"
                      }
                    />
                  </div>
                  <p style={{ fontSize: 11, marginTop: 15, marginBottom: 0 }}>
                    Update your GPS first. Only requests within the matching
                    radius are shown.
                  </p>
                </div>
                {requests?.data.length ? (
                  requests.data.map((r) => (
                    <article className="ride-card" key={r.id}>
                      <Badge value={`${r.distance_km} km away`} />
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
                            "Ride accepted.",
                          )
                        }
                      >
                        Accept ride <Bike size={15} />
                      </Button>
                    </article>
                  ))
                ) : (
                  <Empty
                    title="A quiet moment on the road."
                    description="Go online with a fresh GPS location to see nearby requests."
                  />
                )}
              </Panel>
            ) : (
              <Panel title="Where are we headed?">
                <Form
                  fields={[
                    {
                      name: "pickup",
                      label: "Pickup location",
                      required: true,
                      placeholder: "A familiar landmark or address",
                    },
                    {
                      name: "destination",
                      label: "Destination",
                      required: true,
                      placeholder: "Where would you like to go?",
                    },
                  ]}
                  submit="Find a nearby driver"
                  onSubmit={async (d) => {
                    if (!gps)
                      throw new Error(
                        "Set your GPS location before requesting a ride.",
                      );
                    return api.post("/rides", { ...d, ...gps });
                  }}
                />
                <div className="panel-body" style={{ paddingTop: 0 }}>
                  <small className="muted">
                    {gps
                      ? "Your GPS is ready. An existing active request is updated when you submit again."
                      : "Choose “Set my location” before sending a request."}
                  </small>
                </div>
              </Panel>
            )}
          </div>
          <Panel
            title={
              driver
                ? "Your accepted rides & history"
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
                      Ride #{r.id} · {date(r.created_at)}
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
                              "Ride cancelled.",
                            )
                          }
                        >
                          Cancel ride
                        </Button>
                        {driver && r.status === "accepted" && (
                          <Button
                            disabled={busy}
                            onClick={() =>
                              void run(
                                () => api.post(`/rides/${r.id}/complete`),
                                "Ride completed.",
                              )
                            }
                          >
                            <CheckCircle2 size={15} />
                            Mark completed
                          </Button>
                        )}
                      </div>
                    )}
                  </article>
                ))
            ) : (
              <Empty
                title="New places, new possibilities."
                description="Your ride history will appear here."
              />
            )}
          </Panel>
        </div>
      )}
    </>
  );
}

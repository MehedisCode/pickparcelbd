"use client";
import { useState } from "react";
import { MapPin } from "lucide-react";
import locations from "@/data/locations.json";
import { Form, Button } from "@/components/ui";
import { useAction, useI18n } from "@/components/providers";
import { api } from "@/lib/api";
import { useResource } from "@/hooks/use-resource";
import type { User } from "@/lib/types";
export function ProfileForm({
  user,
  complete,
  onSaved,
}: {
  user: User;
  complete: boolean;
  onSaved: () => Promise<void>;
}) {
  const { locale } = useI18n();
  const { data: configuration } = useResource<{ geocoding_available: boolean }>(
    "/config",
  );
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    user.latitude !== null && user.longitude !== null
      ? { latitude: user.latitude, longitude: user.longitude }
      : null,
  );
  const [suggestion, setSuggestion] = useState<{
    display_name: string;
    attribution: string;
    attribution_url: string;
  }>();
  const [district, setDistrict] = useState(user.district || "");
  const { run, busy } = useAction();
  const districts = locations.map((d) => d.bn_name);
  if (user.district && !districts.includes(user.district))
    districts.unshift(user.district);
  const area = locations.find(
    (d) => d.bn_name === district || d.name === district,
  );
  const upazilas = [...(area?.upazilas || [])];
  if (
    district === user.district &&
    user.upazila &&
    !upazilas.includes(user.upazila)
  )
    upazilas.unshift(user.upazila);
  return (
    <>
      <Form
        initial={{
          ...user,
          upazila: district === user.district ? user.upazila : "",
        }}
        submit={
          complete
            ? locale === "bn"
              ? "প্রোফাইল সম্পূর্ণ করুন"
              : "Complete my profile"
            : locale === "bn"
              ? "প্রোফাইল সংরক্ষণ করুন"
              : "Save profile"
        }
        onValueChange={(name, value) => {
          if (name === "district") setDistrict(value);
        }}
        fields={[
          {
            name: "name",
            label: locale === "bn" ? "আপনার পূর্ণ নাম" : "Your name",
            required: true,
          },
          {
            name: "phone",
            label:
              locale === "bn"
                ? "যোগাযোগের ফোন নম্বর (গোপনীয়)"
                : "Private contact phone",
            type: "tel",
            required: true,
            help:
              locale === "bn"
                ? "ডেলিভারি সমন্বয়ের জন্য শুধুমাত্র অনুমোদিত রাইডার/এজেন্ট দেখতে পাবেন।"
                : "Available to authorized delivery participants.",
          },
          {
            name: "address",
            label: locale === "bn" ? "পূর্ণ ঠিকানা" : "Full address",
            type: "textarea",
            required: true,
          },
          {
            name: "district",
            label: locale === "bn" ? "জেলা" : "জেলা / District",
            required: true,
            options: districts.map((v) => ({ value: v, label: v })),
          },
          {
            name: "upazila",
            label: locale === "bn" ? "উপজেলা / থানা" : "উপজেলা / Upazila",
            required: true,
            refreshKey: district,
            options: upazilas.map((v) => ({ value: v, label: v })),
          },
          {
            name: "public_phone",
            label:
              locale === "bn"
                ? "বিকল্প পাবলিক ফোন (ঐচ্ছিক)"
                : "Alternative public phone",
            type: "tel",
          },
          {
            name: "phone_public",
            label:
              locale === "bn"
                ? "আমার পাবলিক প্রোফাইলে ফোন নম্বর প্রদর্শন করুন"
                : "Show my contact phone on my public profile",
            type: "checkbox",
          },
        ]}
        onSubmit={async (d) => {
          await api.patch("/account", d);
          await onSaved();
        }}
      />
      <div className="panel-body">
        <Button
          tone="secondary"
          disabled={busy}
          onClick={() =>
            void run(async () => {
              if (!navigator.geolocation)
                throw new Error(
                  locale === "bn"
                    ? "এই ব্রাউজারে জিপিএস সুবিধা নেই।"
                    : "GPS is unavailable in this browser.",
                );
              const position = await new Promise<GeolocationPosition>(
                (resolve, reject) =>
                  navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 60000,
                  }),
              );
              setCoordinates({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
              await api.post("/account/location", {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                location_accuracy: position.coords.accuracy,
              });
            }, locale === "bn" ? "জিপিএস অবস্থান আপডেট সম্পন্ন।" : "GPS location updated.")
          }
        >
          <MapPin size={16} />
          {locale === "bn" ? "আমার জিপিএস অবস্থান আপডেট করুন" : "Update my GPS location"}
        </Button>
        <p className="muted" style={{ fontSize: 11 }}>
          {locale === "bn"
            ? "আপনার ব্রাউজার অনুমতি চাইলে 'Allow' নির্বাচন করুন। উপরে আপনার জেলা ও ঠিকানা নিশ্চিত করুন।"
            : "Your browser asks before sharing your location. Confirm your district and address above; GPS does not overwrite them."}
        </p>
        {configuration?.geocoding_available && coordinates && (
          <>
            <p className="muted" style={{ fontSize: 11 }}>
              Address lookup sends these coordinates to OpenStreetMap’s
              Nominatim service when you choose the button below.
            </p>
            <Button
              tone="secondary"
              disabled={busy}
              onClick={() =>
                void run(
                  async () =>
                    setSuggestion(
                      await api.post("/account/reverse-geocode", {
                        ...coordinates,
                        consent: true,
                      }),
                    ),
                  "Address suggestion loaded.",
                )
              }
            >
              Suggest address with OpenStreetMap
            </Button>
          </>
        )}
        {suggestion && (
          <div className="info-notice">
            <div>
              <p>{suggestion.display_name}</p>
              <a
                href={suggestion.attribution_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {suggestion.attribution}
              </a>
              <p>
                Review this suggestion and copy the address into your profile.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

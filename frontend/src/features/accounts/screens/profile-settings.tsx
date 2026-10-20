"use client";

import { useSession } from "@/components/providers";
import { Avatar } from "@/components/shell";
import {
  Badge,
  Empty,
  KeyValue,
  Loading,
  PageHeading,
  Panel,
} from "@/components/ui";
import { accountHome, safeReturnPath } from "@/lib/auth-navigation";
import { ProfileForm } from "../profile-form";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function ProfileSettingsScreen({
  complete = false,
}: {
  complete?: boolean;
}) {
  const { session, reload } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const target = safeReturnPath(
    params.get("return"),
    accountHome(session?.user),
  );
  const u = session?.user;
  if (!session) return <Loading />;
  if (!u)
    return (
      <Empty
        title="Sign in to continue"
        action={
          <Link
            href={`/login?return=${encodeURIComponent(target)}`}
            className="button primary"
          >
            Sign in
          </Link>
        }
      />
    );
  return (
    <>
      <PageHeading
        eyebrow="YOUR BUSINESS STARTS WITH YOU"
        title={complete ? "Let’s get to know you." : "Make yourself at home."}
        description={
          complete
            ? "Add your delivery details so your orders and parcels reach the right place."
            : "Your profile, contact details, and privacy preferences."
        }
      />
      <div className="detail-grid">
        <Panel title="Profile & delivery details">
          <ProfileForm
            user={u}
            complete={complete}
            onSaved={async () => {
              await reload();
              if (complete) router.replace(target);
            }}
          />
        </Panel>
        <div>
          <Panel title="Your connected identity">
            <div className="panel-body">
              <div className="button-row" style={{ marginBottom: 20 }}>
                <Avatar name={u.name} size="large" />
                <div>
                  <h3 style={{ margin: "0 0 7px" }}>{u.name}</h3>
                  <Badge value={u.verified ? "verified" : u.role} />
                </div>
              </div>
              <KeyValue label="Public ID" value={u.public_id} />
              <KeyValue label="Email" value={u.email} />
              <Link
                className="text-link"
                style={{ marginTop: 20 }}
                href={`/sellers/${u.public_id}`}
              >
                Open public profile <ArrowRight size={13} />
              </Link>
            </div>
          </Panel>
          <div className="info-notice" style={{ marginTop: 20 }}>
            <ShieldCheck size={20} />
            <p>
              Your private phone and address are shared only where needed for
              your orders and delivery operations.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

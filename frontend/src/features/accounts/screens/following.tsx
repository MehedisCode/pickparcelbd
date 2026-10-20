"use client";

import { Avatar } from "@/components/shell";
import {
  Empty,
  ErrorState,
  Loading,
  PageHeading,
  Panel,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import type { User } from "@/lib/types";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function FollowingScreen() {
  const { data, error, loading, reload } = useResource<{
    data: Pick<User, "id" | "name" | "public_id" | "district" | "verified">[];
  }>("/following");
  return (
    <>
      <PageHeading
        eyebrow="A COMMUNITY WORTH FOLLOWING"
        title="Your favorite people & shops"
        description="Keep the businesses you love a little closer."
      />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : (
        <Panel>
          {data?.data.length ? (
            data.data.map((u) => (
              <div className="person-card" key={u.id}>
                <Avatar name={u.name} />
                <div>
                  <h3>
                    {u.name}{" "}
                    {u.verified && (
                      <ShieldCheck size={12} color="var(--green)" />
                    )}
                  </h3>
                  <p>
                    {u.district} · {u.public_id}
                  </p>
                </div>
                <Link
                  href={`/sellers/${u.public_id}`}
                  className="button secondary"
                >
                  Visit shop <ArrowRight size={13} />
                </Link>
              </div>
            ))
          ) : (
            <Empty
              title="Find your people."
              description="Follow sellers and profiles to keep your favorite businesses close."
              action={
                <Link href="/products" className="button primary">
                  Explore marketplace
                </Link>
              }
            />
          )}
        </Panel>
      )}
    </>
  );
}

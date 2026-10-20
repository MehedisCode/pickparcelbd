"use client";

import { useAction } from "@/components/providers";
import {
  Button,
  Empty,
  ErrorState,
  Loading,
  PageHeading,
  Pagination,
  Panel,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, date } from "@/lib/api";
import type { Paged } from "@/lib/types";
import { ArrowRight, Bell, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Notification = {
  id: number;
  title: string;
  body: string;
  url: string | null;
  read_at: string | null;
  created_at: string;
};
export function NotificationsScreen() {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useResource<Paged<Notification>>(
    `/notifications?page=${page}`,
    10000,
  );
  const { run, busy } = useAction();
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE UPDATE FOR YOU"
        title="You’re in the loop."
        description="Every order, parcel, and conversation update in one place."
        action={
          <Button
            tone="secondary"
            disabled={busy}
            onClick={() =>
              void run(
                () => api.post("/notifications/read"),
                "All notifications marked as read.",
              )
            }
          >
            <Check size={15} />
            Mark all as read
          </Button>
        }
      />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : (
        <Panel>
          {data?.data.length ? (
            <>
              {data.data.map((n) => (
                <div
                  className={`notification-row ${!n.read_at ? "unread" : ""}`}
                  key={n.id}
                >
                  <div className="activity-dot">
                    <Bell size={17} />
                  </div>
                  <div>
                    <h3>{n.title}</h3>
                    <p>{n.body}</p>
                    <small>{date(n.created_at)}</small>
                    {n.url && (
                      <Link
                        className="text-link"
                        style={{ display: "flex", marginTop: 10 }}
                        href={n.url}
                      >
                        View update <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                  {!n.read_at && (
                    <Button
                      tone="ghost"
                      onClick={() =>
                        void run(
                          () =>
                            api.post("/notifications/read", { ids: [n.id] }),
                          "Marked as read.",
                        )
                      }
                      aria-label="Mark as read"
                    >
                      <Check size={17} />
                    </Button>
                  )}
                </div>
              ))}
              <Pagination
                page={data.current_page}
                last={data.last_page}
                onChange={setPage}
              />
            </>
          ) : (
            <Empty
              title="All quiet, all connected."
              description="We’ll keep your important updates right here."
            />
          )}
        </Panel>
      )}
    </>
  );
}

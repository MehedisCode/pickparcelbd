"use client";
import { useAction, useSession } from "@/components/providers";
import { Avatar } from "@/components/shell";
import {
  Button,
  ConfirmAction,
  Empty,
  ErrorState,
  Loading,
  Modal,
  PageHeading,
  Pagination,
  Panel,
  SearchInput,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, date } from "@/lib/api";
import type { Paged } from "@/lib/types";
import {
  ArrowRight,
  Bell,
  Check,
  MessageCircle,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
type Conversation = {
  user_id: number;
  name: string;
  public_id: string;
  avatar_url: string | null;
  body: string;
  created_at: string;
  unread: number;
  online: boolean;
};
type Message = {
  id: number;
  sender_id: number;
  receiver_id: number;
  body: string;
  read_at: string | null;
  created_at: string;
};
export function MessagesScreen({ userId }: { userId?: string }) {
  const [page, setPage] = useState(1);
  const {
    data: conversations,
    error,
    loading,
    reload,
  } = useResource<Paged<Conversation>>(`/conversations?page=${page}`, 10000);
  const [search, setSearch] = useState("");
  const [newChat, setNewChat] = useState(false);
  const [body, setBody] = useState("");
  const params = useSearchParams();
  const orderId = params.get("order_id");
  const [before, setBefore] = useState<number>();
  const { data: messages, error: messageError } = useResource<{
    data: Message[];
    peer: Pick<Conversation, "user_id" | "name" | "public_id" | "online">;
  }>(
    userId
      ? `/conversations/${userId}?${new URLSearchParams({ ...(orderId ? { order_id: orderId } : {}), ...(before ? { before: String(before) } : {}) })}`
      : null,
    2500,
  );
  const { data: people } = useResource<{
    data: { id: number; name: string; public_id: string }[];
  }>(
    search.length >= 2 ? `/people?search=${encodeURIComponent(search)}` : null,
  );
  const { session } = useSession();
  const { run, busy } = useAction();
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages?.data.length]);
  const person =
    conversations?.data.find((c) => String(c.user_id) === userId) ||
    messages?.peer;
  return (
    <>
      <PageHeading
        eyebrow="A CLEAR LINE TO YOUR COMMUNITY"
        title="A little conversation goes a long way."
        description="Stay connected with your customers, sellers, and delivery partners."
        action={
          <Button onClick={() => setNewChat(true)}>
            <Plus size={15} />
            New conversation
          </Button>
        }
      />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : (
        <Panel>
          <div className="messages-layout">
            <aside className="conversation-list">
              {conversations?.data.length ? (
                conversations.data.map((c) => (
                  <Link
                    className={`conversation-item ${String(c.user_id) === userId ? "active" : ""}`}
                    href={`/dashboard/messages/${c.user_id}`}
                    key={c.user_id}
                  >
                    <Avatar name={c.name} />
                    <div>
                      <strong>
                        {c.name}
                        {c.unread > 0 && (
                          <span
                            className="badge pending"
                            style={{ marginLeft: 5 }}
                          >
                            {c.unread}
                          </span>
                        )}
                      </strong>
                      <p>{c.body}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <Empty
                  title="Say hello."
                  description="Your conversations start here."
                />
              )}
              {conversations && (
                <Pagination
                  page={page}
                  last={conversations.last_page}
                  onChange={setPage}
                />
              )}
            </aside>
            <div className="chat-panel">
              {userId ? (
                <>
                  <div className="chat-header">
                    <strong>
                      {person?.name || `Conversation #${userId}`}{" "}
                      {person?.online && (
                        <small style={{ color: "var(--green)", marginLeft: 8 }}>
                          Online
                        </small>
                      )}
                      {orderId ? ` · Order #${orderId}` : ""}
                    </strong>
                    <ConfirmAction
                      title="Clear this conversation?"
                      description="This hides all messages in this conversation from your inbox. The other person’s copy remains available."
                      onConfirm={() =>
                        api.delete(`/conversations/${userId}`, { mode: "me" })
                      }
                    >
                      <Trash2 size={13} />
                      Clear for me
                    </ConfirmAction>
                  </div>
                  <div className="chat-messages">
                    {messageError && <ErrorState message={messageError} />}
                    <div className="button-row">
                      {messages?.data.length === 100 && (
                        <Button
                          tone="secondary"
                          onClick={() => setBefore(messages.data[0].id)}
                        >
                          Older messages
                        </Button>
                      )}
                      {before && (
                        <Button
                          tone="secondary"
                          onClick={() => setBefore(undefined)}
                        >
                          Latest messages
                        </Button>
                      )}
                    </div>
                    {messages?.data.length ? (
                      messages.data.map((m) => (
                        <div
                          className={`chat-bubble ${Number(m.sender_id) === session?.user?.id ? "mine" : ""}`}
                          key={m.id}
                        >
                          {m.body}
                          <small>
                            {date(m.created_at)} {m.read_at ? "· Read" : ""}
                          </small>
                          <div className="button-row" style={{ marginTop: 5 }}>
                            <button
                              className="text-link"
                              style={{
                                background: "none",
                                border: 0,
                                padding: 0,
                                fontSize: 8,
                              }}
                              onClick={() =>
                                void run(
                                  () =>
                                    api.delete(`/messages/${m.id}`, {
                                      mode: "me",
                                    }),
                                  "Message hidden.",
                                )
                              }
                            >
                              Hide for me
                            </button>
                            {Number(m.sender_id) === session?.user?.id && (
                              <button
                                className="text-link"
                                style={{
                                  background: "none",
                                  border: 0,
                                  padding: 0,
                                  fontSize: 8,
                                }}
                                onClick={() =>
                                  void run(
                                    () =>
                                      api.delete(`/messages/${m.id}`, {
                                        mode: "everyone",
                                      }),
                                    "Message removed for everyone.",
                                  )
                                }
                              >
                                Remove for everyone
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <Empty
                        title="Start with a hello."
                        description="Your messages are visible only to the conversation participants."
                      />
                    )}
                    <div ref={bottom} />
                  </div>
                  <form
                    className="chat-send"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!body.trim()) return;
                      void run(async () => {
                        await api.post(`/conversations/${userId}`, {
                          body,
                          order_id: orderId ? Number(orderId) : null,
                        });
                        setBody("");
                      }, "Message sent.");
                    }}
                  >
                    <input
                      aria-label="Your message"
                      placeholder="A quick hello, a helpful update…"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      maxLength={2000}
                      required
                    />
                    <Button type="submit" disabled={busy}>
                      <Send size={15} />
                      Send
                    </Button>
                  </form>
                </>
              ) : (
                <Empty
                  title="Pick up a conversation."
                  description="Choose a conversation or find someone new to connect with."
                  action={
                    <Button onClick={() => setNewChat(true)}>
                      Start a conversation <MessageCircle size={15} />
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        </Panel>
      )}
      {newChat && (
        <Modal
          title="Find someone to connect with"
          onClose={() => setNewChat(false)}
        >
          <div className="panel-body">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Name or public user ID…"
            />
            {people?.data.map((p) => (
              <Link
                className="person-card"
                key={p.id}
                href={`/dashboard/messages/${p.id}`}
                onClick={() => setNewChat(false)}
              >
                <Avatar name={p.name} />
                <div>
                  <h3>{p.name}</h3>
                  <p>{p.public_id}</p>
                </div>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
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

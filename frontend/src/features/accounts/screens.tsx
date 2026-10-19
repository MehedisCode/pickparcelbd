"use client";
import { useAction, useSession, useToast } from "@/components/providers";
import { Avatar, PublicFooter, PublicHeader } from "@/components/shell";
import {
  BackLink,
  Badge,
  Button,
  ConfirmAction,
  Empty,
  ErrorState,
  Form,
  KeyValue,
  Loading,
  PageHeading,
  Pagination,
  Panel,
  SearchInput,
} from "@/components/ui";
import { ProfileForm } from "./profile-form";
import { ProductCard } from "@/features/marketplace/catalog";
import { useResource } from "@/hooks/use-resource";
import { api, date, money } from "@/lib/api";
import { accountHome, safeReturnPath } from "@/lib/auth-navigation";
import type { Paged, Product, User } from "@/lib/types";
import { ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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
export function WalletScreen() {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useResource<{
    balance: string;
    transactions: Paged<{
      id: number;
      code: string | null;
      type: string;
      amount: string;
      balance_after: string;
      created_at: string;
      note: string;
    }>;
  }>(`/wallet?page=${page}`);
  return (
    <>
      <PageHeading
        eyebrow="THE NUMBERS THAT KEEP YOU MOVING"
        title="Your wallet"
        description="Every confirmed credit, with a clear record."
      />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : (
        data && (
          <>
            <section className="wallet-hero">
              <span>AVAILABLE WALLET BALANCE</span>
              <strong>{money(data.balance)}</strong>
              <p>
                Confirmed COD and commission credits. Every movement is recorded
                below.
              </p>
            </section>
            <Panel title="Wallet activity">
              {data.transactions.data.length ? (
                <>
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Activity</th>
                          <th>Parcel</th>
                          <th>Amount</th>
                          <th>Balance after</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.transactions.data.map((t) => (
                          <tr key={t.id}>
                            <td className="capitalize">
                              <strong>{t.type.replaceAll("_", " ")}</strong>
                              <small>{t.note}</small>
                            </td>
                            <td>{t.code ? `RFD${t.code}` : "—"}</td>
                            <td style={{ color: "var(--green)" }}>
                              {money(t.amount)}
                            </td>
                            <td>{money(t.balance_after)}</td>
                            <td>{date(t.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    page={data.transactions.current_page}
                    last={data.transactions.last_page}
                    onChange={setPage}
                  />
                </>
              ) : (
                <Empty
                  title="Good things add up."
                  description="Your confirmed delivery and commission credits will appear here."
                />
              )}
            </Panel>
          </>
        )
      )}
    </>
  );
}
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
export function NewsScreen() {
  const { session, reload } = useSession();
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE UPDATE FOR YOUR COMMUNITY"
        title="What’s new with you?"
        description="Your news appears on your public profile."
      />
      <Panel title="Your latest news">
        <Form
          initial={{ news: session?.user?.news || "" }}
          fields={[
            {
              name: "news",
              label: "Share an update",
              type: "textarea",
              placeholder:
                "A new collection, an announcement, or a little good news…",
            },
          ]}
          submit="Publish update"
          onSubmit={async (d) => {
            await api.patch("/account", d);
            await reload();
          }}
        />
        <div className="panel-body">
          <ConfirmAction
            title="Remove your update?"
            description="Your current news post will be removed from your public profile."
            onConfirm={async () => {
              await api.patch("/account", { news: null });
              await reload();
            }}
          >
            Remove current update
          </ConfirmAction>
        </div>
      </Panel>
    </>
  );
}
export function BuyerBlocksScreen() {
  const [search, setSearch] = useState("");
  const [phone, setPhone] = useState("");
  const [history, setHistory] = useState<{
    total: number;
    delivered: number;
    returned: number;
    pending: number;
  }>();
  const { data, error, loading, reload } = useResource<{
    data: Pick<User, "id" | "name" | "public_id">[];
  }>("/buyer-blocks");
  const { data: people } = useResource<{
    data: Pick<User, "id" | "name" | "public_id">[];
  }>(
    search.length >= 2 ? `/people?search=${encodeURIComponent(search)}` : null,
  );
  const { run, busy } = useAction();
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE MORE CONTROL"
        title="Buyer preferences & history"
        description="Manage your blocklist and check delivery outcomes from your own orders."
      />
      <div className="detail-grid">
        <Panel title="Your blocked buyers">
          <div className="panel-body">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Find an account by name or public ID…"
            />
            {people?.data.map((u) => (
              <div className="person-card" key={u.id}>
                <div>
                  <h3>{u.name}</h3>
                  <p>{u.public_id}</p>
                </div>
                <Button
                  tone="secondary"
                  disabled={busy}
                  onClick={() =>
                    void run(
                      () => api.post(`/buyer-blocks/${u.id}`),
                      "Buyer blocked.",
                    )
                  }
                >
                  Block buyer
                </Button>
              </div>
            ))}
          </div>
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorState message={error} retry={reload} />
          ) : data?.data.length ? (
            data.data.map((u) => (
              <div className="person-card" key={u.id}>
                <Avatar name={u.name} />
                <div>
                  <h3>{u.name}</h3>
                  <p>{u.public_id}</p>
                </div>
                <Button
                  tone="secondary"
                  disabled={busy}
                  onClick={() =>
                    void run(
                      () => api.delete(`/buyer-blocks/${u.id}`),
                      "Buyer unblocked.",
                    )
                  }
                >
                  Unblock
                </Button>
              </div>
            ))
          ) : (
            <Empty
              title="Your blocklist is empty."
              description="Blocked buyers cannot place new orders or exchange messages with you."
            />
          )}
        </Panel>
        <Panel title="Check a buyer’s delivery history">
          <div className="panel-body">
            <p style={{ fontSize: 11 }}>
              Only delivery outcomes from parcels you sent are included.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void run(
                  async () =>
                    setHistory(
                      await api.get(
                        `/fraud-check?phone=${encodeURIComponent(phone)}`,
                      ),
                    ),
                  "Delivery history loaded.",
                );
              }}
            >
              <label className="field">
                <span>Recipient phone</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  minLength={7}
                  required
                  type="tel"
                />
              </label>
              <Button type="submit" style={{ marginTop: 15 }} disabled={busy}>
                Check history
              </Button>
            </form>
            {history && (
              <div style={{ marginTop: 20 }}>
                {Object.entries(history).map(([k, v]) => (
                  <KeyValue key={k} label={k} value={v} />
                ))}
              </div>
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}

type Profile = {
  user: Pick<
    User,
    | "id"
    | "public_id"
    | "name"
    | "avatar_url"
    | "verified"
    | "district"
    | "upazila"
    | "public_phone"
    | "news"
    | "role"
  > & { share_count: number };
  followers: number;
  following: number;
  products: number;
  is_following: boolean;
  comments: { id: number; name: string; body: string; created_at: string }[];
};
export function SellerProfileScreen({ publicId }: { publicId: string }) {
  const { data, error, loading, reload } = useResource<Profile>(
    `/profiles/${publicId}`,
  );
  const { data: products } = useResource<Paged<Product>>(
    `/products?seller=${publicId}`,
  );
  const { session } = useSession();
  const { run, busy } = useAction();
  const toast = useToast();
  const router = useRouter();
  return (
    <>
      <PublicHeader />
      <main className="public-container">
        <BackLink href="/products" label="Back to marketplace" />
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} retry={reload} />
        ) : (
          data && (
            <>
              <section className="profile-banner">
                <Avatar name={data.user.name} size="large" />
                <div>
                  <span className="eyebrow">
                    INDEPENDENT SPIRIT. LOCAL ROOTS.
                  </span>
                  <h1>
                    {data.user.name}{" "}
                    {data.user.verified && (
                      <ShieldCheck size={21} color="var(--green)" />
                    )}
                  </h1>
                  <p>
                    {data.user.district || "Bangladesh"} · {data.user.public_id}{" "}
                    · {data.followers} followers
                  </p>
                  {data.user.public_phone && (
                    <p style={{ marginTop: 5 }}>{data.user.public_phone}</p>
                  )}
                </div>
                <div className="button-row">
                  {session?.user && session.user.id !== data.user.id ? (
                    <>
                      <Button
                        disabled={busy}
                        tone={data.is_following ? "secondary" : "primary"}
                        onClick={() =>
                          void run(
                            () => api.post(`/profiles/${data.user.id}/follow`),
                            data.is_following
                              ? "Unfollowed."
                              : "Following this seller.",
                          )
                        }
                      >
                        {data.is_following ? "Following" : "Follow shop"}
                      </Button>
                      <Link
                        className="button secondary"
                        href={`/dashboard/messages/${data.user.id}`}
                      >
                        <MessageCircle size={15} />
                        Message
                      </Link>
                    </>
                  ) : !session?.user ? (
                    <Link
                      className="button primary"
                      href={`/login?return=/sellers/${publicId}`}
                    >
                      Follow this shop
                    </Link>
                  ) : null}
                  <Button
                    tone="secondary"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          window.location.href,
                        );
                        if (session?.user)
                          await api.post(`/profiles/${data.user.id}/share`);
                        toast("Shop link copied.");
                      } catch {
                        toast(
                          "Copy this page’s URL to share the shop.",
                          "error",
                        );
                      }
                    }}
                  >
                    Share shop
                  </Button>
                </div>
              </section>
              {data.user.news && (
                <div className="info-notice">
                  <MessageCircle size={20} />
                  <p>{data.user.news}</p>
                </div>
              )}
              <div className="section-heading">
                <h2>Good things from this shop</h2>
                {session?.user?.id !== data.user.id && (
                  <Button
                    tone="secondary"
                    disabled={busy}
                    onClick={() => {
                      if (!session?.user) {
                        router.push(`/login?return=/sellers/${publicId}`);
                        return;
                      }
                      void run(async () => {
                        const m = await api.post<{ id: number }>(
                          "/cash-memos",
                          { seller_id: data.user.id },
                        );
                        router.push(`/dashboard/cash-memos/${m.id}`);
                      }, "Cash memo opened.");
                    }}
                  >
                    Start a cash memo <FileTextIcon />
                  </Button>
                )}
              </div>
              {products?.data.length ? (
                <div className="product-grid">
                  {products.data.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <Panel>
                  <Empty
                    title="Something good is in the making."
                    description="This seller hasn’t published products yet."
                  />
                </Panel>
              )}
              <div style={{ height: 30 }} />
              <Panel title="From the community">
                {data.comments.length ? (
                  data.comments.map((c) => (
                    <div className="person-card" key={c.id}>
                      <Avatar name={c.name} />
                      <div>
                        <h3>{c.name}</h3>
                        <p>{c.body}</p>
                        <small className="muted">{date(c.created_at)}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <Empty
                    title="Be the first to say hello."
                    description="Share a thoughtful comment with this seller."
                  />
                )}
                {session?.user && (
                  <Form
                    fields={[
                      {
                        name: "body",
                        label: "Leave a comment",
                        required: true,
                        type: "textarea",
                      },
                    ]}
                    submit="Post comment"
                    onSubmit={(d) =>
                      api.post(`/profiles/${data.user.id}/comments`, d)
                    }
                  />
                )}
              </Panel>
            </>
          )
        )}
      </main>
      <PublicFooter />
    </>
  );
}
function FileTextIcon() {
  return <ArrowRight size={14} />;
}

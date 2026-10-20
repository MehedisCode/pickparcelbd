"use client";

import { useAction, useSession, useToast } from "@/components/providers";
import { Avatar, PublicFooter, PublicHeader } from "@/components/shell";
import {
  BackLink,
  Button,
  Empty,
  ErrorState,
  Form,
  Loading,
  Panel,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, date } from "@/lib/api";
import { ProductCard } from "@/features/marketplace/catalog";
import type { Paged, Product, User } from "@/lib/types";
import { ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

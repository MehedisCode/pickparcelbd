"use client";
import { useRouter } from "next/navigation";
import { useResource } from "@/hooks/use-resource";
import { useAction } from "@/components/providers";
import { api } from "@/lib/api";
import {
  Button,
  ErrorState,
  Loading,
  PageHeading,
  Panel,
} from "@/components/ui";
export function StartMemoScreen({ seller }: { seller: string }) {
  const { data, error, loading, reload } = useResource<{
    user: { id: number; name: string; public_id: string };
  }>(`/profiles/${encodeURIComponent(seller)}`);
  const router = useRouter();
  const { run, busy } = useAction();
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;
  if (!data) return null;
  return (
    <>
      <PageHeading
        title={`Start a cash memo with ${data.user.name}`}
        description="Upload your order list, then work with the seller to prepare the cash memo."
      />
      <Panel>
        <div className="panel-body">
          <p>
            {data.user.name} · {data.user.public_id}
          </p>
          <Button
            disabled={busy}
            onClick={() =>
              void run(async () => {
                const memo = await api.post<{ id: number }>("/cash-memos", {
                  seller_id: data.user.id,
                });
                router.push(`/dashboard/cash-memos/${memo.id}`);
              }, "Cash memo opened.")
            }
          >
            Open cash memo
          </Button>
        </div>
      </Panel>
    </>
  );
}

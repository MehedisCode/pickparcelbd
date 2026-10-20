"use client";

import { useSession } from "@/components/providers";
import { ConfirmAction, Form, PageHeading, Panel } from "@/components/ui";
import { api } from "@/lib/api";

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

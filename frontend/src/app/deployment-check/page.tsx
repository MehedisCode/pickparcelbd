"use client";

import { PublicFooter, PublicHeader } from "@/components/shell";
import { Button, Loading, Panel } from "@/components/ui";
import { useResource } from "@/hooks/use-resource";

const release = "manual-upload-02";

type DeploymentCheck = {
  release: string;
  message: string;
  server_time: string;
};

export default function DeploymentCheckPage() {
  const { data, error, loading, reload } =
    useResource<DeploymentCheck>("/deployment-check");
  const matches = data?.release === release;

  return (
    <>
      <PublicHeader />
      <main
        className="public-container"
        style={{ maxWidth: 850, minHeight: "65vh" }}
      >
        <div className="section-intro">
          <span className="eyebrow">MANUAL UPLOAD CHECK</span>
          <h1>Deployment check</h1>
          <p>Use this page to confirm your frontend and backend updates.</p>
        </div>
        <Panel>
          <div className="panel-body">
            <h2>Frontend updated</h2>
            <p>
              Frontend release: <strong>{release}</strong>
            </p>
            <div role="status" aria-live="polite">
              {loading && <Loading />}
              {error && (
                <p>
                  Backend check failed. Confirm the updated backend is deployed
                  and its route cache is refreshed, then try again.
                </p>
              )}
              {data && (
                <>
                  <h2>
                    {matches ? "Backend updated" : "Backend version differs"}
                  </h2>
                  <p>{data.message}</p>
                  {data.server_time && (
                    <p>
                      Backend response time:{" "}
                      <time dateTime={data.server_time}>
                        {new Date(data.server_time).toLocaleString("en-GB", {
                          timeZone: "Asia/Dhaka",
                          dateStyle: "medium",
                          timeStyle: "medium",
                        })}
                      </time>{" "}
                      (Bangladesh time)
                    </p>
                  )}
                  <p>
                    Backend release: <strong>{data.release}</strong>
                  </p>
                  <p>
                    {matches
                      ? "Success! Both updates are live and connected."
                      : "Deploy the matching backend release, then check again."}
                  </p>
                </>
              )}
            </div>
            <Button tone="secondary" onClick={reload} disabled={loading}>
              Check again
            </Button>
          </div>
        </Panel>
      </main>
      <PublicFooter />
    </>
  );
}

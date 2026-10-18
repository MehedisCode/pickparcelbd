"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "./ui";
export function QrScanner({ onScan }: { onScan: (value: string) => void }) {
  const id = useId().replaceAll(":", "");
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  const callback = useRef(onScan);
  useEffect(() => {
    callback.current = onScan;
  }, [onScan]);
  useEffect(() => {
    if (!active) return;
    let disposed = false;
    let scanner: import("html5-qrcode").Html5Qrcode | undefined;
    import("html5-qrcode").then(async ({ Html5Qrcode }) => {
      if (disposed) return;
      scanner = new Html5Qrcode(id);
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 8, qrbox: 220 },
          (text) => {
            callback.current(text);
            setActive(false);
          },
          () => {},
        );
        if (disposed && scanner.isScanning) await scanner.stop();
      } catch (e) {
        if (!disposed) {
          setError(
            e instanceof Error
              ? e.message
              : "Camera access is unavailable. Paste the token instead.",
          );
          setActive(false);
        }
      }
    });
    return () => {
      disposed = true;
      if (scanner?.isScanning)
        void scanner
          .stop()
          .then(() => scanner?.clear())
          .catch(() => {});
    };
  }, [active, id]);
  return (
    <div className="panel-body">
      <Button
        tone="secondary"
        onClick={() => {
          setError("");
          setActive(!active);
        }}
      >
        <Camera size={16} />
        {active ? "Stop camera" : "Scan handover QR"}
      </Button>
      {error && <p role="alert">{error}</p>}
      <div id={id} style={{ maxWidth: 360, marginTop: active ? 16 : 0 }} />
    </div>
  );
}

"use client";

import { api, refreshData } from "@/lib/api";
import type { Session } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const SessionContext = createContext<{
  session?: Session;
  error?: string;
  reload: () => Promise<void>;
}>({ reload: async () => {} });
const ToastContext = createContext<
  (message: string, tone?: "success" | "error") => void
>(() => {});
export function Providers({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>();
  const [error, setError] = useState<string>();
  const [toast, setToast] = useState<{
    message: string;
    tone: string;
    id: number;
  }>();
  const reload = useCallback(async () => {
    try {
      setSession(await api.get<Session>("/session"));
      setError(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection unavailable.");
    }
  }, []);
  useEffect(() => {
    let active = true;
    api
      .get<Session>("/session")
      .then((value) => {
        if (active) setSession(value);
      })
      .catch((e) => {
        if (active)
          setError(e instanceof Error ? e.message : "Connection unavailable.");
      });
    return () => {
      active = false;
    };
  }, []);
  const userId = session?.user?.id;
  useEffect(() => {
    if (!userId) return;
    const ping = () => {
      if (!document.hidden)
        void api.post("/account/heartbeat", {}).catch(() => {});
    };
    ping();
    const timer = setInterval(ping, 10000);
    return () => clearInterval(timer);
  }, [userId]);
  const notify = useCallback(
    (message: string, tone: "success" | "error" = "success") => {
      const id = Date.now();
      setToast({ message, tone, id });
      setTimeout(() => setToast((t) => (t?.id === id ? undefined : t)), 5500);
    },
    [],
  );
  return (
    <SessionContext.Provider value={{ session, error, reload }}>
      <ToastContext.Provider value={notify}>
        {children}
        {toast && (
          <div
            className={`toast ${toast.tone}`}
            role={toast.tone === "error" ? "alert" : "status"}
          >
            {toast.message}
            <button
              aria-label="Dismiss notification"
              onClick={() => setToast(undefined)}
            >
              ×
            </button>
          </div>
        )}
      </ToastContext.Provider>
    </SessionContext.Provider>
  );
}
export function useSession() {
  return useContext(SessionContext);
}
export function useToast() {
  return useContext(ToastContext);
}
export function useAction() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const run = async (
    fn: () => Promise<unknown>,
    message = "Saved successfully.",
  ) => {
    setBusy(true);
    try {
      await fn();
      toast(message);
      refreshData();
      return true;
    } catch (e) {
      toast(
        e instanceof Error ? e.message : "Unable to complete this action.",
        "error",
      );
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { run, busy };
}

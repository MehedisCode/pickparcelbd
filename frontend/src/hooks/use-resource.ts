"use client";
import { api } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

export function useResource<T>(path: string | null, interval = 0) {
  const [state, setState] = useState<{
    path: string | null;
    data?: T;
    error?: string;
  }>({ path: null });
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((n) => n + 1), []);
  useEffect(() => {
    let active = true;
    let sequence = 0;
    const fetchData = async () => {
      if (!path) return;
      const current = ++sequence;
      try {
        const data = await api.get<T>(path);
        if (active && current === sequence) setState({ path, data });
      } catch (e) {
        if (active && current === sequence)
          setState({
            path,
            error: e instanceof Error ? e.message : "Unable to load data.",
          });
      }
    };
    void fetchData();
    const refresh = () => {
      if (!document.hidden) void fetchData();
    };
    window.addEventListener("pickparcel:refresh", refresh);
    const timer = interval ? window.setInterval(refresh, interval) : undefined;
    return () => {
      active = false;
      window.removeEventListener("pickparcel:refresh", refresh);
      if (timer) window.clearInterval(timer);
    };
  }, [path, interval, version]);
  return {
    data: state.path === path ? state.data : undefined,
    error: state.path === path ? state.error : undefined,
    loading: !!path && (state.path !== path || (!state.data && !state.error)),
    reload,
  };
}

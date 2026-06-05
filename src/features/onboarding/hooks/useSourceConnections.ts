import { useCallback, useEffect, useRef, useState } from "react";

import { SOURCE_ORDER } from "@/constants/sources";
import type { SourceId } from "@/types/common";
import { SOURCE_CONNECT_META } from "@/features/onboarding/data/onboarding-fixtures";
import type { ConnectionStatus } from "@/features/onboarding/types";

const CONNECT_MS = 950;

type BoolMap = Partial<Record<SourceId, boolean>>;

/**
 * Tracks per-source connection state on the connect step, with a simulated
 * connecting delay. Timers are cleared on unmount so a quick step-away can't
 * update unmounted state.
 */
export function useSourceConnections() {
  const [connected, setConnected] = useState<BoolMap>({});
  const [connecting, setConnecting] = useState<BoolMap>({});
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    []
  );

  const connect = useCallback((id: SourceId, delay = 0) => {
    const start = window.setTimeout(() => {
      setConnecting((c) => ({ ...c, [id]: true }));
      const finish = window.setTimeout(() => {
        setConnecting((c) => ({ ...c, [id]: false }));
        setConnected((c) => ({ ...c, [id]: true }));
      }, CONNECT_MS);
      timers.current.push(finish);
    }, delay);
    timers.current.push(start);
  }, []);

  const connectAll = useCallback(() => {
    SOURCE_ORDER.forEach((id, i) => {
      if (!connected[id]) connect(id, i * 180);
    });
  }, [connect, connected]);

  const statusOf = useCallback(
    (id: SourceId): ConnectionStatus =>
      connected[id] ? "connected" : connecting[id] ? "connecting" : "idle",
    [connected, connecting]
  );

  const connectedIds = SOURCE_ORDER.filter((id) => connected[id]);
  const connectedCount = connectedIds.length;
  const isAllConnected = connectedCount === SOURCE_ORDER.length;
  const estimatedDecisions = connectedIds.reduce(
    (sum, id) => sum + SOURCE_CONNECT_META[id].est,
    0
  );

  return {
    statusOf,
    connect,
    connectAll,
    connectedIds,
    connectedCount,
    isAllConnected,
    estimatedDecisions,
    totalSources: SOURCE_ORDER.length,
  };
}

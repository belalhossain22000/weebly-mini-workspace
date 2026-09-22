import { useCallback, useSyncExternalStore } from "react";

const LOCAL_STORAGE_QUOTA_BYTES = 5 * 1024 * 1024;

function getLocalStorageUsedBytes(): number {
  if (typeof window === "undefined") return 0;
  let total = 0;
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key) continue;
    const value = window.localStorage.getItem(key) ?? "";
    total += (key.length + value.length) * 2;
  }
  return total;
}

function formatStorageSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export interface StorageInfo {
  usedBytes: number;
  totalBytes: number;
  usedLabel: string;
  totalLabel: string;
  percentUsed: number;
}

export function useLocalStorageSize(workspaceVersion?: unknown): StorageInfo {
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    return () => window.removeEventListener("storage", onStoreChange);
  }, []);

  const usedBytes = useSyncExternalStore(
    subscribe,
    getLocalStorageUsedBytes,
    () => 0
  );

  void workspaceVersion;

  const percentUsed = Math.min((usedBytes / LOCAL_STORAGE_QUOTA_BYTES) * 100, 100);

  return {
    usedBytes,
    totalBytes: LOCAL_STORAGE_QUOTA_BYTES,
    usedLabel: formatStorageSize(usedBytes),
    totalLabel: formatStorageSize(LOCAL_STORAGE_QUOTA_BYTES),
    percentUsed,
  };
}

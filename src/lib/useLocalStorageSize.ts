import { useEffect, useState } from "react";

// Browser localStorage quota is ~5 MB per origin (5 * 1024 * 1024 bytes).
// Each JS character in localStorage occupies 2 bytes (UTF-16).
const LOCAL_STORAGE_QUOTA_BYTES = 5 * 1024 * 1024;

function getLocalStorageUsedBytes(): number {
  if (typeof window === "undefined") return 0;
  let total = 0;
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key) continue;
    const value = window.localStorage.getItem(key) ?? "";
    // Each UTF-16 character = 2 bytes
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

/**
 * Tracks real-time localStorage usage.
 * Re-calculates whenever the Redux workspace state is saved to localStorage
 * (i.e., whenever `workspaceVersion` changes) or whenever a storage event fires.
 */
export function useLocalStorageSize(workspaceVersion?: unknown): StorageInfo {
  const [usedBytes, setUsedBytes] = useState(0);

  useEffect(() => {
    // Measure immediately
    setUsedBytes(getLocalStorageUsedBytes());
  }, [workspaceVersion]);

  useEffect(() => {
    // Also listen for storage events from other tabs
    function onStorage() {
      setUsedBytes(getLocalStorageUsedBytes());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const percentUsed = Math.min((usedBytes / LOCAL_STORAGE_QUOTA_BYTES) * 100, 100);

  return {
    usedBytes,
    totalBytes: LOCAL_STORAGE_QUOTA_BYTES,
    usedLabel: formatStorageSize(usedBytes),
    totalLabel: formatStorageSize(LOCAL_STORAGE_QUOTA_BYTES),
    percentUsed,
  };
}

import type { WorkspaceState } from "@/features/workspace/workspace.types";

const STORAGE_KEY = "webbly-workspace-state";

export function loadWorkspaceState(): WorkspaceState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkspaceState;
  } catch {
    return null;
  }
}

export function saveWorkspaceState(state: WorkspaceState): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable (private mode, quota exceeded).
    // Persistence is a nice-to-have, so failures are silently ignored.
  }
}

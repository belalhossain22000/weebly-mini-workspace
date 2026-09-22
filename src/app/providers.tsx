"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDarkMode } from "@/features/ui/uiSlice";
import { hydrate } from "@/features/workspace/workspaceSlice";
import { loadWorkspaceState, saveWorkspaceState } from "@/lib/storage";

const HydrationContext = createContext(false);

export function useIsHydrated() {
  return useContext(HydrationContext);
}

function ThemeSync({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.ui.isDarkMode);

  useEffect(() => {
    const stored = window.localStorage.getItem("webbly-dark-mode");
    if (stored === "true") {
      dispatch(setDarkMode(true));
    }
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("webbly-dark-mode", String(isDarkMode));
  }, [isDarkMode]);

  return <>{children}</>;
}

function WorkspacePersistence({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const workspaceState = useAppSelector((state) => state.workspace);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = loadWorkspaceState();
    if (saved) {
      dispatch(hydrate(saved));
    }
    const timeout = setTimeout(() => setIsHydrated(true), 250);
    return () => clearTimeout(timeout);
    // Only run once on mount, before the save-effect below starts firing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveWorkspaceState(workspaceState);
  }, [isHydrated, workspaceState]);

  return (
    <HydrationContext.Provider value={isHydrated}>
      {children}
    </HydrationContext.Provider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <WorkspacePersistence>
        <ThemeSync>{children}</ThemeSync>
      </WorkspacePersistence>
    </Provider>
  );
}

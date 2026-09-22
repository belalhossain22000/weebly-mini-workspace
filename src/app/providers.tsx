"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDarkMode } from "@/features/ui/uiSlice";

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

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeSync>{children}</ThemeSync>
    </Provider>
  );
}

"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useAppSelector } from "@/store/hooks";

function ThemeSync({ children }: { children: React.ReactNode }) {
  const isDarkMode = useAppSelector((state) => state.ui.isDarkMode);

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

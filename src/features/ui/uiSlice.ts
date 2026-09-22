import { createSlice } from "@reduxjs/toolkit";

interface UiState {
  isDarkMode: boolean;
}

function getInitialDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem("webbly-dark-mode");
  return stored === "true";
}

const initialState: UiState = {
  isDarkMode: getInitialDarkMode(),
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
  },
});

export const { toggleDarkMode } = uiSlice.actions;
export default uiSlice.reducer;

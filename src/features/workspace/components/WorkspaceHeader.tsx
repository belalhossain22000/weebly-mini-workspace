"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleDarkMode } from "@/features/ui/uiSlice";
import Input from "@/components/ui/Input";

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

interface WorkspaceHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export default function WorkspaceHeader({
  searchValue,
  onSearchChange,
}: WorkspaceHeaderProps) {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.ui.isDarkMode);

  return (
    <header className="flex items-center gap-4 border-b border-gray-100 bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="max-w-md flex-1">
        <Input
          icon={<SearchIcon />}
          placeholder="Search files, folders, or anything..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange("")}
        />
      </div>

      <button
        type="button"
        onClick={() => dispatch(toggleDarkMode())}
        aria-label="Toggle dark mode"
        className="flex items-center gap-1.5 rounded-full bg-gray-100 p-1 dark:bg-gray-800"
      >
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
            !isDarkMode ? "bg-white text-primary-500 shadow-sm" : "text-gray-500"
          }`}
        >
          <SunIcon />
        </span>
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
            isDarkMode ? "bg-gray-700 text-primary-400 shadow-sm" : "text-gray-400"
          }`}
        >
          <MoonIcon />
        </span>
      </button>
    </header>
  );
}

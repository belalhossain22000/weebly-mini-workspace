"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  searchWorkspace,
  filterResults,
  sortResults,
  getTopLevelLocations,
} from "../search.utils";
import type { SearchFilters as SearchFiltersType, SortOption, TypeTab, SearchResult } from "../search.utils";
import SearchResults from "./SearchResults";
import SearchFiltersPanel from "./SearchFilters";
import Dropdown from "@/components/ui/Dropdown";
import Button from "@/components/ui/Button";

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
  );
}

const defaultFilters: SearchFiltersType = {
  fileTypes: [],
  locations: [],
  dateModified: "any",
};

function SearchEmptyIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function NoResultsIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <path d="M14 2v6h6" />
      <line x1="9" y1="14" x2="15" y2="20" />
      <line x1="15" y1="14" x2="9" y2="20" />
    </svg>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 px-2 py-4">
          <div className="h-5 w-5 shrink-0 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="h-3.5 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-56 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
          </div>
          <div className="hidden h-3 w-24 shrink-0 animate-pulse rounded bg-gray-100 dark:bg-gray-800 sm:block" />
        </div>
      ))}
    </div>
  );
}

interface SearchViewProps {
  query: string;
  onSearchChange: (value: string) => void;
  onNavigate: (result: SearchResult) => void;
  onGoHome: () => void;
}

export default function SearchView({
  query,
  onSearchChange,
  onNavigate,
  onGoHome,
}: SearchViewProps) {
  const nodes = useAppSelector((state) => state.workspace.nodes);
  const activeWorkspaceId = useAppSelector(
    (state) => state.workspace.activeWorkspaceId
  );
  const workspace = useAppSelector(
    (state) => state.workspace.workspaces[state.workspace.activeWorkspaceId]
  );

  const [typeTab, setTypeTab] = useState<TypeTab>("all");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [filters, setFilters] = useState<SearchFiltersType>(defaultFilters);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query === debouncedQuery) return;
    setIsSearching(true);
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const allResults = useMemo(() => {
    if (!workspace) return [];
    return searchWorkspace(nodes, activeWorkspaceId, workspace.rootFolderId, debouncedQuery);
  }, [nodes, activeWorkspaceId, workspace, debouncedQuery]);

  const locations = useMemo(() => {
    if (!workspace) return [];
    return getTopLevelLocations(nodes, activeWorkspaceId, workspace.rootFolderId);
  }, [nodes, activeWorkspaceId, workspace]);

  const counts = useMemo(() => {
    const fileTypes: Record<string, number> = {
      text: 0,
      markdown: 0,
      image: 0,
      other: 0,
    };
    const locationCounts: Record<string, number> = {};

    for (const result of allResults) {
      if (result.node.type === "file") {
        const lower = result.node.name.toLowerCase();
        if (lower.endsWith(".md")) fileTypes.markdown += 1;
        else if (lower.endsWith(".txt")) fileTypes.text += 1;
        else fileTypes.other += 1;
      }
      const topLevel = result.path.split("/").filter(Boolean)[0] ?? "";
      locationCounts[topLevel] = (locationCounts[topLevel] ?? 0) + 1;
    }

    return {
      fileTypes: fileTypes as Record<"text" | "markdown" | "image" | "other", number>,
      locations: locationCounts,
    };
  }, [allResults]);

  const visibleResults = useMemo(() => {
    const filtered = filterResults(allResults, typeTab, filters);
    return sortResults(filtered, sortBy);
  }, [allResults, typeTab, filters, sortBy]);

  const filesCount = allResults.filter((r) => r.node.type === "file").length;
  const foldersCount = allResults.filter((r) => r.node.type === "folder").length;

  if (!query.trim()) {
    return (
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        <nav className="flex items-center gap-2 text-body-sm text-gray-500 dark:text-gray-400">
          <button
            type="button"
            onClick={onGoHome}
            className="flex cursor-pointer items-center hover:text-gray-700 dark:hover:text-gray-200"
            aria-label="Home"
          >
            <HomeIcon />
          </button>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="font-medium text-gray-900 dark:text-gray-50">Search</span>
        </nav>

        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center text-gray-300 dark:text-gray-600">
            <SearchEmptyIcon />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-heading-4 text-gray-900 dark:text-gray-50">
              Search for anything
            </h3>
            <p className="max-w-sm text-body-sm text-gray-500 dark:text-gray-400">
              Find files, folders, and content across your workspace. Try searching for file names, content, or folder names.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {["notes", "project", "todo", "frontend"].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSearchChange(suggestion)}
                className="cursor-pointer rounded-full border border-gray-200 px-3 py-1 text-caption text-gray-600 hover:border-primary-400 hover:text-primary-500 dark:border-gray-700 dark:text-gray-300"
              >
                &quot;{suggestion}&quot;
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      <nav className="flex items-center gap-2 text-body-sm text-gray-500 dark:text-gray-400">
        <button
          type="button"
          onClick={onGoHome}
          className="flex cursor-pointer items-center hover:text-gray-700 dark:hover:text-gray-200"
          aria-label="Home"
        >
          <HomeIcon />
        </button>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <button
          type="button"
          onClick={() => onSearchChange("")}
          className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
        >
          Search
        </button>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className="font-medium text-gray-900 dark:text-gray-50">
          Results for &quot;{query}&quot;
        </span>
      </nav>

      <div>
        <h2 className="text-heading-3 text-gray-900 dark:text-gray-50">
          Search results for &quot;{query}&quot;
        </h2>
        <p className="text-body-sm text-gray-500 dark:text-gray-400">
          {allResults.length} result{allResults.length === 1 ? "" : "s"} found in{" "}
          {workspace?.name}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-md border border-gray-200 p-1 dark:border-gray-700">
          {(
            [
              { id: "all", label: "All" },
              { id: "files", label: "Files" },
              { id: "folders", label: "Folders" },
            ] as { id: TypeTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTypeTab(tab.id)}
              className={`cursor-pointer rounded px-3 py-1.5 text-body-sm ${
                typeTab === tab.id
                  ? "bg-primary-500 text-white"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {tab.label}
              {tab.id === "files" && ` (${filesCount})`}
              {tab.id === "folders" && ` (${foldersCount})`}
            </button>
          ))}
        </div>

        <Dropdown
          value={sortBy}
          onChange={(value) => setSortBy(value as SortOption)}
          options={[
            { value: "relevance", label: "Sort by: Relevance" },
            { value: "name", label: "Sort by: Name" },
            { value: "date", label: "Sort by: Date Modified" },
          ]}
        />
      </div>

      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          {isSearching ? (
            <SearchResultsSkeleton />
          ) : visibleResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center text-gray-300 dark:text-gray-600">
                <NoResultsIcon />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-heading-4 text-gray-900 dark:text-gray-50">
                  No results found
                </h3>
                <p className="text-body-sm text-gray-500 dark:text-gray-400">
                  We couldn&apos;t find anything matching &quot;{query}&quot;.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  onSearchChange("");
                  setFilters(defaultFilters);
                  setTypeTab("all");
                }}
              >
                Clear search
              </Button>
            </div>
          ) : (
            <SearchResults results={visibleResults} query={query} onNavigate={onNavigate} />
          )}
        </div>

        <SearchFiltersPanel
          filters={filters}
          onChange={setFilters}
          locations={locations}
          totalCount={allResults.length}
          counts={counts}
        />
      </div>
    </div>
  );
}

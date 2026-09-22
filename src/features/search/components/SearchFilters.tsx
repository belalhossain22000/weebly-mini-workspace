import type { SearchFilters as SearchFiltersType, FileTypeFilter } from "../search.utils";

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onChange: (filters: SearchFiltersType) => void;
  locations: string[];
  totalCount: number;
  counts: {
    fileTypes: Record<FileTypeFilter | "image", number>;
    locations: Record<string, number>;
  };
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polygon points="3 4 21 4 14 12.5 14 19 10 21 10 12.5 3 4" />
    </svg>
  );
}

const fileTypeLabels: { value: FileTypeFilter | "image"; label: string }[] = [
  { value: "text", label: "Text Files" },
  { value: "markdown", label: "Markdown" },
  { value: "image", label: "Images" },
  { value: "other", label: "Other" },
];

const dateOptions: { value: SearchFiltersType["dateModified"]; label: string }[] = [
  { value: "any", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 days" },
  { value: "30days", label: "Last 30 days" },
];

export default function SearchFilters({
  filters,
  onChange,
  locations,
  totalCount,
  counts,
}: SearchFiltersProps) {
  function toggleFileType(type: FileTypeFilter) {
    const next = filters.fileTypes.includes(type)
      ? filters.fileTypes.filter((t) => t !== type)
      : [...filters.fileTypes, type];
    onChange({ ...filters, fileTypes: next });
  }

  function toggleLocation(location: string) {
    const next = filters.locations.includes(location)
      ? filters.locations.filter((l) => l !== location)
      : [...filters.locations, location];
    onChange({ ...filters, locations: next });
  }

  function clearAll() {
    onChange({ fileTypes: [], locations: [], dateModified: "any" });
  }

  const hasActiveFilters =
    filters.fileTypes.length > 0 ||
    filters.locations.length > 0 ||
    filters.dateModified !== "any";

  const isAllTypes = filters.fileTypes.length === 0;
  const isAllLocations = filters.locations.length === 0;

  return (
    <div className="flex w-64 shrink-0 flex-col gap-5 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-body-sm font-semibold text-gray-900 dark:text-gray-50">
          <FilterIcon />
          Filters
        </div>
        <button
          type="button"
          onClick={clearAll}
          disabled={!hasActiveFilters}
          className={`text-caption ${
            hasActiveFilters
              ? "cursor-pointer text-primary-500 hover:text-primary-600"
              : "cursor-default text-gray-300 dark:text-gray-700"
          }`}
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
        <p className="text-caption font-semibold text-gray-700 dark:text-gray-300">
          File Type
        </p>
        <label className="flex cursor-pointer items-center justify-between text-body-sm text-gray-700 dark:text-gray-200">
          <span className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAllTypes}
              onChange={() => onChange({ ...filters, fileTypes: [] })}
              className="h-4 w-4 cursor-pointer accent-primary-500"
            />
            All types
          </span>
          <span className="text-caption text-gray-400">{totalCount}</span>
        </label>
        {fileTypeLabels.map(({ value, label }) => (
          <label
            key={value}
            className="flex cursor-pointer items-center justify-between text-body-sm text-gray-700 dark:text-gray-200"
          >
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.fileTypes.includes(value as FileTypeFilter)}
                onChange={() => toggleFileType(value as FileTypeFilter)}
                className="h-4 w-4 cursor-pointer accent-primary-500"
              />
              {label}
            </span>
            <span className="text-caption text-gray-400">
              {counts.fileTypes[value] ?? 0}
            </span>
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
        <p className="text-caption font-semibold text-gray-700 dark:text-gray-300">
          Location
        </p>
        <label className="flex cursor-pointer items-center justify-between text-body-sm text-gray-700 dark:text-gray-200">
          <span className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAllLocations}
              onChange={() => onChange({ ...filters, locations: [] })}
              className="h-4 w-4 cursor-pointer accent-primary-500"
            />
            All locations
          </span>
          <span className="text-caption text-gray-400">{totalCount}</span>
        </label>
        {locations.map((location) => (
          <label
            key={location}
            className="flex cursor-pointer items-center justify-between text-body-sm text-gray-700 dark:text-gray-200"
          >
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.locations.includes(location)}
                onChange={() => toggleLocation(location)}
                className="h-4 w-4 cursor-pointer accent-primary-500"
              />
              {location}
            </span>
            <span className="text-caption text-gray-400">
              {counts.locations[location] ?? 0}
            </span>
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
        <p className="text-caption font-semibold text-gray-700 dark:text-gray-300">
          Date Modified
        </p>
        {dateOptions.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 text-body-sm text-gray-700 dark:text-gray-200"
          >
            <input
              type="radio"
              name="dateModified"
              checked={filters.dateModified === option.value}
              onChange={() => onChange({ ...filters, dateModified: option.value })}
              className="h-4 w-4 cursor-pointer accent-primary-500"
            />
            {option.label}
          </label>
        ))}
        <label className="flex cursor-pointer items-center gap-2 text-body-sm text-gray-400 dark:text-gray-600">
          <input type="radio" name="dateModified" disabled className="h-4 w-4" />
          Custom range
        </label>
      </div>
    </div>
  );
}

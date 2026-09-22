import type { SearchResult } from "../search.utils";
import { formatBytes, formatRelativeTime } from "@/features/explorer/explorer.utils";
import { FolderIcon, FileIcon } from "@/components/ui/FileFolderIcon";

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  onNavigate: (result: SearchResult) => void;
}

function MenuDotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const parts: { text: string; isMatch: boolean }[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const matchIndex = lowerText.indexOf(lowerQuery, cursor);
    if (matchIndex === -1) {
      parts.push({ text: text.slice(cursor), isMatch: false });
      break;
    }
    if (matchIndex > cursor) {
      parts.push({ text: text.slice(cursor, matchIndex), isMatch: false });
    }
    parts.push({
      text: text.slice(matchIndex, matchIndex + query.length),
      isMatch: true,
    });
    cursor = matchIndex + query.length;
  }

  return parts.map((part, i) =>
    part.isMatch ? (
      <mark key={i} className="rounded bg-warning/40 text-inherit">
        {part.text}
      </mark>
    ) : (
      <span key={i}>{part.text}</span>
    )
  );
}

export default function SearchResults({
  results,
  query,
  onNavigate,
}: SearchResultsProps) {
  return (
    <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
      {results.map((result) => {
        const { node } = result;
        const isFolder = node.type === "folder";
        const meta = isFolder
          ? `Folder · Modified ${formatRelativeTime(node.updatedAt)}`
          : `Text File · ${formatBytes(node.content.length)} · Modified ${formatRelativeTime(node.updatedAt)}`;

        return (
          <button
            key={node.id}
            type="button"
            onClick={() => onNavigate(result)}
            className="flex w-full cursor-pointer items-start gap-4 px-2 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <div className="mt-0.5 shrink-0">
              {isFolder ? <FolderIcon /> : <FileIcon />}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-body-sm font-medium text-gray-900 dark:text-gray-50">
                {highlightMatch(node.name, query)}
              </p>
              <p className="truncate text-caption text-gray-500 dark:text-gray-400">
                {result.path}
              </p>
              <p className="mt-1 truncate text-caption text-gray-400 dark:text-gray-500">
                {highlightMatch(result.snippet, query)}
              </p>
            </div>

            <div className="hidden shrink-0 text-right text-caption text-gray-500 dark:text-gray-400 sm:block">
              {meta}
            </div>

            <span className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <MenuDotsIcon />
            </span>
          </button>
        );
      })}
    </div>
  );
}

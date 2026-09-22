"use client";

import { useState } from "react";

export interface TreeFolder {
  id: string;
  name: string;
  children: TreeFolder[];
}

interface FolderTreeItemProps {
  folder: TreeFolder;
  depth: number;
  selectedFolderId: string;
  onSelect: (folderId: string) => void;
}

function ChevronIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

export default function FolderTreeItem({
  folder,
  depth,
  selectedFolderId,
  onSelect,
}: FolderTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(depth === 0);
  const hasChildren = folder.children.length > 0;
  const isSelected = folder.id === selectedFolderId;

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          onSelect(folder.id);
          if (hasChildren) setIsExpanded(true);
        }}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        className={`flex items-center gap-1.5 rounded-md py-1.5 pr-2 text-body-sm cursor-pointer ${
          isSelected
            ? "bg-primary-500 text-white"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }`}
      >
        <span
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setIsExpanded((v) => !v);
          }}
          className={`flex h-4 w-4 items-center justify-center ${
            hasChildren ? "" : "invisible"
          }`}
        >
          <ChevronIcon isExpanded={isExpanded} />
        </span>
        <span className={isSelected ? "text-white" : "text-gray-400"}>
          <FolderIcon />
        </span>
        <span className="truncate">{folder.name}</span>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {folder.children.map((child) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              depth={depth + 1}
              selectedFolderId={selectedFolderId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

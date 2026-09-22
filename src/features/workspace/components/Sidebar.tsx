"use client";

import Image from "next/image";
import { useAppSelector } from "@/store/hooks";
import Dropdown from "@/components/ui/Dropdown";
import FolderTree from "@/features/explorer/components/FolderTree";

function ExplorerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function SearchNavIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function RecentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  );
}

function StarredIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
    </svg>
  );
}

function TrashNavIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

const navItems = [
  { id: "explorer", label: "Explorer", icon: ExplorerIcon },
  { id: "search", label: "Search", icon: SearchNavIcon },
  { id: "recent", label: "Recent", icon: RecentIcon },
  { id: "starred", label: "Starred", icon: StarredIcon },
  { id: "trash", label: "Trash", icon: TrashNavIcon },
];

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

interface SidebarProps {
  activeNav: string;
  onNavChange: (navId: string) => void;
  onCreateFolder: () => void;
  onCreateWorkspace: () => void;
  onRenameFolder: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onSelectFolder: (folderId: string) => void;
  onSwitchWorkspace: (workspaceId: string) => void;
}

export default function Sidebar({
  activeNav,
  onNavChange,
  onCreateFolder,
  onCreateWorkspace,
  onRenameFolder,
  onDeleteFolder,
  onSelectFolder,
  onSwitchWorkspace,
}: SidebarProps) {
  const workspaces = useAppSelector((state) => state.workspace.workspaces);
  const activeWorkspaceId = useAppSelector(
    (state) => state.workspace.activeWorkspaceId
  );

  const workspaceOptions = Object.values(workspaces).map((workspace) => ({
    value: workspace.id,
    label: workspace.name,
  }));

  const activeWorkspaceName = workspaces[activeWorkspaceId]?.name ?? "Workspace";

  return (
    <aside className="flex h-full min-h-0 w-64 shrink-0 flex-col gap-4 bg-gray-900 p-4 text-gray-300">
      <div className="flex items-center gap-2.5">
        <Image
          src="/logo-icon.png"
          alt="Webbly Workspace logo"
          width={36}
          height={36}
          className="shrink-0 rounded-lg"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-body-sm font-semibold text-white">
            Webbly Workspace
          </h1>
          <p className="truncate text-caption text-gray-400">
            Explore · Create · Build
          </p>
        </div>
        <span className="text-gray-500">
          <ChevronDownIcon />
        </span>
      </div>

      <Dropdown
        value={activeWorkspaceId}
        onChange={onSwitchWorkspace}
        options={workspaceOptions.map((option) => ({
          ...option,
          icon: (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-500 text-caption font-semibold text-white">
              {getInitials(option.label)}
            </span>
          ),
        }))}
        triggerClassName="flex w-full items-center gap-2.5 rounded-md bg-gray-800 px-3 py-2.5 text-body-sm text-white hover:bg-gray-700"
        hideDefaultChevron
        trigger={
          <>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-500 text-caption font-semibold text-white">
              {getInitials(activeWorkspaceName)}
            </span>
            <span className="flex-1 truncate text-left">{activeWorkspaceName}</span>
            <span className="text-gray-500">
              <ChevronDownIcon />
            </span>
          </>
        }
        menuClassName="absolute left-0 z-40 mt-1 min-w-full overflow-hidden rounded-md border border-gray-800 bg-gray-800 shadow-lg"
        optionClassName={(isSelected) =>
          `flex w-full items-center gap-2 px-3 py-2 text-left text-body-sm whitespace-nowrap ${
            isSelected
              ? "bg-gray-700 text-white"
              : "text-gray-300 hover:bg-gray-700 hover:text-white"
          }`
        }
        footer={
          <button
            type="button"
            onClick={onCreateWorkspace}
            className="flex w-full items-center gap-2 border-t border-gray-700 px-3 py-2 text-left text-body-sm text-primary-400 hover:bg-gray-700"
          >
            <PlusIcon />
            Create Workspace
          </button>
        }
      />

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavChange(item.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-body-sm ${
                activeNav === item.id
                  ? "bg-primary-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="flex min-h-0 flex-1 flex-col gap-1 border-t border-gray-800 pt-3">
        <div className="flex shrink-0 items-center justify-between px-1">
          <p className="text-caption font-medium uppercase tracking-wide text-gray-500">
            Projects
          </p>
          <button
            type="button"
            onClick={onCreateFolder}
            aria-label="Create folder"
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-gray-500 hover:bg-gray-800 hover:text-white"
          >
            <PlusIcon />
          </button>
        </div>
        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto">
          <FolderTree
            onSelect={onSelectFolder}
            onRename={onRenameFolder}
            onDelete={onDeleteFolder}
          />
        </div>
      </div>

      <div className="sticky bottom-0 flex shrink-0 flex-col gap-3 border-t border-gray-800 bg-gray-900 pt-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-caption text-gray-400">
            <span>Storage</span>
            <span>2.4 GB of 10 GB used</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
            <div className="h-full w-1/4 rounded-full bg-primary-500" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-body-sm font-medium text-white">
            B
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-body-sm font-medium text-white">
              Belal Hossain
            </span>
            <span className="truncate text-caption text-gray-500">
              belalhossain22000@gmail.com
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

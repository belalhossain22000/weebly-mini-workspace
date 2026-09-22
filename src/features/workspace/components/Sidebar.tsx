"use client";

import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { switchWorkspace } from "@/features/workspace/workspaceSlice";
import Dropdown from "@/components/ui/Dropdown";
import FolderTree from "@/features/explorer/components/FolderTree";

const navItems = [
  { id: "explorer", label: "Explorer" },
  { id: "search", label: "Search" },
  { id: "recent", label: "Recent" },
  { id: "starred", label: "Starred" },
  { id: "trash", label: "Trash" },
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

interface SidebarProps {
  activeNav: string;
  onNavChange: (navId: string) => void;
}

export default function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  const dispatch = useAppDispatch();
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
    <aside className="flex h-full w-64 flex-col gap-4 bg-gray-900 p-4 text-gray-300">
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
        onChange={(workspaceId) => dispatch(switchWorkspace({ workspaceId }))}
        options={workspaceOptions}
        triggerClassName="flex w-full items-center gap-2 rounded-md bg-gray-800 px-2 py-1.5 text-body-sm text-white hover:bg-gray-700"
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
      />

      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavChange(item.id)}
            className={`rounded-md px-2 py-1.5 text-left text-body-sm ${
              activeNav === item.id
                ? "bg-primary-500 text-white"
                : "hover:bg-gray-800 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex flex-1 flex-col gap-1 border-t border-gray-800 pt-3">
        <p className="text-caption font-medium uppercase tracking-wide text-gray-500">
          Workspace
        </p>
        <div className="flex-1 overflow-y-auto">
          <FolderTree />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-800 pt-3">
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

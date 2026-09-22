"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import CreateItemModal from "@/features/workspace-actions/components/CreateItemModal";
import Button from "@/components/ui/Button";

export default function Home() {
  const [isOpen, setIsOpen] = useState(true);
  const rootFolderId = useAppSelector(
    (state) =>
      state.workspace.workspaces[state.workspace.activeWorkspaceId]
        ?.rootFolderId
  );

  if (!rootFolderId) return null;

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 p-10 dark:bg-black">
      <Button onClick={() => setIsOpen(true)}>Open Create Modal</Button>
      <CreateItemModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        parentId={rootFolderId}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { renameNode } from "@/features/workspace/workspaceSlice";
import { validateItemName } from "@/features/explorer/explorer.utils";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
}

function FolderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#2563EB">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
      <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

export default function RenameModal({ isOpen, onClose, nodeId }: RenameModalProps) {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector((state) => state.workspace.nodes);
  const node = nodes[nodeId];
  const [name, setName] = useState(node?.name ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && node) {
      setName(node.name);
      setError(null);
    }
  }, [isOpen, node]);

  if (!node) return null;

  function handleClose() {
    setError(null);
    onClose();
  }

  function handleSubmit() {
    if (!node.parentId) {
      handleClose();
      return;
    }

    const validationError = validateItemName(nodes, node.parentId, name, node.id);
    if (validationError) {
      setError(validationError);
      return;
    }

    dispatch(renameNode({ nodeId: node.id, name: name.trim() }));
    handleClose();
  }

  const isFolder = node.type === "folder";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isFolder ? "Rename Folder" : "Rename File"}
      description={`Enter a new name for this ${node.type}.`}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Rename
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-md bg-gray-50 p-3 dark:bg-gray-800">
          {isFolder ? <FolderIcon /> : <FileIcon />}
          <div className="flex flex-col">
            <span className="text-caption text-gray-500 dark:text-gray-400">
              Current name
            </span>
            <span className="text-body-sm font-medium text-gray-900 dark:text-gray-100">
              {node.name}
            </span>
          </div>
        </div>

        <Input
          autoFocus
          placeholder="New name"
          value={name}
          error={error ?? undefined}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
      </div>
    </Modal>
  );
}

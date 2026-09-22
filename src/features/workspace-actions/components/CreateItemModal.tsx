"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createNode } from "@/features/workspace/workspaceSlice";
import { validateItemName } from "@/features/explorer/explorer.utils";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { FolderIcon, FileIcon } from "@/components/ui/FileFolderIcon";

type Step = "choose" | "folder" | "file";

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: string;
}

export default function CreateItemModal({
  isOpen,
  onClose,
  parentId,
}: CreateItemModalProps) {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector((state) => state.workspace.nodes);
  const [step, setStep] = useState<Step>("choose");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setStep("choose");
    setName("");
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    const validationError = validateItemName(nodes, parentId, name);
    if (validationError) {
      setError(validationError);
      return;
    }

    dispatch(
      createNode({
        parentId,
        name: name.trim(),
        type: step === "folder" ? "folder" : "file",
      })
    );
    handleClose();
  }

  if (step === "choose") {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Create New"
        description="Choose what you want to create in this folder."
      >
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setStep("folder")}
            className="flex items-center gap-3 rounded-md border border-gray-200 p-3 text-left hover:border-primary-500 hover:bg-primary-50 dark:border-gray-700 dark:hover:bg-primary-500/10"
          >
            <FolderIcon size={32} />
            <div>
              <p className="text-body-sm font-medium text-gray-900 dark:text-gray-50">
                New Folder
              </p>
              <p className="text-caption text-gray-500 dark:text-gray-400">
                Create a new folder to organize your files
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStep("file")}
            className="flex items-center gap-3 rounded-md border border-gray-200 p-3 text-left hover:border-primary-500 hover:bg-primary-50 dark:border-gray-700 dark:hover:bg-primary-500/10"
          >
            <FileIcon size={32} />
            <div>
              <p className="text-body-sm font-medium text-gray-900 dark:text-gray-50">
                New Text File
              </p>
              <p className="text-caption text-gray-500 dark:text-gray-400">
                Create a new text file to write and edit
              </p>
            </div>
          </button>
        </div>
      </Modal>
    );
  }

  const isFolder = step === "folder";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isFolder ? "Create New Folder" : "Create New Text File"}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isFolder ? "Create Folder" : "Create File"}
          </Button>
        </>
      }
    >
      <Input
        autoFocus
        placeholder={isFolder ? "Folder name" : "File name"}
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
    </Modal>
  );
}

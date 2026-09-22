"use client";

import { useRef, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { getBreadcrumbPath, formatBytes, formatDateTime } from "@/features/explorer/explorer.utils";
import { streamAiEdit, type AiAction } from "@/lib/gemini";
import LineNumberedTextarea from "./LineNumberedTextarea";
import Breadcrumbs from "@/features/explorer/components/Breadcrumbs";
import Button from "@/components/ui/Button";
import { FileIcon } from "@/components/ui/FileFolderIcon";

/* ─── Icon helpers ────────────────────────────────────────────────────────── */

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function RenameActionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
    </svg>
  );
}

function DeleteActionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function AcceptIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface AiActionBtn {
  id: AiAction;
  label: string;
  emoji: string;
}

const AI_ACTIONS: AiActionBtn[] = [
  { id: "improve", label: "Improve Writing", emoji: "✨" },
  { id: "fix_grammar", label: "Fix Grammar", emoji: "🔧" },
  { id: "summarize", label: "Summarize", emoji: "📝" },
  { id: "expand", label: "Expand", emoji: "📖" },
  { id: "make_shorter", label: "Make Shorter", emoji: "✂️" },
];

interface TextEditorProps {
  fileId: string;
  draftContent: string;
  onDraftChange: (content: string) => void;
  isDirty: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onRequestClose: () => void;
  onNavigate: (folderId: string) => void;
  onRename: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function TextEditor({
  fileId,
  draftContent,
  onDraftChange,
  isDirty,
  onSave,
  onDiscard,
  onRequestClose,
  onNavigate,
  onRename,
  onDelete,
}: TextEditorProps) {
  const nodes = useAppSelector((state) => state.workspace.nodes);
  const workspace = useAppSelector(
    (state) => state.workspace.workspaces[state.workspace.activeWorkspaceId]
  );

  const [aiOpen, setAiOpen] = useState(false);
  const [aiStreaming, setAiStreaming] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiError, setAiError] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [activeAction, setActiveAction] = useState<AiAction | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef(false);

  const file = nodes[fileId];
  if (!file || file.type !== "file" || !workspace) return null;

  const breadcrumbPath = file.parentId
    ? [...getBreadcrumbPath(nodes, file.parentId, workspace.rootFolderId), { id: file.id, name: file.name }]
    : [{ id: file.id, name: file.name }];

  const wordCount = draftContent.trim() ? draftContent.trim().split(/\s+/).length : 0;
  const lineCount = draftContent.split("\n").length;

  /* ── AI helpers ── */
  async function runAi(action: AiAction, prompt?: string) {
    // For quick actions we need existing content to work with.
    // Custom prompt can run on an empty document to generate fresh content.
    if (action !== "custom" && !draftContent.trim()) {
      setAiError("The document is empty. Write something first!");
      return;
    }
    if (action === "custom" && !prompt?.trim()) {
      setAiError("Please enter a prompt.");
      return;
    }
    setAiResult("");
    setAiError("");
    setActiveAction(action);
    setAiStreaming(true);
    abortRef.current = false;

    let accumulated = "";

    await streamAiEdit({
      action,
      content: draftContent,
      customPrompt: prompt,
      onChunk: (chunk) => {
        if (abortRef.current) return;
        accumulated += chunk;
        setAiResult(accumulated);
      },
      onDone: (full) => {
        if (!abortRef.current) setAiResult(full);
        setAiStreaming(false);
      },
      onError: (err) => {
        setAiError(err);
        setAiStreaming(false);
      },
    });
  }

  function stopStreaming() {
    abortRef.current = true;
    setAiStreaming(false);
  }

  function acceptResult() {
    if (aiResult) {
      onDraftChange(aiResult);
      setAiResult("");
      setActiveAction(null);
    }
  }

  async function copyResult() {
    if (aiResult) {
      await navigator.clipboard.writeText(aiResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function resetAi() {
    setAiResult("");
    setAiError("");
    setActiveAction(null);
    setCustomPrompt("");
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3 dark:border-gray-800">
        <Breadcrumbs
          rootId={workspace.rootFolderId}
          items={breadcrumbPath}
          onNavigate={(id) => {
            if (id === file.id) return;
            onNavigate(id);
          }}
        />
        <div className="flex items-center gap-2">
          {isDirty && (
            <Button variant="ghost" onClick={onDiscard}>
              Discard
            </Button>
          )}
          <Button variant="primary" onClick={onSave} disabled={!isDirty}>
            Save
          </Button>
        </div>
      </div>

      {/* ── File tab bar ── */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 dark:border-gray-800">
        <div className="flex items-center gap-2 border-b-2 border-primary-500 px-3 py-2">
          <FileIcon size={20} />
          <span className="text-body-sm text-gray-800 dark:text-gray-100">{file.name}</span>
          <button
            type="button"
            onClick={onRequestClose}
            aria-label="Close file"
            className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <CloseIcon />
          </button>
        </div>

        {/* AI toggle */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => { setAiOpen((v) => !v); resetAi(); }}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-caption font-medium transition-colors ${
              aiOpen
                ? "border-primary-500 bg-primary-50 text-primary-600 dark:border-primary-500/50 dark:bg-primary-500/10 dark:text-primary-400"
                : "border-gray-200 text-gray-500 hover:border-primary-400 hover:text-primary-600 dark:border-gray-700 dark:hover:border-primary-500 dark:hover:text-primary-400"
            }`}
          >
            <SparklesIcon />
            AI
          </button>

          {isDirty && (
            <span className="flex items-center gap-1 text-caption text-warning ml-2">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
              Unsaved
            </span>
          )}
        </div>
      </div>

      {/* ── Main content area ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left: editor */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <LineNumberedTextarea value={draftContent} onChange={onDraftChange} />
        </div>

        {/* Right: AI panel */}
        {aiOpen && (
          <div className="flex w-80 shrink-0 flex-col border-l border-gray-100 dark:border-gray-800">
            {/* AI panel header */}
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
              <span className="text-primary-500">
                <SparklesIcon />
              </span>
              <span className="text-body-sm font-semibold text-gray-900 dark:text-gray-50">
                AI Assistant
              </span>
              <span className="ml-auto rounded-full bg-primary-50 px-2 py-0.5 text-caption font-medium text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                Gemini
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              {/* Quick action buttons */}
              <div>
                <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Quick Actions
                </p>
                <div className="flex flex-col gap-1">
                  {AI_ACTIONS.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      disabled={aiStreaming}
                      onClick={() => runAi(action.id)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-body-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        activeAction === action.id && aiStreaming
                          ? "bg-primary-50 font-medium text-primary-600 dark:bg-primary-500/15 dark:text-primary-400"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-base">{action.emoji}</span>
                      {action.label}
                      {activeAction === action.id && aiStreaming && (
                        <span className="ml-auto flex gap-0.5">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-500 [animation-delay:0ms]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-500 [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-500 [animation-delay:300ms]" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom prompt */}
              <div>
                <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Custom Prompt
                </p>
                <div className="flex flex-col gap-2">
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Ask AI anything about your text…"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-body-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-primary-500 dark:focus:ring-primary-900/40"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        if (customPrompt.trim()) {
                          runAi("custom", customPrompt);
                          setCustomPrompt("");
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={!customPrompt.trim() || aiStreaming}
                    onClick={() => {
                      runAi("custom", customPrompt);
                      setCustomPrompt("");
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-body-sm font-medium text-white transition-colors hover:bg-primary-600 active:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <SendIcon />
                    Run (⌘↵)
                  </button>
                </div>
              </div>

              {/* Stop streaming */}
              {aiStreaming && (
                <button
                  type="button"
                  onClick={stopStreaming}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-body-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <StopIcon />
                  Stop
                </button>
              )}

              {/* Error */}
              {aiError && (
                <div className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800/60 dark:bg-red-950/20">
                  <div className="flex items-start gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-error">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="flex-1 text-caption leading-relaxed text-error">
                      {aiError}
                    </p>
                    <button
                      type="button"
                      onClick={resetAi}
                      aria-label="Dismiss error"
                      className="shrink-0 rounded p-0.5 text-error/60 hover:bg-red-100 hover:text-error dark:hover:bg-red-900/40"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                </div>
              )}

              {/* AI result */}
              {aiResult && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-caption font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Result
                    </p>
                    {!aiStreaming && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={copyResult}
                          title="Copy result"
                          className="flex items-center gap-1 rounded px-2 py-1 text-caption text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <CopyIcon />
                          {copied ? "Copied!" : "Copy"}
                        </button>
                        <button
                          type="button"
                          onClick={resetAi}
                          title="Dismiss"
                          className="rounded px-2 py-1 text-caption text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <CloseIcon />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="max-h-56 overflow-y-auto rounded-lg border border-primary-100 bg-primary-50/40 p-3 text-body-sm text-gray-800 dark:border-primary-900/40 dark:bg-primary-950/20 dark:text-gray-200">
                    <pre className="whitespace-pre-wrap font-sans">{aiResult}</pre>
                    {aiStreaming && (
                      <span className="inline-block h-4 w-0.5 animate-pulse bg-primary-500" />
                    )}
                  </div>

                  {!aiStreaming && (
                    <button
                      type="button"
                      onClick={acceptResult}
                      className="flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-body-sm font-medium text-white transition-colors hover:bg-primary-600 active:bg-primary-700"
                    >
                      <AcceptIcon />
                      Accept &amp; Replace
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Info footer */}
            <div className="border-t border-gray-100 px-4 py-2 dark:border-gray-800">
              <p className="text-caption text-gray-400">
                Powered by Gemini Flash
              </p>
            </div>
          </div>
        )}

        {/* Right sidebar: file info (hidden when AI panel is open) */}
        {!aiOpen && (
          <div className="flex w-72 shrink-0 flex-col gap-6 overflow-y-auto border-l border-gray-100 p-4 dark:border-gray-800">
            <div>
              <p className="mb-2 text-caption font-semibold text-gray-500 dark:text-gray-400">
                File Information
              </p>
              <div className="flex items-center gap-3 rounded-md bg-gray-50 p-3 dark:bg-gray-800">
                <FileIcon size={36} />
                <div>
                  <p className="text-body-sm font-medium text-gray-900 dark:text-gray-50">
                    {file.name}
                  </p>
                  <p className="text-caption text-gray-500 dark:text-gray-400">Text File</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-body-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Size</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {formatBytes(file.content.length)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Created</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {formatDateTime(file.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Modified</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {formatDateTime(file.updatedAt)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 dark:text-gray-400">Path</span>
                <span className="truncate text-caption text-gray-700 dark:text-gray-300">
                  {breadcrumbPath.map((item) => item.name).join("/")}
                </span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-caption font-semibold text-gray-500 dark:text-gray-400">
                Actions
              </p>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => onRename(file.id)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-body-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <RenameActionIcon />
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(file.id)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-body-sm text-error hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <DeleteActionIcon />
                  Delete
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-caption font-semibold text-gray-500 dark:text-gray-400">
                Quick Info
              </p>
              <div className="flex flex-col gap-2 text-body-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Characters</span>
                  <span className="text-gray-900 dark:text-gray-100">{draftContent.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Lines</span>
                  <span className="text-gray-900 dark:text-gray-100">{lineCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Words</span>
                  <span className="text-gray-900 dark:text-gray-100">{wordCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

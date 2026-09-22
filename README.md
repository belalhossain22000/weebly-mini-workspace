# Webbly Workspace — Mini Workspace Explorer

A browser-based file manager built with Next.js and TypeScript. Users can create, navigate, search, edit, rename, and delete folders and text files inside one or more isolated workspaces — all persisted locally in the browser.

## How to Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # ESLint
```

### Optional: AI writing assistant

The text editor includes an optional AI assistant (improve/summarize/fix grammar/custom prompt) powered by Gemini. It is not required for the core file-manager functionality. To enable it, add a Gemini API key to `.env.local`:

```
GEMINI_API_KEY=your_key_here
```

The key is only ever read on the server (`src/app/api/ai/route.ts`); the browser never receives it.

## Project Structure

The app uses a **feature-based** structure — code is grouped by domain rather than by file type.

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Entry point — renders WorkspaceLayout
│   ├── layout.tsx               # Root layout
│   ├── providers.tsx            # Redux Provider, localStorage sync, hydration guard, dark-mode sync
│   └── api/ai/route.ts          # Server-side streaming route for the AI assistant
│
├── features/
│   ├── workspace/                # Core domain: nodes, workspaces, CRUD reducers
│   │   ├── workspace.types.ts    # FolderNode / FileNode / Workspace types
│   │   ├── workspaceSlice.ts     # All create/rename/delete/star/trash reducers
│   │   └── components/           # WorkspaceLayout, Sidebar, MainPanel, Header, Recent/Starred/Trash views
│   │
│   ├── explorer/                 # Folder tree, breadcrumbs, file/folder cards
│   ├── editor/                   # Text editor (view/edit/save + Preview + AI panel)
│   ├── search/                   # Workspace-wide search, filters, results
│   ├── workspace-actions/        # Create/Rename modals, validation
│   └── ui/                       # Dark mode slice
│
├── components/
│   ├── ui/                       # Reusable primitives: Button, Input, Modal, Dropdown
│   └── shared/                   # EmptyState, ConfirmDialog
│
├── store/                        # Redux store + typed hooks
└── lib/                          # localStorage persistence, client-hydration helper, Gemini client wrapper
```

## State Management

**Redux Toolkit**, with one slice (`workspaceSlice`) owning the entire file-system domain, plus a small `uiSlice` for dark mode.

- All reads go through typed selectors (`useAppSelector`) and all writes through dispatched actions (`useAppDispatch`) — no component mutates the tree directly.
- UI-only state that doesn't need to be shared or persisted (which modal is open, the current draft text in the editor, which nav item is active) stays as local `useState` in `WorkspaceLayout`, not in Redux.
- The whole `workspace` slice is serialized to `localStorage` on every change and rehydrated on load (see `Providers.tsx` / `WorkspacePersistence`), with a hydration guard so the server-rendered HTML and the first client render always match (avoids React hydration mismatches).

## File-System Data Structure

Rather than a nested tree (`{ children: [...] }`), the workspace is stored as a **flat normalized map**:

```ts
interface BaseNode {
  id: string;
  name: string;
  type: "folder" | "file";
  parentId: string | null;
  workspaceId: string;
  isStarred: boolean;
  isDeleted: boolean;
  deletedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

interface FolderNode extends BaseNode {
  type: "folder";
  childrenIds: string[];
}

interface FileNode extends BaseNode {
  type: "file";
  content: string;
}

type NodesById = Record<string, FolderNode | FileNode>;
```

Every node lives in one `nodes: NodesById` object, linked by `parentId` (up) and `childrenIds` (down). The **UI tree is rebuilt recursively from this flat map** when rendering the sidebar (`FolderTree` walks `childrenIds` starting from the workspace root).

**Why flat instead of nested:** renaming, deleting, or moving a node in a nested structure means finding and cloning every ancestor down to that node (or writing a recursive tree-walker for every mutation). With a flat map, any node is an O(1) lookup by `id`, and a mutation only touches that node plus its immediate parent's `childrenIds` — no recursive tree-copying, no risk of stale references after a rename several levels deep.

Recursion is still used, just for the two things that are inherently tree-shaped:
- **Rendering** the sidebar (`FolderTreeItem` renders itself for each child)
- **Deleting a folder's contents** (`deleteNode` recursively collects all descendant ids before removing them, so deleting a folder always deletes everything nested inside it)

Multiple workspaces are supported by giving every node and folder a `workspaceId`; every reducer checks that a node belongs to the currently active workspace before reading or mutating it, so switching workspaces can never leak or delete another workspace's data.

## Important Implementation Decisions

- **Soft-delete / Trash**: deleting doesn't remove data immediately — it sets `isDeleted: true` and `deletedAt`, so items can be restored. "Empty Trash" is the only action that permanently removes nodes, and it only clears the *active* workspace's trash.
- **Deleting the selected folder**: if the currently selected folder (or one of its ancestors) gets deleted, `selectedFolderId` falls back to the deleted node's direct parent (or the workspace root, if it had none), per the spec's requirement to navigate to "an appropriate parent folder."
- **Validation**: creating or renaming a file/folder rejects empty/whitespace-only names and duplicate names *within the same parent folder* (case-insensitive), with inline error messages instead of blocking alerts.
- **Unsaved editor changes**: navigating away from a dirty file (via sidebar, breadcrumb, search, or switching workspace) is intercepted by a single `guardedRun()` wrapper in `WorkspaceLayout` that queues the navigation and shows a Save/Discard/Cancel prompt instead of silently discarding edits. The same dirty state also triggers a native `beforeunload` warning on tab close/refresh.
- **Search**: recursively walks the active workspace's node tree, matching against both name and file content, and returns each result with its full breadcrumb path so clicking a result can navigate straight to it (selecting the parent folder and, for files, opening the editor).
- **Responsive layout**: the sidebar becomes a slide-in drawer below the `md` breakpoint (opened via a hamburger button in the header), modals become bottom sheets on small screens, and list/grid item menus that would otherwise only appear on `:hover` are always visible on touch-sized screens.
- **Persistence boundary**: only the `workspace` slice (nodes + workspaces) and the dark-mode preference are persisted. Transient UI state (open modals, in-progress unsaved draft, active nav tab) intentionally resets on refresh.

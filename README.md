# Drag and Drop · Mutation · Intersection — POC

A React + TypeScript POC showing three browser APIs working together inside a Kanban board: **Drag and Drop**, **Mutation Observer**, and **Intersection Observer**. A live event log makes the behavior of each API visible in real time.

## How to run

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173` (or the next free port).

## What the app does

- A Kanban board with 3 columns and ~20 cards.
- Drag cards between columns.
- The target column turns blue while you are dragging over it.
- Each card shows a green dot when it is visible in the viewport, and fades when it is not.
- A side panel explains each API and streams color-coded events as you interact.

## The three APIs, one line each

| API | Role in this app |
|---|---|
| **Drag and Drop** | Moves the card between columns and paints the target column blue during the drag |
| **Mutation Observer** | Logs every DOM change on the board, regardless of who caused it |
| **Intersection Observer** | Lights up the green dot and applies the fade depending on whether the card is visible |

> **The three are independent.** Strip out both observers and drag-and-drop still works 100%. The observers exist to make what happens **visible**, not to make the app work.

## Why these three together?

All three solve the classic web question — "how do I react to something in the DOM?" — but with different philosophies:

- **Drag and Drop** is a **synchronous, event-based** API from the 2000s (originally IE5). It is a protocol: the source writes into `dataTransfer`, the target must accept by calling `preventDefault()`.
- **Mutation Observer** and **Intersection Observer** are **asynchronous**, observer-pattern APIs. You declare what you care about; the browser batches notifications and delivers them off the main thread.

Mutation Observer replaced the old *Mutation Events* (synchronous, ~5–10x slower on mutation-heavy pages). Intersection Observer replaced the `scroll listener + getBoundingClientRect` pattern (synchronous, layout-thrashing). Both represent the platform's shift toward "lazy observers" — the same philosophy later applied to ResizeObserver and PerformanceObserver.

## Key concepts per API

### Drag and Drop API

**Event protocol**: `dragstart` → `dragover` → `drop` → `dragend`.

**Two non-obvious rules**:

1. The source element must have `draggable="true"` (`<img>` and `<a href>` are historical exceptions).
2. The drop target **must call `preventDefault()` inside `dragover`** — otherwise the browser rejects the drop and the `drop` event never fires.

**Classic gotcha**: `dragleave` also fires when the cursor enters child elements of the target. Defense: check `e.relatedTarget` (see [Column.tsx](src/components/Column.tsx)).

**Limitation**: no touch support. The `drag*` events do not fire on touch devices. For mobile-first apps, use Pointer Events directly or a library like `dnd-kit`.

### Mutation Observer API

Observes DOM mutations (children, attributes, text) **asynchronously**, in batches, off the main thread.

```ts
const observer = new MutationObserver((records) => { ... });
observer.observe(target, { childList: true, subtree: true });
// Always:
observer.disconnect();
```

**Why it exists**: it replaces *Mutation Events* (deprecated), which were synchronous and fired one event per node changed. On mutation-heavy pages, that absolutely killed performance. The observer API fixes this by delivering records in batch as a microtask.

**Where it shines**: reacting to changes you do **not** control — third-party scripts, browser extensions, E2E tests ("wait until this element exists"), legacy library integration.

**Caveat**: it cannot cancel mutations. It is purely observational.

### Intersection Observer API

Asynchronously detects when an element enters or leaves the visible area, measured against a scrolling ancestor (or the viewport).

```ts
const io = new IntersectionObserver((entries) => { ... }, {
  root: null,             // viewport by default
  rootMargin: '0px',      // grow or shrink the root's box
  threshold: [0, 0.5, 1], // when to fire (intersection ratios)
});
io.observe(element);
```

**Why it exists**: it replaces the `scroll listener + getBoundingClientRect()` pattern, which was synchronous and caused layout thrashing. IntersectionObserver runs on the compositor and only invokes your callback when the intersection state actually changes.

**Worth noting in this POC**: the observer measures against the viewport (`root: null`), but `intersectionRatio` **respects clipping ancestors** automatically. That is why scrolling a card out of the column's visible area (`overflow-y: auto`) logs 0% even though we never pass the column as `root`. The spec defines the intersection rect as `target ∩ all ancestor clip rects ∩ root rect`.

**Caveat**: the first callback fires shortly after `observe()` reporting the initial state — it is a snapshot, not a delta.

## Code map

```
src/
├── App.tsx                              # Layout + EventLogProvider
├── main.tsx, index.css                  # React boot + CSS reset
├── types.ts                             # CardData, ColumnData, BoardData, LogEvent
├── data/
│   └── initialBoard.ts                  # Initial Kanban state
├── context/
│   └── EventLogContext.tsx              # Shared log(api, message)
├── hooks/
│   ├── useMutationObserver.ts           # Generic hook — Mutation Observer
│   └── useIntersectionObserver.ts       # Generic hook — Intersection Observer
└── components/
    ├── Board.tsx                        # Board state + MutationObserver on the container
    ├── Column.tsx                       # Drop target (dragover/dragleave/drop)
    ├── Card.tsx                         # Drag source (dragstart/dragend) + IntersectionObserver
    ├── InfoPanel.tsx                    # Per-API didactic content (accordion)
    └── EventLog.tsx                     # Color-coded live event stream
```

### File responsibilities

| File | Drag and Drop | Mutation | Intersection |
|---|:-:|:-:|:-:|
| `Card.tsx` | source | — | subscriber |
| `Column.tsx` | target | — | — |
| `Board.tsx` | persists the result in React state | subscriber | — |
| `hooks/useMutationObserver.ts` | — | generic hook | — |
| `hooks/useIntersectionObserver.ts` | — | — | generic hook |

## Talking points for a presentation

1. **Protocol, not just events**: Drag and Drop only works when the source writes to `dataTransfer` AND the target calls `preventDefault()` inside `dragover`. This rule trips up almost everyone the first time.
2. **Observers are the evolutionary pattern**: MutationObserver replaced Mutation Events because synchronous was too expensive. IntersectionObserver replaced scroll+getBoundingClientRect+throttle for the same reason.
3. **Cleanup matters**: every observer needs `.disconnect()`. Without it you leak memory — and in React StrictMode the leak is already visible in development.
4. **`root` vs. clipping ancestors**: IntersectionObserver respects ancestor overflow automatically. You only need to set `root` explicitly when you want `rootMargin` measured against a specific container, or to change the bounding "frame" of the measure.
5. **The three APIs are independent**: the POC composes them for didactic purposes, but each one stands alone. You can build a full Kanban using only Drag and Drop — the observers are instrumentation, not core functionality.

## Stack

- Vite 6 + React 18 + TypeScript
- CSS Modules, no styling dependencies
- No drag/drop libraries (intentionally) — only native browser APIs

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (TS check + Vite) |
| `npm run preview` | Serve the local build |
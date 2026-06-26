# react-vite-structure-1

A **Vite + React + TypeScript** starter focused on **feature-based folder organization**. It uses mocked auth, dashboard metrics, and a tasks board so you can see how files connect without a real backend.

## Quick start

```bash
npm install
npm run dev
```

```bash
npm run build   # typecheck + production bundle
npm run lint
```

---

## Folder structure (overview)

```
src/
├── main.tsx                 # App entry; mounts React
├── index.css                # Global styles
├── app/
│   ├── App.tsx              # Root shell: wraps providers
│   └── providers/           # App-wide React context (e.g. auth)
├── routes/
│   └── index.tsx            # Chooses which page to show (auth vs dashboard)
├── pages/
│   ├── AuthPage.tsx         # Composes auth feature + layout + page hooks
│   └── DashboardPage.tsx    # Composes dashboard feature + layout + page hooks
├── layout/
│   └── AppLayout.tsx        # Shared page chrome (title, subtitle, children)
├── features/                # Domain slices (co-locate UI, state, types, mocks)
│   ├── auth/
│   ├── dashboard/
│   └── tasks/
├── shared/
│   └── ui/                  # Reusable, domain-agnostic UI primitives
├── hooks/                   # Cross-cutting hooks (e.g. document title)
└── utils/                   # Pure helpers (formatting, etc.)
```

---

## Glossary: Domain vs Feature

- **Domain** = a business/problem area (for example: `auth`, `tasks`, `billing`, `orders`).
- **Feature** = a user capability inside a domain (for example in `auth`: login, signup, logout).

In many frontend codebases, folders under `features/` are often named by **domain slices** for simplicity.
So `features/auth` can contain multiple auth-related features.

In this repo:

- `features/auth` = auth domain slice (login/signup flow and auth state)
- `features/tasks` = tasks domain slice (task board and mock task data)
- `features/dashboard` = dashboard slice (metrics view and composition)

---

## Responsibilities by folder

| Folder | Responsibility |
|--------|----------------|
| **`app/`** | Application bootstrap: root `App`, global providers (context, future theme/query clients). Things that wrap the whole tree. |
| **`routes/`** | **Routing decisions**: which screen to render given auth or URL. Stays thin; no heavy UI here. |
| **`pages/`** | **Screen composition**: wires a layout, sets page-level concerns (title, metadata hooks), and mounts one or more **features**. Good place for “this is the `/login` page” mental model. |
| **`layout/`** | **Shared shells**: headers, sidebars, page wrappers used by multiple pages. |
| **`features/<name>/`** | **Everything for one domain** in one place: components, feature hooks, local types, mock API, reducer-style state. Keeps cross-feature imports obvious. |
| **`shared/ui/`** | **Design-system style primitives**: `Button`, `Input`, `Card` — reusable and not tied to “auth” or “tasks”. Prefer this over dumping all components in one flat `components/` folder when the app grows. |
| **`hooks/`** | **App-wide hooks** that are not owned by a single feature (e.g. `usePageTitle`). Feature-specific hooks stay under `features/<name>/hooks/`. |
| **`utils/`** | **Pure functions**: formatters, small helpers with no React. Keeps components thin. |

### How data flows (high level)

1. `main.tsx` → `app/App.tsx` wraps **providers** (e.g. auth).
2. `routes/index.tsx` reads auth state and picks **`AuthPage`** or **`DashboardPage`**.
3. Each **page** applies **layout** + **feature** screens (`features/auth`, `features/dashboard`, etc.).
4. **Shared UI** is imported from `shared/ui`; feature code stays under `features/`.

---

## What this project is suitable for

**Good fit**

- **Multi-area products** (auth, dashboard, settings, admin) where you want clear boundaries.
- **Teams** that want a predictable rule: “feature code lives under `features/<name>`.”
- **Scaling** without one giant `components/` folder mixing generic and domain-specific UI.
- **Learning** how feature-first structure compares to a flat `src/components` layout.

**Less necessary (simpler options)**

- **Tiny apps** (single screen, todo-only, quick prototypes): a flat `src/components` + `App.tsx` is often enough until you feel pain from mixed concerns.
- **Libraries or design systems**: those usually publish packages or a dedicated `ui/` package, not only `shared/ui` inside one app.

**This repo is not**

- A production auth or API layer (auth and data are **mocked** for demonstration).
- A prescription to use every folder in every project — **omit folders you do not need** and add them when a clear responsibility appears.

---

## Contrast: `shared/ui` vs `components/`

- **`shared/ui`** (here): signals “reusable primitives, no business rules.” Scales well with `features/`.
- **`src/components`**: common in **small** apps; fine until generic and feature-specific components pile up together.

Use whichever naming your team agrees on; consistency matters more than the exact folder name.

---

## License

Private / educational use — adjust as needed for your project.

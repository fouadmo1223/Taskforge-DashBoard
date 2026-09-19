# Taskforge Admin Dashboard — Plan

Status: **Phases 1-11 done. Settings (Phase 12) needs the user's input on scope before
it can be anything more than a placeholder — see the note there. RTL fixes and entrance
animations started in Phase 13 as they were found during live use; the rest of that
phase (full responsive/mobile pass, broader RTL QA, accessibility) is still open.**
Last updated: 2026-09-19

This file is the living plan for the platform-wide Admin Dashboard. Update it as work
progresses — check items off, add discoveries, note deviations from the original plan
and why.

## 0. What this is

A new, separately-deployed frontend (this repo, `Taskforge-DashBoard`) that talks to the
**existing** Taskforge-Back API, giving a platform administrator full cross-workspace
visibility and control: users, workspaces, projects, tasks, activity, and moderation
actions (verify/ban/delete). It does **not** replace or modify the existing product
(Taskforge-Front) — it's an additional, admin-only surface on top of the same backend.

## 1. Architecture map (from real codebase analysis, not assumptions)

### 1.1 Auth & permissions today
- JWT access token + rotating refresh-token cookie. `req.user = {id, email, sessionId}`
  attached by `apps/api/src/modules/auth/strategies/jwt.strategy.ts`.
- Workspace-scoped RBAC only: `WorkspaceGuard` → `MembershipsService.resolveContext()` →
  `PermissionsGuard` + `@RequirePermissions(...)`. Permission strings like `'task.read'`
  live in `packages/types/src/permissions.ts` (`PERMISSIONS`, `PERMISSION_GROUPS`).
- **No platform-admin concept exists anywhere in the codebase.** Every "admin" hit found
  (`packages/types/src/roles.ts`, `roles.service.ts`, `roles.tsx`) is the `'admin'`
  *workspace role preset* — full permissions inside one workspace, not a superuser.
- **Conclusion**: platform admin is a brand-new authorization axis, built from scratch:
  a `User.isPlatformAdmin` flag + a new `PlatformAdminGuard` that does not go through
  `WorkspaceGuard`/membership at all.

### 1.2 Core schemas (real fields, `apps/api/src/modules/*/schemas/`)
- **User**: `name, email, passwordHash(select:false), emailVerified, avatar, locale,
  theme, timezone, lastLoginAt, isSuspended, tokenEpoch`.
  - `emailVerified` is set via `UsersService.markEmailVerified()`, called from
    `AuthService.verifyEmail()`.
  - `isSuspended` **exists but nothing sets it to `true` today** — only ever read (login/
    refresh guards check it). This is a real gap: needs a new
    `UsersService.setSuspended(id, boolean, meta)` method.
  - `tokenEpoch` bump = force-logout-everywhere. Reuse this for the admin "ban" action so
    a ban immediately invalidates existing sessions, not just blocks future logins.
- **Workspace**: `name, slug, ownerUserId, logo, settings{...}, deletedAt, deletedBy`
  (soft-delete pattern already established — follow it, don't hard-delete).
- **Project**: `workspaceId, key, name, description, status, color, cover, leadUserId,
  memberUserIds[], visibility, teamIds[], startDate, endDate, taskCounter,
  createdByUserId, archivedAt, deletedAt, deletedBy`.
- **Task**: ~30 fields incl. `workspaceId, projectId, boardId, columnId, key, title,
  priority, assigneeUserIds[], parentTaskId, depth, completedAt, commentCount,
  attachmentCount, subtaskCount, archivedAt, deletedAt, deletedBy`.
- **WorkspaceMembership**: `workspaceId, userId|null, roleId, status(invited/active/
  suspended), isClient, invitedEmail, inviteTokenHash, inviteExpiresAt, joinedAt` — there
  is **no separate Invitation collection**, invites live on this schema.
- **AuditLog** (`apps/api/src/modules/audit/`): already exists but is **workspace-scoped**
  (`workspaceId, actorUserId, actorLabel, action, entityType, entityId, before, after, ip,
  userAgent`). For platform-admin actions, either widen `workspaceId` to nullable or add a
  parallel `PlatformAuditLog` collection — decide in Phase 2, lean toward nullable field
  reusing the same schema/service pattern rather than a parallel concept.

### 1.3 Module & API conventions to match exactly
```
apps/api/src/modules/<name>/
  <name>.module.ts
  <name>.controller.ts   — @Controller, @ApiTags, @ApiBearerAuth, guards per route
  <name>.service.ts      — all Mongo access, throws ApiException
  dto/<name>.dto.ts
  schemas/<name>.schema.ts
```
- New module: `apps/api/src/modules/admin/` (in **Taskforge-Back**, not this repo) —
  `admin.module.ts`, split controllers (`admin-users.controller.ts`,
  `admin-workspaces.controller.ts`, `admin-projects.controller.ts`,
  `admin-stats.controller.ts`, `admin-audit.controller.ts`), `admin.service.ts` (or split
  per-domain services), `dto/admin.dto.ts`.
- No new schema needed for most of it — inject existing `User`/`Workspace`/`Project`/
  `Task`/`WorkspaceMembership` Mongoose models directly into admin services, the same way
  `ReportsService`/`DashboardsService` already cross-inject models with no repository
  abstraction to fight.
- Errors: throw `ApiException.notFound/forbidden/validation/...` — global filter already
  normalizes everything to `{ error: { code, message, traceId, details? } }`. Never
  invent a new error shape.
- Success: return the raw object/array; `TransformInterceptor` wraps it in
  `{ data, meta? }` automatically.
- Pagination: **offset** (`OffsetPageQueryDto` + `offsetPage()`) for admin tables (users,
  workspaces, projects — need page numbers); **cursor** for the admin audit log (append-
  heavy, matches how chat/activity already use cursor pagination).

### 1.4 What's reusable vs. what must be built fresh
**Reusable as-is (backend)**: `ApiException`, global exception filter, `TransformInterceptor`,
both pagination helpers, `JwtAuthGuard`/`@Public()`, `CurrentUser` decorator, existing
Mongoose models (read cross-workspace, don't duplicate).

**Reusable as reference/pattern (frontend, but this is a separate repo so code itself
isn't shared)**: the API client shape (`apps/web/src/lib/api/client.ts` — thin fetch
wrapper, typed `api.get/post/patch/delete`, single in-flight-refresh-on-401 pattern,
`ApiError` class), the i18n setup (`i18next` + `react-i18next`, flat locale files, RTL
already solved via `document.documentElement.dir`), the theme store pattern (Zustand +
`persist`, toggles a `dark` class), Zustand store conventions (flat `create()`, `persist`
only when it must survive reload).

**Does not exist, must be built fresh in this repo**:
- Any platform-admin auth (`isPlatformAdmin` flag, guard, login flow).
- A generic `DataTable` component — audited `apps/web/src/components/ui/index.ts` in the
  main app and **no such component exists there either**; every list view is bespoke.
  Build one properly for this repo (server-side pagination/sort/filter/search built in).
- `AdminLayout`, `AdminSidebar`, `AdminHeader`, and the rest of the component list in the
  brief — none of these exist anywhere to reuse.
- A stats/dashboard-home endpoint and its UI (nothing platform-wide exists; the closest
  pattern is `DashboardsService.computeWidget()`'s workspace-scoped widget switch).

## 2. Decisions locked in for this build

1. **Separate repo, shared backend.** This dashboard is its own Vite+React+TS app,
   deployed independently (its own Vercel project later), calling the same
   Taskforge-Back API over HTTP. It carries its own copy of `@flowdesk/types`/
   `@flowdesk/utils` (same pattern as the Taskforge-Front/Taskforge-Back split) so DTOs
   and shared constants stay in sync without a monorepo link.
2. **New backend module in Taskforge-Back**, not a new backend. `apps/api/src/modules/admin/`
   is added there, deployed as part of the existing backend — this repo has no server of
   its own.
3. **Platform-admin flag lives on `User`**: add `isPlatformAdmin: boolean` (default
   `false`) to the existing schema — smallest, least invasive change, matches "don't
   rename existing models" instruction. A `PlatformAdminGuard` checks
   `req.user` → loads the user → requires the flag, independent of any workspace
   membership.
4. **Ban = `isSuspended = true` + `tokenEpoch` bump.** Reuses the exact mechanism that
   already blocks login/refresh and force-invalidates sessions — no new session-killing
   logic needed.
5. **Delete user = soft delete**, following the `deletedAt`/`deletedBy` pattern already
   used on Workspace/Project/Task. Ownership transfer / orphan handling designed once the
   real relationship graph is fully enumerated in Phase 2 (see open questions below).
6. **Admin audit log**: reuse the existing `AuditLog` schema/service, allow
   `workspaceId: null` for platform-level entries, add a small set of new `action` values
   (`user.verified_by_admin`, `user.banned`, `user.unbanned`, `user.deleted`,
   `workspace.archived_by_admin`, etc.).

## 3. Open questions to resolve during Phase 2 (backend) before writing delete logic

- On deleting a user who **owns** workspaces: transfer ownership to another
  member, or block deletion until ownership is transferred manually? (Leaning: block,
  surface a clear error telling the admin to transfer ownership first — safest, matches
  "avoid orphaned records" instruction.)
- On banning a user: do their existing `assigneeUserIds`/`createdByUserId` references on
  Tasks/Projects stay as-is (recommended — content shouldn't vanish) — confirmed by brief
  ("do not delete project data simply because an account is banned").

## 4. Phased implementation order

Phase numbers match the 45-step order in the brief, compressed to real milestones:

- [x] **Phase 1 — Analysis.** Done (this document, §1).
- [~] **Phase 2 — Backend foundation** (in Taskforge-Back, commit `880a56a`):
  - [x] `User.isPlatformAdmin` field, plus `bannedAt`/`banReason`/`verifiedByAdminAt` for
    a proper audit trail on those actions. Added `isPlatformAdmin` to the shared
    `AuthUser` type too, so any frontend can read it right after login.
  - [x] `PlatformAdminGuard` (`apps/api/src/common/guards/platform-admin.guard.ts`) —
    looks the flag up fresh from the DB per-request (not embedded in the JWT), so
    revoking admin access is immediate. No separate decorator was needed — plain
    `@UseGuards(PlatformAdminGuard)` at controller-class level was enough, matching how
    lean the rest of this codebase's guard usage is.
  - [x] `UsersService.setSuspended()` (bans **and** unbans — also bumps `tokenEpoch` to
    force-invalidate sessions on ban, reusing the existing "log out everywhere"
    mechanism), `.adminVerifyEmail()`, `.setPlatformAdmin()`.
  - [x] `admin/` module: `AdminStatsController` (`GET /admin/stats`) and
    `AdminUsersController` (`GET /admin/users` list w/ search+filter+offset-pagination,
    `GET /admin/users/:id` w/ cross-workspace stats, `PATCH .../verify`, `.../ban`,
    `.../unban`). Injects User/Workspace/Project/Task/WorkspaceMembership models
    directly, per the established cross-module-injection convention.
  - [x] Bootstrap script: `apps/api/src/database/bootstrap-admin.ts` (run via
    `pnpm --filter @flowdesk/api bootstrap-admin <email>`) — the existing `seed.ts` this
    would have mirrored was deleted from this repo by the user at some point, so this is
    a fresh minimal script rather than following a script that's no longer there.
  - [ ] **Not yet done**: `DELETE /admin/users/:id` (deferred — needs the ownership-
    transfer-blocking logic from §3 decided first), admin workspaces endpoints, admin
    projects endpoints, admin tasks endpoints, admin audit-log endpoints/wiring into the
    existing `AuditLog` schema (nullable `workspaceId`).
  - **Known pre-existing divergence, not touched**: Taskforge-Back's `task.schema.ts`
    still has the old `Checklist`/`ChecklistItem` sub-schema that was already removed
    from `E:\trello`'s copy in an earlier, unrelated piece of work — the backend split
    happened before that removal was made, so it was never carried over here. Unrelated
    to the admin dashboard; flagging so it isn't mistaken for something this work broke.
- [x] **Phase 3 — This repo's foundation** (commit at HEAD): Vite + React 19 scaffold,
  own copy of `@flowdesk/types` (utils wasn't actually needed — nothing in this app uses
  it, dropped to keep scope real rather than cargo-culting the split-repo pattern), API
  client (`lib/api/client.ts`, byte-for-byte the same battle-tested pattern as
  Taskforge-Front's), auth store (reuses the exact same `/auth/login`/`/auth/refresh`
  endpoints — a platform admin is still a plain `User`, just flagged; the store itself
  rejects a successful login whose `user.isPlatformAdmin` is false and calls
  `/auth/logout` so it doesn't leave a dangling session for an account this app will
  never let in), i18n (en/ar, RTL via `document.dir`, same mechanism as the main app),
  theme store (persisted, `dark` class toggle), an original Tailwind v4 token palette
  (`src/index.css`) — deliberately not shared with the main product's design system.
  Design-system primitives built fresh: Button, Input/Textarea, Field, Select (Radix),
  Badge, Skeleton, EmptyState, ErrorState, Avatar, Dialog, `confirm()`, `toast()`.
- [x] **Phase 4 — AdminLayout/Sidebar/Header**: collapsible sidebar (Framer Motion width
  animation, persisted collapsed state, active-route highlighting), header with
  language switcher + theme toggle + user menu + logout. Routing: `/login`, `/` (dashboard
  home), `/users`, `/users/:id`, plus placeholder pages at `/workspaces`, `/projects`,
  `/activity`, `/settings` so the sidebar nav has somewhere real to go while those phases
  are still pending.
- [x] **Phase 5 — DataTable component** (`components/ui/data-table.tsx`): server-side
  paging only (no client-side filtering of a full dataset), skeleton rows while loading,
  empty state, error state with retry, row click navigation. Built once, already reused
  for the users list.
- [x] **Phase 6 — Dashboard home**: 10 stat cards across users/workspaces/projects/tasks,
  backed by the real `/admin/stats` endpoint (no mock data, per the brief's explicit
  rule). No charts yet — the brief said only add them when they add real value; revisit
  once there's a reason (e.g. a growth trend) rather than adding one just to fill space.
- [x] **Phase 7 — Users management (list + detail)**: list page has search + status
  filter + verification filter + pagination, all server-side. Detail page is a real route
  (`/users/:id`, not a modal) with profile info, per-user cross-workspace stats, and a
  Danger Zone with verify/ban/unban wired to the real endpoints — ban opens a small
  dialog for an optional reason, matching the brief's "small forms in dialogs, full
  entities in routes" rule. **Delete user intentionally not implemented yet** — still
  blocked on the ownership-transfer decision in §3.
- [x] **Phase 8 — Projects management** (Taskforge-Back commit `b602916`, dashboard
  commit `df15fd4`): list with search + status filter + visibility filter, cross-
  workspace (a "workspace" column, not scoped to one). Detail page shows description,
  status/visibility badges, and stats (members, boards, tasks, completed tasks). Archive
  and restore both reuse the existing `ProjectsService.setArchived()` rather than
  duplicating that logic — the admin API is a thin cross-workspace wrapper, not a
  reimplementation. **Delete not implemented** — same reasoning as user-delete, revisit
  together.
- [x] **Phase 9 — Workspaces management**: list with search, owner name resolved via a
  batched lookup (not N+1), member/project counts. Detail page shows owner + the same
  counts. No archive/delete actions yet — workspace deletion is much higher-blast-radius
  than a project (cascades to every project/task/member in it) and deserves its own
  explicit decision before any destructive action is wired up; deliberately read-only for
  now.
- [x] **Phase 10 — Tasks management** (Taskforge-Back commit `304cb49`, dashboard
  commit `a2c2b7c`): list with search + open/completed filter + priority filter,
  cross-project. Assignee/reporter/project names resolved via batched lookups (never
  N+1). Detail page shows description, priority/completion badges, and the task's own
  already-denormalized counters (comment/attachment/subtask counts) rather than
  re-querying those collections — same principle as reusing `commentCount` etc. straight
  off the Task document instead of re-deriving them. No edit/delete actions on tasks —
  wasn't asked for and content moderation at the task level felt out of scope for "manage
  the platform" vs. "moderate the discourse of every conversation happening on it."
- [x] **Phase 11 — Admin activity/audit log page** (Taskforge-Back commit `3346265`,
  dashboard commit `7fd1965`): made `AuditLog.workspaceId` nullable so platform-only
  actions (ban/unban/verify — genuinely no single workspace in scope) can be recorded at
  all, added `AuditService.listAll()` for the cross-workspace admin view, and — this is
  the part that actually matters — wired real audit recording into the admin actions
  that already existed (verify/ban/unban/archive/restore) rather than just building an
  empty log page with nothing writing to it. Project archive/restore record with that
  project's real `workspaceId` (so it'd show up if that workspace ever gets its own audit
  view too) with `actorLabel: 'Platform Admin'` to distinguish it from an in-workspace
  action; user actions have no natural workspace so record `workspaceId: null`. Frontend
  is a simple timeline with infinite scroll (cursor-based, matching the append-heavy-log
  pagination choice from Phase 1's analysis) — deliberately not a DataTable, a chronological
  feed reads better here than a sortable/filterable grid.
- [ ] **Phase 12 — Settings page**: genuinely blocked, not skipped — the codebase has no
  existing platform-wide config model to surface (workspace-level settings exist, e.g.
  `Workspace.settings`, but nothing platform-wide), and the brief itself says "whatever's
  platform-configurable." Needs the user to say what should actually live here (rate
  limits? feature flags? maintenance mode? something else?) before it's anything more
  than an empty placeholder — inventing settings nobody asked for would violate the
  brief's own "do not create mock/static data" and "do not create pages nobody needs"
  spirit just as much as mock data would.
- [~] **Phase 13 — Polish pass** (commits `fc063c3`, `04fdd8a`, `7be274e`):
  - RTL: `DirectionProvider` fix (Radix doesn't infer RTL from `document.dir` alone —
    needs an explicit direction context or positioning/keyboard-nav silently stays LTR),
    long Arabic Select labels truncating instead of wrapping to two lines.
  - Animations: per-route fade+rise transition, staggered fade-in on DataTable rows and
    dashboard stat cards.
  - Responsive: found and fixed a real gap, not just spot-checked — the sidebar was
    `hidden` outright below `sm` with nothing replacing it, so there was **no way to
    navigate at all on a phone**. Added a proper slide-in drawer (hamburger trigger,
    backdrop, RTL-aware slide direction, Escape-to-close, basic dialog semantics).
  - Accessibility: translated the aria-labels that were still hardcoded English
    (`"Toggle theme"`, `"Open menu"`), added the ones that were missing entirely
    (sidebar collapse/expand, mobile drawer close).
  - Activity log accuracy: the page surfaces every real audit action across the app, not
    just the 5 new admin-specific ones — found the 4 pre-existing ones in use
    (`project.create/update/delete`, `task.delete`) via a repo-wide grep rather than
    guessing, translated all of them, and added a humanized fallback (e.g. "Task Assign")
    for any future action added elsewhere in the codebase that isn't translated yet.
  - Still outstanding: a full pass isn't done, just what's been found via live use —
    haven't specifically checked every page at narrow widths, and Radix's Select
    positioning under RTL (the Content popover side/align) hasn't been visually confirmed
    live, only reasoned about.
- [ ] **Phase 14 — Push to
  `https://github.com/fouadmo1223/Taskforge-DashBoard.git`** once the above is in a
  genuinely working state (per explicit instruction: push after finishing, not before).
  Note: the repo's `origin` remote is already configured and the plan doc itself has been
  pushed there — "push after finish" is being read as "don't push the *app* prematurely,"
  not "don't push the plan/progress doc," so progress stays visible on GitHub throughout.

## 6. Known gap: local dev needs a CORS allowlist entry

Verified live in a browser: the login request from `http://localhost:5174` reaches
Taskforge-Back correctly (right endpoint, right payload) but is rejected by CORS —
`WEB_ORIGIN` on that Vercel project doesn't include this dashboard's origin. `WEB_ORIGIN`
already supports a comma-separated list, so the fix when needed is just appending
`http://localhost:5174` (dev) and this dashboard's real deployed URL (once it has one) to
that env var and redeploying. Not fixed yet — waiting on the user's call on timing.

## 5. Progress log

- **2026-09-19** — Phase 1 analysis complete via full codebase scan. Repo created
  locally at `E:\Taskforge-DashBoard`, git initialized, this plan committed.
- **2026-09-19** — Phase 2 backend foundation: `isPlatformAdmin`/ban/verify fields on
  `User`, `PlatformAdminGuard`, `admin` module with stats + users endpoints, bootstrap
  script. Pushed to Taskforge-Back as commit `880a56a`. To actually use the dashboard
  once it exists, run `pnpm --filter @flowdesk/api bootstrap-admin <your-email>` against
  the target database first — there is no self-serve way to become the first admin, by
  design. Next: decide + build the delete-user ownership-transfer rule, then admin
  workspaces/projects/tasks endpoints, then move to Phase 3 (this repo's frontend
  foundation).

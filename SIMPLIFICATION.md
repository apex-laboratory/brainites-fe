# Simplification Review — `be/integrations` vs `main`

**Date:** 2026-07-24
**Scope:** Full branch diff (157 files, ~7.4k insertions, 11.4k diff lines) — backend wiring for auth/tokens, sources, reviews, skills, brain chat, and dashboard.
**Method:** Four independent cleanup agents reviewed the diff in parallel, one per angle — **Reuse**, **Simplification**, **Efficiency**, **Altitude**. Findings below are deduped across angles and ranked by value. This is a *quality* review: no correctness bugs are in scope (those live in `CODE_REVIEW.md`).

**Status (2026-07-25): all findings applied except 4, 9, 12 and 17.**

- **Applied earlier** (`d5ff703`): 1-shallow, 13, 15, 16, 20, 21, 26, 27, 28, 30, 31.
- **Applied since**, one commit each: 2, 3, 5, 6, 7, 8, 10, 11, 14, 18, 19, 22, 23, 25, 29, 32, 33.
- **Deliberately skipped:** 4 (contested — the per-page query-state ladder was left
  alone, siding with the Simplification agent's dissent) and 9, 12, 17 (they change
  request behavior or rendering rather than structure).
- **Finding 24 was not a cleanup after all.** The "dead" surface split three ways:
  redundant-by-design (decisions/reviews detail, activity feed), and endpoints whose
  screens simply hadn't been built (skill versions, API keys). Rather than delete,
  all of it is now wired — including a skill detail + version history dialog and an
  API keys settings tab. `dashboardApi.activity` turned out to be broken as written:
  it used `api.get`, discarding the `meta.nextCursor` it documents.
- **Still unused, intentionally:** `interactionKeys`, `brainKeys.all`,
  `decisionKeys.all` — query-key namespace roots with no query or invalidation
  behind them yet. Kept for symmetry with the other key factories.
- **Not in this document, but worth noting:** several surfaces are still
  fixture-backed — `useSourceActivity` (the "Reading now" panel is fully
  simulated), `SettingsUsage` (`USAGE_METRICS`, though `GET /workspaces/:id/usage`
  exists), `UsageMeter`/`WorkspaceSwitcher`, and `CommandPalette`'s recent questions.

---

## Top cluster — flagged independently by three of four agents

### 1. `asSourceId` is copy-pasted into five hooks

**Files:** `src/features/dashboard/hooks/useOverview.ts:22`, `src/features/reviews/hooks/useReviews.ts:29`, `src/features/decisions/hooks/useDecisions.ts:15`, `src/features/brain-chat/hooks/useBrainChat.ts:25`, plus the list-shaped variant `asSources` at `src/features/skills/hooks/useSkillsSearch.ts:22` and an inline cast at `src/features/sources/hooks/useConnectionLanding.ts:34`
**Angles:** Reuse · Simplification · Altitude

The identical three-line provider narrowing is declared four times, character for character:

```ts
function asSourceId(provider: string | null | undefined): SourceId | null {
  return provider && provider in SOURCES ? (provider as SourceId) : null;
}
```

The same story applies to status coercion: `asStatus` is hand-written in both `useDecisions.ts:20` and `useSkillsSearch.ts:31`.

**Shallow fix (low risk):** export `asSourceId` / `asSourceIds` once from `src/constants/sources.ts`, next to the `SOURCES` map they guard. All four callers already import `SOURCES` from there.

**Deep fix (Altitude's preferred form):** do the narrowing at the zod boundary instead. The branch already demonstrates the right pattern in two places it didn't generalize — `sources.schemas.ts:21` declares `SourceProviderSchema = z.enum([...])` and `:53` declares `SourceStatusSchema = z.enum([...]).catch("unknown")`, which is exactly why `useSources.ts:64` can index `SOURCES[source.provider]` with no narrowing at all. Promoting a shared `SourceIdSchema` (with `NullableSourceIdSchema = SourceIdSchema.nullable().catch(null)`) and using it in the decisions/reviews/brain/dashboard/skills schemas would delete all six hook-level coercions.

**Cost:** the provider list is now declared **three** times (`types/common.ts:6`, `constants/sources.ts:15`, `sources.schemas.ts:21`) and the narrowing logic six times. Adding an eighth provider means touching three declarations, and any hook whose author forgets `asSourceId` indexes `SOURCES[undefined]` and renders a broken icon.

---

## Shared-layer gaps (Altitude)

### 2. Mutation error policy is all-or-nothing, so ten call sites work around it

**File:** `src/lib/api/query-client.ts:20` — workarounds at `useReviews.ts:115,128,141,160`, `useDisconnectSource.ts:41`, `useCreateSkill.ts:29`, `useExportSkills.ts:31`, `ChatMessage.tsx:46`, and no-op overrides at `useIntegration.ts:56`, `useBrainBuild.ts:26`

The global `mutations.onError` toasts `err instanceof ApiError ? err.message : "Something went wrong"`. Because a local `onError` *replaces* the default, eight hooks re-write that exact ternary just to change the fallback string, and two more write `onError: () => {}` purely to suppress the toast. The comment `// Overriding onError opts out of the global toast` appears three times — the codebase is documenting the workaround rather than removing the need for it.

**Fix:** React Query passes the mutation as the 4th argument to the default `onError`, so the default handler can read `mutation.meta`. Then `meta: { errorToast: false }` deletes both no-op overrides and `meta: { errorMessage: "Couldn't approve those reviews" }` deletes the toast-only overrides. For hooks that must keep an `onError` because they also roll back, export one `apiErrorMessage(err, fallback)` helper from `src/lib/api/errors.ts` so the ternary is written once.

**Cost:** ten copies of the fallback ternary means error presentation can't change centrally — adding request-id display, offline detection, or a retry action requires editing every mutation. The `onError: () => {}` no-ops are worse: they silently opt out of *all* future default error behavior, not just the toast.

### 3. `skills.export.ts` reaches around the API client and re-implements it

**File:** `src/features/skills/api/skills.export.ts:29-65`

Because `GET /skills/export` returns a zip rather than the `{data, meta}` envelope, the whole call goes raw: manual `Authorization` header, manual `credentials: "include"`, manual `AbortSignal.timeout`, manual 401→`refreshTokens()`→retry, and a manual `ApiError` built from `res.statusText`. Every one of those already exists in `client.ts`.

**Fix:** two small extensions to `src/lib/api/client.ts` cover it — (a) a `timeoutMs?: number` option on `ApiInit`, since the only reason this file stands alone is that `REQUEST_TIMEOUT_MS` is a module constant with no per-request override; (b) a non-JSON response mode (`api.blob(path, init)`) that runs `doFetch` → refresh-retry → `toApiError` and returns the blob instead of `schema.parse(body.data)`. That also lets `getAccessToken` / `refreshTokens` stop being public exports of `lib/api/index.ts` — they sit in the barrel solely for this one file.

**Cost:** the bypass has already leaked upward. `toApiError` parses `{error:{code,message}}` bodies; this file uses `res.statusText`, so the backend's real 403 message is discarded — and `useExportSkills.ts:32` compensates with a hardcoded `"Export is admin-only."` special case. Every future non-JSON endpoint (CSV export, avatar upload) will fork this file again. Related: `useExportSkills` also hand-rolls `isExporting` + try/catch instead of `useMutation`.

### 4. The pending/error/empty ladder is re-implemented on every page

**Files:** `ReviewsPage.tsx:69-167`, `SourcesPage.tsx:56`, `DecisionsPage.tsx:51`, `SkillsPage.tsx:95`, `OverviewPage.tsx:45-73`, `StepConnect.tsx:61`, `StepConfigure.tsx:33`, `SettingsGeneral.tsx:25`, `SettingsMembers.tsx:17`, `ManageSourceDialog.tsx:168`

`QueryState.tsx` is new and correctly factors the *leaves* (`ErrorState`, `EmptyState`, `Skeleton`) — but not the state machine that selects between them. Nine call sites hand-write the same `isError ? <ErrorState onRetry={() => refetch()}/> : isPending ? <skeleton> : empty ? <EmptyState> : content` ladder, including nine copies of the `onRetry={() => refetch()}` adapter.

**Fix:** add the missing boundary to `src/components/shared/QueryState.tsx` — the file is already named for it: `<QueryState query={...} skeleton={<…/>} errorTitle="…" empty={<EmptyState …/>}>{data => …}</QueryState>`.

**Cost:** beyond ~200 duplicated lines, the ladder is fragile to extend. `ReviewsPage.tsx:83-166` shows the tell — the whole existing body got wrapped in a `<>…</>` at the original indentation, so JSX nesting no longer matches visual indentation. Each page also picks its own ordering (some check `isError` first, some `isPending`), so behavior when both are true differs page to page.

**Note — dissenting view:** the Simplification agent independently considered and *rejected* this one, judging that each arm has genuinely different layout and skeleton geometry, so a shared boundary would need enough render props that it wouldn't be simpler. Worth weighing both readings before acting.

### 5. `useConnectionLanding` takes a `refetch` callback instead of owning its invalidation

**File:** `src/features/sources/hooks/useConnectionLanding.ts:16` / `src/features/sources/pages/SourcesPage.tsx:24-26`

The OAuth-return hook accepts `refetch: () => void` from the page, forcing the page to write `const refetchSources = useCallback(() => void refetch(), [refetch])` plus a two-line comment explaining why the wrapper exists.

**Fix:** `useQueryClient().invalidateQueries({ queryKey: sourceKeys.all(workspaceId) })` inside the hook needs no parameter, no `useCallback`, and no comment. Cache invalidation belongs with the module that owns the cache key.

**Cost:** cheap now (~5 lines), but it makes the hook un-reusable — the moment a second surface handles the connect-return (onboarding `StepConnect` is the obvious next one), that page must also know which queries go stale.

### 6. The onboarding "company step" payload is built in three places

**Files:** `src/features/onboarding/hooks/useCreateWorkspace.ts:38-45` and `src/features/onboarding/pages/OnboardingPage.tsx:41-46`

`useOnboardingProgress` exists as the one fire-and-forget progress recorder. `useCreateWorkspace` can't use it (its `workspaceId` closure is stale right after creation), so it calls `onboardingApi.saveStep(...).catch(() => {})` directly, re-implementing the hook's semantics. `OnboardingPage.handleCompanyNext` then builds the same `{step:"company", companyName, teamSize, primaryUseCase}` payload a third time — which is the only reason the page imports `toTeamSize`/`toUseCase` at all.

**Fix:** let `useOnboardingProgress` accept an optional explicit workspace id (`save(input, workspaceId?)`), and move the `CompanyForm → SaveStepInput` mapping into the onboarding api module next to the converters.

**Cost:** the page currently knows the wire enum converters, so a change to the `company` step payload has to be applied in three files or it silently half-records.

### 7. `SetRow` mirrors server state into component state

**File:** `src/features/settings/components/SetRow.tsx:26,49`
**Angles:** Simplification · Altitude

The row seeds `const [current, setCurrent] = useState(value)` and thereafter treats local state as authoritative. Meanwhile `useSettings.ts:29-41` carefully patches the settings query cache on the same mutation — and that patched value can never reach the row, because a `useState` initializer only runs once. Separately, line 51's `if (!onSave) toast.success(...)` local-save path is dead: all three call sites in `SettingsGeneral.tsx` either pass `onSave` or pass `editable={false}`.

**Fix:** make the row controlled — it owns only `draft` / `editing` / `saving` and renders `value` straight from the prop. Make `onSave` required and delete the `toast` import and the `!onSave` branch.

**Cost:** two sources of truth for the displayed value. Any server-side normalization (a trimmed domain, a name the backend rewrites) shows the user their draft instead of the truth, and a background refetch or workspace switch leaves the row showing the previous workspace's values. It also means the careful `setQueryData` in `useSettings` is currently doing nothing observable — dead effort that looks load-bearing.

---

## Efficiency

### 8. A seeded cache entry is immediately thrown away by a prefix invalidation

**File:** `src/features/sources/hooks/useSourceChannels.ts:66-74`

`save.onSuccess` does `setQueryData(sourceKeys.channels(ws, id), saved)` with the comment *"seed the cache with it rather than triggering another round trip"* — then calls `invalidateQueries({ queryKey: sourceKeys.all(workspaceId) })`. But `sourceKeys.all` is `["sources", ws]` and `sourceKeys.channels` is `["sources", ws, "channels", id]`, so `all` is a **prefix**. React Query matches partially by default and refetches active observers, and the channels query is active while the dialog is open. The seed is discarded and a `GET /sources/{id}/channels` fires immediately.

**Fix:** `invalidateQueries({ queryKey: sourceKeys.all(workspaceId), exact: true })`.

**Cost:** one wasted round trip on every "Save scope", plus a refetch flash in the open dialog. `useDisconnectSource.ts:46` has the same prefix over-match and takes the same fix.

### 9. `GET /brain/status` fires on every dashboard load, for users who never open chat

**File:** `src/features/brain-chat/hooks/useBrainChat.ts:95-99`

`useBrainChat()` is instantiated in the shell (`DashboardLayout.tsx:34`) so the conversation survives navigation. That was free when the hook was fixture-backed; this diff added a `useQuery` to it, so mounting the dashboard shell — Overview, Decisions, Settings, anywhere — now issues a `/brain/status` request whose only consumers (`ready`, `notReadyReason`) live in `BrainChatPage`'s composer.

**Fix:** move the status query into `BrainChatPage` (messages and `send` can stay in the layout), or gate it with `enabled` on the chat route / a `hasOpenedChat` flag.

**Cost:** one unnecessary request per dashboard session for every user who never visits `/dashboard/chat`, competing with the overview and reviews-stats fetches on first paint.

### 10. A `useMutation` per chat bubble, including bubbles that can never use it

**File:** `src/features/brain-chat/components/ChatMessage.tsx:39-47`

`useMutation` runs unconditionally at the top of `ChatMessage`, before the `message.role === "you"` early return at line 49. Every rendered message — user bubbles, the greeting, error bubbles, and any brain answer without an `interactionId` — creates a `MutationObserver` subscribed to the mutation cache. Only brain answers with an `interactionId` ever call `override.mutate`. The transcript grows unbounded for the life of the session, so observer count grows with it and every mutation-cache event notifies all of them.

**Fix:** extract the flag button into `<FlagAnswerButton interactionId={...} />`, rendered only inside `{message.interactionId && ...}`.

### 11. Five `useCallback`s that never memoize

**Files:** `src/features/reviews/hooks/useReviews.ts:165-185`, `src/features/brain-chat/hooks/useBrainChat.ts:135-143`
**Angles:** Simplification · Efficiency

`useMutation` returns a **new object literal on every render**. `approve`/`reject`/`write`/`resolveContradiction`/`bulkApprove` list `[resolve]`, `[writeMut]`, `[contradictionMut]`, `[bulkMut]` as deps, and `send` lists `[ask, …]` — so every dep array changes every render and all six callbacks are recreated anyway. In `useBrainChat` this is a regression: `send` used to depend on `[typing]`.

**Fix:** either delete the wrappers (they buy nothing), or destructure the stable member — `const { mutate: resolveMut } = resolve;` — since `mutate` *is* memoized in React Query v5.

**Cost:** 20 lines of ceremony that read as a performance guarantee they don't provide. `send`'s churn propagates into `askBrain`'s `useCallback` in `DashboardLayout.tsx:37-43` and from there into `useDashboardShortcuts`' effect deps, where the global `keydown` listener is removed and re-added on every render.

### 12. Every approve/reject invalidates the whole `["reviews", ws]` prefix

**File:** `src/features/reviews/hooks/useReviews.ts:98-99`

`invalidate()` is wired to `onSettled` on all four mutations and matches both `reviewKeys.list` and `reviewKeys.stats`. The optimistic `removeFromQueue` already dropped the row and the server confirmed it, yet each resolution triggers a full `GET /reviews?status=pending` **plus** `GET /reviews/stats` — on a triage screen explicitly built for rapid-fire approvals.

**Fix:** on the single-item mutations invalidate only `reviewKeys.stats(workspaceId)` (the counters are the only thing the optimistic write can't derive) and let the list ride its `staleTime`; keep the broad invalidation on `bulkMut`, where the list really can diverge.

**Cost:** 2 requests per resolved item — roughly 40 for a 20-item triage session where 21 would do.

### 13. A fresh `Intl.DateTimeFormat` per row for timestamps older than 30 days

**File:** `src/utils/date.ts:35-39`

`toLocaleDateString(undefined, {...})` builds a new formatter on every call. `formatRelativeTime` runs once per row in `mapDecision`, `mapListItem`/`mapSearchHit`, and three overview mappers — and because the infinite-query memos re-map every accumulated page on each "Load more", a registry with older entries re-pays this for the whole loaded list.

**Fix:** hoist a module-level `const ABSOLUTE_DATE = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" })` and return `ABSOLUTE_DATE.format(then)`. Formatter *construction* is the expensive part of `Intl`; formatting is cheap.

### 14. The 280 ms exit-animation timer is never cleared

**File:** `src/features/reviews/components/ReviewCard.tsx:42-45`

`dismiss` schedules `window.setTimeout(run, 280)` with no handle stored and no cleanup, so if the card unmounts inside that window the callback still fires `onResolve` against a torn-down component.

**Fix:** store the id in a ref and clear it on unmount, or drive removal off `onTransitionEnd` instead of a hardcoded duration. **Caveat:** clearing on unmount means a resolve is dropped if the user navigates away mid-animation, which is a behavior decision, not a pure cleanup — and this card also appears in `CODE_REVIEW.md` finding 6 (double-click double-resolve). Worth fixing the two together rather than in isolation.

---

## Reuse

### 15. `ROLE_LABEL` re-declared in the sidebar

**File:** `src/features/dashboard/components/SidebarAccount.tsx:14`

A new local `Record<AuthRole, string>` mapping `viewer/editor/admin` to labels — an exact duplicate of the map added in the same branch at `src/features/settings/api/settings.schemas.ts:17`, which is already re-exported through the settings barrel and consumed by three components. Cross-feature imports of `@/features/settings` are already established in this diff (`useIntegration.ts:7`).

**Cost:** role labels drift silently — renaming "Editor" to "Contributor" fixes Settings and leaves the sidebar stale. The root cause is that the role vocabulary itself is declared twice: `AuthRoleSchema` (`auth.schemas.ts:31`) and `MemberRoleSchema` (`settings.schemas.ts:13`) are the same three literals.

### 16. `AGENT_SCOPES` re-spells the API-key scope enum as untyped strings

**File:** `src/features/onboarding/data/integration.ts:5-16`

`IntegrationScope.id` is typed `string` and `AGENT_SCOPES` lists the exact literal set already defined as a zod enum (`ApiKeyScopeSchema`, `settings/api/apiKeys.schemas.ts:11-17`). The type gap is papered over with a cast at `useIntegration.ts:52`: `AGENT_SCOPES.map((scope) => scope.id as ApiKeyScope)`.

**Fix:** type `IntegrationScope.id: ApiKeyScope` — the cast disappears and the list becomes compiler-checked.

**Cost:** the cast means a typo or a dropped scope compiles fine and fails at runtime as a 422 mid-onboarding — the one flow where a failed key mint blocks the wizard.

### 17. Dashboard schemas re-declare the sources status/provider enums as bare strings

**File:** `src/features/dashboard/api/dashboard.schemas.ts:22` and `:59-70`

`SyncStateSchema.status` is a fresh `z.enum([...]).catch("pending")` over the same literal set as the sync enum defined elsewhere in the branch, and `SourceSummarySchema` types `provider`, `status`, and `syncStatus` as bare `z.string()` — describing the same source rows the Sources feature already models strictly via `SourceProviderSchema` / `SourceStatusSchema` / `SyncStatusSchema` (`sources/api/sources.schemas.ts:21,53,58`).

**Cost:** two independent definitions of "what sync states exist" with **different fallbacks** (`"pending"` vs `"unknown"`), so the same backend value can render differently on Overview and on Sources. Because `provider` stays `z.string()` here, `useOverview` needs its own `asSourceId` narrowing (finding 1) that the schema would have handled at the boundary. Note that unifying the fallbacks is a behavior change, not a pure refactor.

### 18. Three spinner implementations, one accessible

**Files:** `src/app/router/guards.tsx:15`, `src/features/auth/pages/OAuthCallbackPage.tsx:79`, `src/features/onboarding/components/StepLearning.tsx:13`

The identical class string `"size-6 animate-spin rounded-full border-2 border-line border-t-brand-ink"` appears in the first two. `guards.tsx:8` already wraps it in a named `SessionLoading` with `role="status"` / `aria-label`; the callback page inlines the bare `div` with no accessible role, and `StepLearning` has a third local `Spinner`.

**Fix:** a shared `Spinner` in `src/components/shared/QueryState.tsx`, which already owns the shared read-state surfaces.

### 19. The "unknown source" placeholder tile is hand-rolled twice

**Files:** `src/features/decisions/components/DecisionRow.tsx:35-38`, `src/features/decisions/components/DecisionDetail.tsx:53-56`

Both gained the same `decision.src ? <SourceTile/> : <span className="grid size-N shrink-0 place-items-center rounded-[9px] bg-cream text-ink-3">…` branch — the fallback span duplicates `SourceTile`'s own wrapper classes exactly, differing only in size.

**Fix:** widen `SourceTileProps.id` to `SourceId | null` and render the sparkles glyph internally; both call sites collapse to `<SourceTile id={decision.src} size={32} iconSize={17} />`.

**Cost:** `src` is now nullable everywhere (decisions, reviews, brain-chat types), so this branch will keep getting re-invented — `ReviewCard.tsx:79` and `ChatMessage.tsx:78` already carry their own variants. Tile geometry now lives in three places.

### 20. `copyEndpoint` re-implements the clipboard hook

**File:** `src/features/settings/components/SettingsGeneral.tsx:15-23`

`try { await navigator.clipboard.writeText(...); toast.success(...) } catch { toast.error(...) }` is the exact body of `useCopyToClipboard` (`src/hooks/useCopyToClipboard.ts:8`), whose doc comment literally says "Reused anywhere the app exposes a copyable value (endpoint, API key, system prompt, config)". `useIntegration.ts:41` already uses it — for the *same* brain endpoint value.

**Fix:** `const { copy } = useCopyToClipboard();` then `copy(settings.brainEndpoint, "Endpoint copied to clipboard")`. Lowest-effort item in this document.

### 21. One timestamp bypasses the shared date helper

**File:** `src/features/brain-chat/components/ChatMessage.tsx:131`

The provenance line renders a governance actor's timestamp with `new Date(actor.at).toLocaleDateString()` — the only place in the branch formatting an ISO timestamp without `formatRelativeTime` (`src/utils/date.ts:22`), which every other new timestamp uses and which already handles the >30-day fallback and invalid values.

**Cost:** inconsistent presentation inside one screen — "2d ago" on source badges vs "7/24/2026" on the provenance line.

### 22. The optimistic remove + rollback recipe is written twice

**Files:** `src/features/sources/hooks/useDisconnectSource.ts:22-44`, `src/features/reviews/hooks/useReviews.ts:86-97`

Both hooks hand-implement `cancelQueries` → snapshot via `getQueryData` → `setQueryData(filter)` → return `{previous}` → on error restore + toast.

**Fix:** an `optimisticRemove(queryClient, key, ids)` helper (returning snapshot + `rollback`) alongside the query plumbing in `src/lib/api/`.

**Cost:** the rollback contract is re-derived per hook, and the two already differ in whether they invalidate the narrow key or the feature-wide key. Every new optimistic mutation copies whichever version its author finds first.

---

## Simplification

### 23. Four copy-paste mutations in `useReviews`

**File:** `src/features/reviews/hooks/useReviews.ts:101-163`

`resolve`, `writeMut`, `contradictionMut`, and `bulkMut` are byte-for-byte identical except for `mutationFn` and the success toast — each has the same `onMutate: ({id}) => removeFromQueue([id])`, the same four-line `onError`, and the same `onSettled: invalidate`.

**Fix:** one local factory in the hook taking `{mutationFn, ids, onDone}`; the four call sites collapse to about four lines each.

**Cost:** any change to the optimistic-removal or rollback contract has to be made in four places, and a miss is silent — a mutation that forgets `rollback` leaves the queue permanently wrong.

### 24. Dead API surface shipped with no call site

**Files:** across the new `*.api.ts` modules

Verified as having zero references outside their own definition and barrel re-export:

- **Endpoints:** `decisionsApi.get`, `skillsApi.get`, `skillsApi.versions`, `reviewsApi.get`, `dashboardApi.activity`, `apiKeysApi.list`, `apiKeysApi.revoke`
- **Key builders:** `brainKeys.all`, `decisionKeys.all`/`.detail`, `skillKeys.detail`/`.versions`, `dashboardKeys.activity`, `reviewKeys.detail`, `interactionKeys`, `apiKeyKeys`
- **Schemas backing only the above:** `SkillVersionSchema`/`SkillVersionListSchema`, `ApiKeySummarySchema`/`ApiKeyListSchema`, `ActivityListSchema`
- Also `setAccessToken` re-exported from `src/lib/api/index.ts:11` but only called inside `tokens.ts`

**Cost:** ~150 lines that read as live contract, must be kept in sync with the backend, and give false confidence that pagination/detail flows are wired.

**Judgment call:** this may be deliberate scaffolding mirroring a delivered backend contract. Worth confirming intent before deleting — if the screens are imminent, leaving it is defensible; if not, it is dead weight.

### 25. A 110-line JSX ternary arm, never re-indented

**File:** `src/features/onboarding/components/StepIntegrate.tsx:86`

The whole credentials section (lines 92–186) is the third arm of a ternary and kept its original indentation, so the `) : (` and closing `)}` sit two levels off from the `<div>` they gate. The condition `isLoading || !endpoint || !apiKey` also re-derives what `useIntegration` already computed (`isLoading = !ready && !isError`, `ready = Boolean(endpoint && apiKey)`), so inside the `!isError` arm it is exactly `isLoading`.

**Fix:** extract the body into a local `IntegrationPanels` component; the page reduces to `{isError ? <ErrorState/> : isLoading ? <Skeletons/> : <IntegrationPanels …/>}`. Drop `|| !endpoint || !apiKey`. Either consume `ready` from the hook or stop exporting it — no caller reads it.

**Cost:** the mis-indentation means the next edit inside that block will very likely land in the wrong ternary arm.

### 26. Guards accept a `children` prop nobody uses

**File:** `src/app/router/guards.tsx:34,47,66`

All three guards accept `children?: ReactNode` and end with `return children ? <>{children}</> : <Outlet />`. Every call site (`router/index.tsx:43,49,55,59`) uses the `<Route element={<RequireX />}>` layout form.

**Fix:** drop the prop, the `ReactNode` import, and the fragment in all three.

### 27. Two adjacent identical guard wrappers

**File:** `src/app/router/index.tsx:55`

Two consecutive `<Route element={<RequireWorkspace />}>` wrappers where one containing both children would do. Reads as if the two subtrees have different gates.

### 28. `healthyCount` computed twice

**File:** `src/features/sources/hooks/useSources.ts:70`

`buildStats` (line 25) already does `sources.filter(s => s.syncStatus === "healthy").length`; line 70 repeats the same filter outside any memo.

**Cost:** two definitions of "healthy" that can drift — if `status === "connected"` is later also required, only one gets updated.

### 29. Four hand-rolled `flatMap` filters in `useOverview`

**File:** `src/features/dashboard/hooks/useOverview.ts:56`

`mapReviews`, `mapDecisions`, `mapSourceHealth`, and `mapActivity` all implement the same shape — resolve `asSourceId`, `return []` if null, else `return [{...}]` — three of them spending six lines on the array-wrapping ceremony alone.

**Fix:** one `compactMap(xs, f)` helper (`xs.flatMap(x => f(x) ?? [])`), after which each mapper is a plain function returning an object or `null`.

**Note:** this interacts with `CODE_REVIEW.md` finding 7, which flags the null-dropping itself as a correctness problem. Decide the intended behavior first, then simplify.

### 30. Pointless rename aliases

**File:** `src/features/onboarding/data/integration.ts:90`

```ts
const ENDPOINT = endpoint;
const KEY = apiKey;
const SLUG = slug;
```

Leftover shims so the migrated template literals didn't have to be touched.

**Fix:** rename in the destructuring, or lowercase the ~10 template references and delete all three lines. The SCREAMING_CASE now falsely signals module constants.

### 31. Five-branch `if` chain keyed on one field

**File:** `src/features/auth/components/AuthForm.tsx:163`

`resolveAuthError` is five sequential `if (err.code === …)` branches plus a fallthrough.

**Fix:** a module-level `Partial<Record<ApiErrorCode, string>>` copy table, with `validation_error` kept as the one special case that reads `err.details`. Adding a code becomes adding a row rather than a branch.

### 32. Two conventions for reaching the query client

**Files:** `src/features/settings/hooks/useSettings.ts:5` and `useMembers.ts:5` import the `queryClient` **singleton** from `@/lib/api`, while `useReviews` / `useDisconnectSource` / `useSourceChannels` / `useCreateSkill` use `useQueryClient()`.

Both conventions are new in this branch. The hook form is the one that survives contact with tests and any future per-tree client.

### 33. Duplicate exported symbol name

`WorkspaceSummarySchema` is exported from **both** `auth/api/auth.schemas.ts:15` (`id, name, slug, plan?`) and `dashboard/api/dashboard.schemas.ts:27` (`name, slug, plan` — no `id`), while `onboarding/api/onboarding.schemas.ts:66` re-exports the auth one. These are genuinely different wire shapes, so they can't share a definition — but two identically-named exported schemas across feature barrels is an easy mis-import. Renaming the dashboard one (e.g. `OverviewWorkspaceSchema`) removes the trap.

---

## Checked and rejected

- **`normalizeRelative` in `src/utils/date.ts`** is unreferenced, but it was already dead on `main` — not introduced by this branch.
- **`useSourceChannels`' sparse-override draft** looked like mirrored state but deliberately isn't: it stores overrides keyed by `externalId` and reads `override ?? server`, which is the correct non-mirroring form.
- **The per-page query-state ladder** was flagged by the Altitude agent (finding 4) and explicitly rejected by the Simplification agent as not worth a shared abstraction. Both readings are recorded above.

---

## Suggested order if this gets actioned

1. **Trivial, no behavior change:** 20 (clipboard), 21 (date helper), 26 (guard children), 27 (route dedup), 30 (rename aliases), 33 (schema rename)
2. **Contained wins:** 1-shallow (shared `asSourceId`), 15 (`ROLE_LABEL`), 16 (scope typing), 18 (spinner), 28 (`healthyCount`), 31 (error table), 32 (query client convention)
3. **Worth real time:** 2 (mutation error policy via `meta`), 11 (dead `useCallback`s), 23 (mutation factory), 25 (StepIntegrate extraction), 7 (`SetRow` controlled)
4. **Efficiency, verify first:** 8 (`exact: true`), 10 (flag button), 13 (`Intl` hoist), 9 and 12 (behavior-adjacent — confirm intent)
5. **Larger, decide intent first:** 3 (`api.blob`), 4 (query boundary — contested), 6 (onboarding progress), 24 (dead API surface), 1-deep (schema-layer narrowing), 17 (dashboard enums)

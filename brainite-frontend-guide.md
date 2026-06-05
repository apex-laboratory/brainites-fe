# Brainite Frontend Implementation Guide

This file defines the frontend-only implementation plan for rebuilding the current prototype as Brainite with React, TypeScript, Tailwind CSS, shadcn/ui, and static fixture data.

The goal is 1:1 UI parity with the current prototype in `Hephaestou V2.html`. Product naming, logo usage, icons, and implementation structure should be cleaned up now; detailed visual refinements can be handled later with custom prompts.

## Scope

- Build frontend only.
- Use static local data only.
- Do not integrate backend APIs yet.
- Do not expose or require API keys.
- Match the existing app flows, layout, color palette, spacing, interaction states, and screen composition.
- Rename all user-facing product mentions to Brainite.
- Use the shared Brainite logo asset once provided.
- Replace custom handwritten UI primitives with shadcn/ui where possible.
- Use `react-icons` for all generic and brand icons.
- Do not create inline SVG icons or custom-drawn icon components.
- Use `react-nice-avatar` for every person avatar.
- Use Tailwind CSS for layout and styling.
- Keep the app maintainable with a feature-based folder structure.

## Source Of Truth

Use these existing files as visual and content references:

```txt
Hephaestou V2.html
css/tokens.css
css/ui.css
js/root.jsx
js/auth.jsx
js/onboarding.jsx
js/brain-scene.jsx
js/dash-data.jsx
js/dash-brain.jsx
js/brain-chat.jsx
js/dash-chrome.jsx
js/dash-pages.jsx
screenshots/
```

Use the screenshots as visual QA references. The app should preserve the current product narrative, updated for the new product name:

- Brainite is a company brain.
- It reads Slack, Notion, GitHub, Jira, and Zendesk.
- It extracts decisions, policies, skills, and review items.
- It answers questions with source-backed evidence.
- The workspace in static data is Riverline.

## Brand And Logo

The product name is Brainite.

When the Brainite logo file is shared, add it to:

```txt
src/assets/brand/brainite-logo.png
```

Use the provided asset directly for product branding:

- Auth brand panel.
- Onboarding top-left logo.
- Dashboard sidebar workspace/product mark.
- Browser favicon if a favicon export is provided.

Do not recreate the logo with CSS, text, inline SVG, or icon fonts. If the shared logo arrives as SVG, export it to PNG/WebP for the app asset so the implementation still follows the no-SVG rule. If the final logo file is not available during implementation, use a temporary text lockup that reads `brainite` and leave a clear TODO in `AppLogo.tsx`.

## Required Stack

```txt
React
TypeScript
Vite
Tailwind CSS
shadcn/ui
react-icons
react-nice-avatar
clsx
tailwind-merge
class-variance-authority
```

Optional but useful:

```txt
zod
react-router-dom
```

## Architecture Rules

Use feature-based architecture. Group code by business domain, not by file type.

```txt
src/
  app/
    router/
      index.tsx
    providers/
      ThemeProvider.tsx
      AuthProvider.tsx
    layouts/
      AuthLayout.tsx
      DashboardLayout.tsx
      OnboardingLayout.tsx
  features/
    auth/
      components/
      pages/
      hooks/
      data/
      types/
      index.ts
    onboarding/
      components/
      pages/
      hooks/
      data/
      types/
      index.ts
    dashboard/
      components/
      pages/
      hooks/
      data/
      types/
      index.ts
    decisions/
      components/
      pages/
      hooks/
      data/
      types/
      index.ts
    reviews/
      components/
      pages/
      hooks/
      data/
      types/
      index.ts
    sources/
      components/
      pages/
      hooks/
      data/
      types/
      index.ts
    skills/
      components/
      pages/
      hooks/
      data/
      types/
      index.ts
    brain-chat/
      components/
      hooks/
      data/
      types/
      index.ts
  components/
    ui/
    shared/
      AppLogo.tsx
      AppShell.tsx
      SourceIcon.tsx
      AppIcon.tsx
      NiceAvatar.tsx
      Sparkline.tsx
      StatusIndicator.tsx
      MetricCard.tsx
      SectionLabel.tsx
  hooks/
    useCountUp.ts
    useDebounce.ts
    useDisclosure.ts
    useLocalStorage.ts
    useMediaQuery.ts
    usePagination.ts
  utils/
    cn.ts
    date.ts
    format.ts
  constants/
    routes.ts
    sources.ts
  types/
    common.ts
  styles/
    globals.css
  main.tsx
```

Rules:

- Pages stay thin and compose feature components.
- Feature-specific data lives inside that feature's `data/` folder.
- Feature-specific hooks live inside that feature's `hooks/` folder.
- Shared UI belongs in `components/shared` or `components/ui`.
- Shared helpers belong in `utils`.
- Shared constants belong in `constants`.
- Use path aliases with `@/`.
- Use barrel exports where appropriate.
- Do not create giant global component folders.
- Pages must not manipulate data or call fixture functions directly — go through a hook.

## Hooks Rules

These rules apply to every hook in the codebase.

### Keep Components Thin

Pages and components should orchestrate UI, not contain logic.

Bad:

```tsx
const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("pending");

  // logic inline...

  return (...);
};
```

Good:

```tsx
const ReviewsPage = () => {
  const { reviews, selected, setSelected, filter, setFilter } = useReviews();

  return (...);
};
```

### Create Hooks Around Business Logic

Related state and derived values belong in a custom hook, not scattered across a component.

Bad:

```tsx
const Dashboard = () => {
  const [selectedReview, setSelectedReview] = useState();
  const [filters, setFilters] = useState();
  // all logic inline
};
```

Good:

```tsx
const { selectedReview, setSelectedReview, filters, setFilters } = useReviewFilters();
```

### One Responsibility Per Hook

A hook should have a clear, single purpose.

Bad:

```ts
useDashboard() // returns companies, reviews, auth, theme, analytics, notifications
```

Good:

```ts
useDecisions()
useReviews()
useReviewFilters()
useSkillsSearch()
useSourceHealth()
```

### Avoid useEffect for Derived State

Don't use `useEffect` to sync state that can be derived directly.

Bad:

```tsx
useEffect(() => {
  if (decision) {
    setTitle(decision.title);
  }
}, [decision]);
```

Good:

```tsx
const title = decision?.title ?? "";
```

Many `useEffect`s can be deleted entirely. Use them only for genuine side effects (timers, external subscriptions, DOM mutations).

### Return Objects, Not Arrays

Bad:

```ts
const [data, loading, handler] = useReviews();
```

Good:

```ts
const { reviews, isLoading, approveReview, rejectReview } = useReviews();
```

Objects are self-documenting and easier to extend.

### Keep Hook Files Small

If a hook file grows past ~100 lines, split it.

Bad:

```txt
hooks/useDecisions.ts  // 400 lines covering list, filters, detail, actions
```

Good:

```txt
features/decisions/hooks/
├── useDecisions.ts
├── useDecisionFilters.ts
└── useSelectedDecision.ts
```

### Keep Hook Names Predictable

```txt
useDecisions
useDecision
useDecisionFilters

useReviews
useReviewFilters

useSkillsSearch

useSourceHealth

useAuth
useOnboardingFlow
useBrainChat
```

Naming consistency matters more than cleverness.

### Only Abstract When Logic Is Reused or Complex

Don't extract hooks for trivial one-liners.

Bad:

```ts
useDecisionTitle() // returns decision.title
```

Extract a hook when it encapsulates meaningful state management, derived values, or reused logic across multiple components.

### Avoid Deep Hook Dependencies

Bad:

```ts
useDashboard()
 └─ useDecisions()
     └─ useAuth()
         └─ usePermissions()
```

Keep dependency chains shallow. Prefer flat, focused hooks that compose at the component level.

### Shared UI State Hooks

General-purpose hooks live in `src/hooks/` and are reused across features:

```txt
hooks/
├── useDebounce.ts
├── useDisclosure.ts
├── useLocalStorage.ts
├── useMediaQuery.ts
├── usePagination.ts
└── useCountUp.ts
```

### Four Boundaries Rule

| Concern | Belongs in |
| --- | --- |
| Data and business logic | Custom hooks |
| Pure calculations | Utility functions in `utils/` |
| UI state (open, collapsed, selected) | Local `useState` or a small hook |
| UI rendering | Components |

If you follow these four boundaries consistently the codebase stays maintainable as it grows.

## shadcn/ui Usage

Use shadcn/ui as the base for common primitives:

```txt
button
input
textarea
card
dialog
sheet
tabs
dropdown-menu
command
badge
separator
tooltip
progress
scroll-area
avatar
table
sonner
```

Component mapping:

| Prototype element | New implementation |
| --- | --- |
| `.btn` | shadcn `Button` variants |
| `.input` | shadcn `Input` |
| `.card` | shadcn `Card`, but keep prototype spacing/radius |
| `.seg` | shadcn `Tabs` or segmented control built on `Button` |
| command palette | shadcn `Command` inside `Dialog` |
| review toast | `sonner` toast |
| sidebar tooltip | shadcn `Tooltip` |
| source/status labels | restrained square `Badge` or text row |
| chat panel | shadcn `Sheet` or fixed panel using shadcn tokens |
| progress meters | shadcn `Progress` |

Do not blindly use default shadcn styling. Extend it so the result visually matches the prototype.

## Visual Parity Requirements

Preserve these visual traits:

- Full-viewport app surface.
- Warm ivory background.
- Quiet charcoal text.
- Single orange accent.
- Cream sidebar and secondary panels.
- Low, soft shadows.
- Compact operational dashboard density.
- Left navigation with active orange indicator.
- Sticky top bar with breadcrumb and command trigger.
- Source icons for Slack, Notion, GitHub, Jira, and Zendesk.
- Small status dots for live/sync states.
- Animated build-brain scene.
- Floating brain chat button and chat panel.
- Master-detail decisions page.
- Review queue cards with before/after diff.
- Source health cards.
- Skills registry table.
- Settings tabs.
- Brainite naming and logo placement.

The visual target is still 1:1 parity with the existing prototype. Do not redesign the layout, navigation, information hierarchy, screen order, or dashboard density during the initial build.

Tailwind token guidance:

```txt
background: #F3EEE3
secondary background: #ECE5D6
card: #FBF8F2
card raised: #FFFFFF
ink: #1B1A15
body text: #514B3F
muted text: #837B6B
faint text: #A79E8B
line: #E0D8C8
line strong: #D2C9B6
accent: #E8481B
accent text: #C23A12
accent soft: #FBE7DD
green: #3F8F5B
amber: #B9831F
```

Use 8px to 16px radii for most surfaces. Cards should not become oversized rounded blobs.

## Cleanup Rules

This rebuild should remove the "vibe coded" parts while keeping the product feel.

Do:

- Use one primary sans font across the app.
- Use tabular numbers where metrics need alignment.
- Use `react-icons` for UI actions and provider identity.
- Use a shared icon wrapper so icon style, size, and labels stay consistent.
- Use square or softly-rounded badges for metadata.
- Use text links for example questions.
- Use `react-nice-avatar` for user avatars.
- Keep cards purposeful: panels, repeated items, modals, and tool surfaces.

Do not:

- Do not use decorative font toggles.
- Do not use serif italic words inside headings.
- Do not use pill-shaped metadata everywhere.
- Do not use monospace labels as a general style.
- Do not use initial-based avatars.
- Do not use inline SVGs for icons.
- Do not create custom-drawn icon components.
- Do not use random decorative gradients or blobs.
- Do not create a marketing landing page.
- Do not put cards inside cards unless it is an actual repeated item inside a panel.
- Do not use text-filled rounded pills where an icon, row, tab, checkbox, or badge would be clearer.
- Do not scale font size with viewport width.
- Do not use negative letter spacing in Tailwind classes.

Specific replacements:

| Current pattern | Replace with |
| --- | --- |
| `.tag` pill | shadcn `Badge` with `rounded-md`, or plain metadata row |
| `.chip` pill-ish badge | square badge, icon + text row, or muted text |
| `.mono` section labels | small sans uppercase label with modest tracking |
| serif italic highlight words | normal sans text with weight/color emphasis |
| initials avatar | `react-nice-avatar` generated avatar |
| custom command modal | shadcn `Command` + `Dialog` |
| custom dropdown | shadcn `DropdownMenu` |
| inline SVG UI icons | `react-icons` imports |

## Avatar Requirement

Install and use `react-nice-avatar`.

All person avatars must use this shared wrapper:

```tsx
import Avatar, { genConfig } from "react-nice-avatar";

type NiceAvatarProps = {
  name: string;
  size?: number;
};

export function NiceAvatar({ name, size = 34 }: NiceAvatarProps) {
  const config = genConfig(name);

  return (
    <Avatar
      className="shrink-0"
      style={{ width: size, height: size }}
      {...config}
    />
  );
}
```

Use it for:

- Dana Reyes.
- Marcus Lee.
- Priya Shah.
- Sam Okafor.
- Decision owners.
- Testimonials.
- Account button.
- Member rows.

## Static App Flow

The app should keep the same local flow behavior:

```txt
auth -> onboarding -> dashboard
```

Persist the current flow to local storage:

```txt
heph_flow
```

For now, auth buttons do not authenticate:

- Signup actions route to onboarding.
- Signin actions route to dashboard.
- Logout routes back to auth.

## Routes

Use React Router routes even if data is static:

```txt
/auth
/onboarding
/dashboard
/dashboard/decisions
/dashboard/reviews
/dashboard/sources
/dashboard/skills
/dashboard/settings
```

Dashboard navigation can still use internal route state if preferred, but URL routes are better for implementation clarity.

## Screens To Implement

### Auth

Reference: `js/auth.jsx`.

Implement:

- Split screen layout.
- Left brand panel with dark warm surface.
- Source orbit visual.
- Product headline and supporting copy.
- Brainite logo placement.
- Testimonial row with `NiceAvatar`.
- Right auth form.
- Signup/signin toggle.
- Google and GitHub buttons.
- Email input.
- SAML SSO button.
- Security reassurance text.

Cleanup:

- Remove serif italic headline emphasis.
- Keep the content and hierarchy, but use the primary sans font.
- Replace old product mentions with Brainite.
- Use shadcn buttons and inputs.

### Onboarding Welcome

Reference: `StepWelcome`.

Implement:

- Centered welcome screen.
- Brainite logo top-left.
- Three setup preview cards.
- Primary CTA.

Cleanup:

- Remove serif italic company-name styling.
- Keep cards simple and evenly spaced.

### Company Setup

Reference: `StepCompany`.

Implement:

- Left setup rail.
- Vertical stepper.
- Company name input.
- Team size selection.
- Primary use case selection.
- Footer back/continue controls.

Use cards or buttons for selectable options, not pill controls.

### Connect Sources

Reference: `StepConnect` and `ConnectCard`.

Implement:

- Summary bar.
- Connect all action.
- Source cards for Slack, Notion, GitHub, Jira, Zendesk.
- Idle, connecting, and connected states.
- Read-only trust panel.
- Simulated delays for connecting.

Use restrained badges for read scopes. Avoid pill clusters that dominate the cards.

### Configure Sources

Reference: `StepConfigure`.

Implement:

- Time range segmented control.
- Connected source sections.
- Channel/page/repo/ticket scope selection.
- Selected counts.
- Build CTA.

Use checkbox-like selectable rows or compact square badges. Do not use rounded pills for every channel.

### Build Brain

Reference: `js/brain-scene.jsx`.

Implement:

- Full-screen cinematic build scene.
- Orange radial background.
- Source nodes orbiting around the center.
- Central brain/core mark.
- Animated connection/comet lines.
- Floating extracted decision cards.
- Phase text.
- Ledger metrics.
- Progress bar.
- Skip and completion actions.

Use CSS animations. Keep the scene visually close to the prototype. This can remain custom CSS because shadcn is not intended for this type of animated scene.

### First Question

Reference: `StepFirstQuestion`.

Implement:

- Ready screen.
- Ask input.
- Suggested questions.
- Answer card with sources and confidence.
- CTA into dashboard.

Cleanup:

- Suggestions should be rows or text links, not pill buttons.
- Source references should use compact badges or source rows.
- Final CTA copy should use Brainite naming.

### Dashboard Shell

Reference: `Dashboard`, `Sidebar`, `TopBar`.

Implement:

- Left sidebar.
- Collapsed sidebar state.
- Workspace switcher dropdown.
- Search/ask command trigger.
- Main nav: Overview, Decisions, Reviews.
- Knowledge nav: Sources, Skills.
- Usage meter.
- Account button with `NiceAvatar`.
- Top bar with collapse button, breadcrumb, command button, notifications, help.
- Keyboard handling for command palette.

Use shadcn `DropdownMenu`, `Tooltip`, `Progress`, and `Button`.

### Overview

Reference: `BrainPage`.

Implement:

- Greeting.
- Source sync status.
- Ask brain panel.
- Suggestion links.
- KPI tiles.
- Needs your review panel.
- Recently extracted panel.
- Source health panel.
- Activity panel.

Cleanup:

- Example questions should be plain text links with arrow icons.
- Review kind should be a compact badge, not a pill.

### Decisions

Reference: `DecisionsPage`.

Implement:

- Page header.
- Status filter segmented control.
- Left decision list.
- Right decision detail.
- Source and pin actions.
- Executable rule block.
- Metadata grid.
- Provenance panel with `NiceAvatar`.

Keep master-detail behavior. Static selection is enough.

### Reviews

Reference: `ReviewsPage`.

Implement:

- Page header.
- Pending count.
- Progress strip.
- Review cards.
- Before/after diff.
- Evidence quote.
- Reject and approve actions.
- Queue clear state.
- Toast after action.

Use shadcn `Card`, `Progress`, `Button`, and `sonner`.

### Sources

Reference: `SourcesPage`.

Implement:

- Page header.
- Add source button.
- Stat strip.
- Source cards.
- Health meter.
- 7-day sparkline.
- Manage and view knowledge actions.

Source cards should preserve density and use source brand icons.

### Skills

Reference: `SkillsPage`.

Implement:

- Page header.
- Search input.
- New skill button.
- Stat strip.
- Skills table.
- Source lineage icons.
- Calls sparkline.
- Status badge.
- Row action icon button.

Use shadcn `Table` or a CSS grid table. Keep rows dense and scannable.

### Settings

Reference: `SettingsPage`.

Implement:

- Page header.
- General, Members, Usage tabs.
- Workspace settings.
- Brain endpoint copy block.
- Members list with `NiceAvatar`.
- Usage metric cards.

Use shadcn `Tabs`.

### Command Palette

Reference: `CommandPalette`.

Implement:

- `Dialog` containing shadcn `Command`.
- Search input.
- "Ask: query" row when query is present.
- Go to navigation rows.
- Recent question rows.
- Escape closes.
- Enter asks when query exists.

### Brain Chat

Reference: `BrainChat`.

Implement:

- Floating action button.
- Fixed chat panel.
- Header with live status.
- Message list.
- Typing indicator.
- Suggested questions.
- Input and send button.
- Static answer matching.
- Source-backed response metadata.

Use local regex matching for now.

## Static Data

Move static data out of JSX and into typed fixture files.

Suggested files:

```txt
src/features/decisions/data/decisions.ts
src/features/reviews/data/reviews.ts
src/features/dashboard/data/activity.ts
src/features/dashboard/data/recent-questions.ts
src/features/skills/data/skills.ts
src/features/sources/data/source-health.ts
src/features/onboarding/data/onboarding-fixtures.ts
src/features/brain-chat/data/brain-answers.ts
src/features/settings/data/members.ts
src/constants/sources.ts
```

Preserve the existing static entities:

- 6 decisions.
- 3 review queue items.
- 5 activity items.
- 3 recent questions.
- 6 skills.
- 5 source health records.
- 4 team members.
- Brain answers for refund, discount, incident, and shipment questions.

## Icons

Use `react-icons` for all icons. Do not paste SVG markup into React components, and do not draw custom icons by hand.

Recommended packages:

```txt
react-icons/si
react-icons/fa
react-icons/fa6
react-icons/hi2
react-icons/io5
```

Use provider icons from `react-icons/si` where available:

```txt
SiSlack
SiNotion
SiGithub
SiJira
SiZendesk
SiGoogle
```

Use generic UI icons from one or two consistent `react-icons` families, preferably `Hi2` and `Io5`:

```txt
HiArrowRight
HiArrowLeft
HiMagnifyingGlass
HiCheck
HiXMark
HiPlus
HiCog6Tooth
HiBell
HiQuestionMarkCircle
HiArrowRightOnRectangle
HiClock
HiArrowTopRightOnSquare
HiBookmark
HiBolt
HiSparkles
HiCircleStack
HiDocumentText
HiCommandLine
IoBrain
```

Create small shared mapping helpers only for selecting imported `react-icons` components:

```txt
src/components/shared/AppIcon.tsx
src/components/shared/SourceIcon.tsx
```

These files should map names to `react-icons` imports. They must not contain inline `<svg>` markup or custom-drawn icon paths.

## Tailwind Setup

Configure theme tokens in `tailwind.config.ts` using CSS variables.

Use `src/styles/globals.css` for:

- CSS variables.
- shadcn base layer.
- app scrollbar styling.
- keyframes.
- utility classes that are genuinely shared.

Avoid large handcrafted component CSS files. Prefer Tailwind classes and small reusable components.

Recommended variables:

```css
:root {
  --background: 43 39% 95%;
  --foreground: 48 13% 7%;
  --card: 40 60% 98%;
  --card-foreground: 48 13% 7%;
  --secondary: 42 39% 89%;
  --secondary-foreground: 38 12% 31%;
  --muted: 42 39% 89%;
  --muted-foreground: 39 10% 46%;
  --border: 39 31% 83%;
  --input: 39 31% 83%;
  --primary: 13 82% 45%;
  --primary-foreground: 0 0% 100%;
  --accent: 13 82% 45%;
  --accent-foreground: 14 84% 38%;
  --ring: 13 82% 45%;
  --radius: 0.5rem;
}
```

## Interaction State

Static app state should be local React state, managed through hooks:

- Current auth mode → `useAuthMode`.
- Current onboarding step → `useOnboardingFlow`.
- Connected source states → `useSourceConnections`.
- Selected onboarding channels → `useOnboardingChannels`.
- Dashboard route/page → router state.
- Sidebar collapsed state → `useSidebarState`.
- Review queue → `useReviews`.
- Toast state → `sonner` directly.
- Command palette open state → `useDisclosure`.
- Brain chat open state → `useDisclosure`.
- Brain chat messages → `useBrainChat`.
- Decisions filter → `useDecisionFilters`.
- Selected decision → `useSelectedDecision`.
- Skills search query → `useSkillsSearch`.
- Settings tab → local `useState` in the settings page.

Use local storage only for:

- Current app flow (`heph_flow`).
- Optional sidebar collapsed state.

## Accessibility

Minimum requirements:

- All icon-only buttons need accessible labels.
- Command palette traps focus.
- Dialogs close on escape.
- Buttons and inputs have visible focus rings.
- Source/status badges should not rely on color alone.
- Review approve/reject actions must have clear labels.
- Sidebar collapsed items need tooltips.
- Chat input can submit with Enter.
- Respect `prefers-reduced-motion`.

## Responsive Behavior

Desktop is the priority because the prototype is dashboard-heavy, but the UI must not break on smaller screens.

Expected behavior:

- Auth stacks into single column below tablet width.
- Onboarding left rail can collapse into a top progress bar on mobile.
- Dashboard sidebar can collapse by default below tablet width.
- Dashboard tables can horizontally scroll.
- Source cards move from 3 columns to 2 then 1.
- KPI tiles move from 4 columns to 2 then 1.
- Chat panel uses full width minus margin on mobile.
- Text must never overflow buttons, cards, nav items, or badges.

## Implementation Phases

### Phase 1: Foundation

- Scaffold Vite, React, TypeScript, Tailwind, shadcn/ui, routes, providers, and aliases.
- Add Brainite naming constants and the logo placeholder path.
- Add design tokens and global styles.
- Install `react-icons` and `react-nice-avatar`.
- Build shared primitives: `AppLogo`, `AppIcon`, `SourceIcon`, `NiceAvatar`, `Sparkline`, `MetricCard`, `StatusIndicator`, and `SectionLabel`.
- Build shared utility hooks: `useDebounce`, `useDisclosure`, `useLocalStorage`, `useMediaQuery`, `usePagination`, `useCountUp`.
- Move all prototype data into typed fixtures.

Exit criteria:

- App boots locally.
- shadcn components render with Brainite tokens.
- No inline SVG icon components exist.
- Every shared icon comes from `react-icons`.

### Phase 2: Auth And Onboarding

- Build auth flow.
- Build onboarding welcome.
- Build company setup.
- Build connect sources.
- Build configure sources.
- Build first question flow.
- Preserve static routing from auth to onboarding to dashboard.

Exit criteria:

- User can click through the full onboarding flow.
- All visible product naming says Brainite.
- Person avatars use `react-nice-avatar`.
- Source/provider icons use `react-icons`.

### Phase 3: Build Brain Scene

- Build the full-screen build-brain animation.
- Preserve the current scene composition, timing, source orbit, core, phase text, ledger metrics, progress bar, skip action, and completion action.
- Use CSS animations for motion.
- Use `react-icons` or the provided Brainite logo asset for the center mark.

Exit criteria:

- Scene visually matches the prototype closely.
- Scene completes and advances to first question.
- Reduced-motion users still get a usable static/low-motion state.

### Phase 4: Dashboard Shell

- Build dashboard layout.
- Build sidebar, collapsed sidebar, workspace menu, usage meter, and account row.
- Build top bar, breadcrumbs, command trigger, notifications, and help action.
- Add keyboard shortcuts for command palette and chat.

Exit criteria:

- Dashboard shell matches prototype structure.
- Sidebar collapse works.
- Workspace/account UI uses Brainite naming and `NiceAvatar`.

### Phase 5: Dashboard Pages

- Build overview page.
- Build decisions page.
- Build reviews page.
- Build sources page.
- Build skills page.
- Build settings page.

Exit criteria:

- Every dashboard route renders static data.
- Review approve/reject works.
- Decision filtering works.
- Skills search works.
- Settings tabs work.

### Phase 6: Command And Chat

- Build command palette with shadcn `Command`.
- Build floating brain chat.
- Add static answer matching.
- Add source-backed response metadata.

Exit criteria:

- Command palette opens and routes/asks correctly.
- Chat opens from FAB and overview suggestions.
- Static answers match refund, discount, incident, and shipment questions.

### Phase 7: Parity QA

- QA every phase against `screenshots/` and the current prototype.
- Check desktop, tablet, and mobile widths.
- Remove any remaining old product names.
- Remove any remaining inline SVG or custom-drawn icon code.
- Run lint and build.

Exit criteria:

- Visual structure keeps 1:1 parity with the prototype.
- `npm run lint` passes.
- `npm run build` passes.

## QA Checklist

Use this checklist before considering the frontend complete:

- Auth screen matches split-screen prototype.
- Onboarding can complete from welcome to first question.
- Connect source cards simulate idle, connecting, and connected.
- Build-brain scene runs and completes.
- Dashboard sidebar collapses and expands.
- Command palette opens with keyboard shortcut.
- Brain chat opens from FAB and overview suggestions.
- Review approve/reject removes items and shows a toast.
- Decision filters update the list.
- Skills search filters the table.
- Settings tabs switch correctly.
- Every user avatar uses `react-nice-avatar`.
- No initial-based avatars remain.
- No decorative serif italic highlight spans remain.
- No general-purpose monospace label style remains.
- Metadata pills are reduced or converted to square badges/rows.
- No page or component contains inline data manipulation — all logic is in hooks.
- No `useEffect` used to sync state that could be derived directly.
- Layout works at desktop, tablet, and mobile widths.
- `npm run lint` passes.
- `npm run build` passes.

## Acceptance Criteria

The implementation is done when:

- It is a React + TypeScript + Tailwind + shadcn frontend.
- It uses static fixtures only.
- It visually matches the current prototype closely.
- It removes the unpolished pill/font/avatar patterns listed above.
- It uses `react-nice-avatar` for all person avatars.
- It follows the feature-based architecture rules.
- It follows the hooks rules: thin components, single-responsibility hooks, no derived-state `useEffect`s, object returns, predictable names.
- It can be run locally without backend services.

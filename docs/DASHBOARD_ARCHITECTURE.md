# Dashboard Architecture

## Overview

The dashboard is a premium, trader-focused SaaS control centre. Navigation is **grouped by purpose** to keep the sidebar scannable and scalable.

## Information Architecture

### 1. **Overview**
- **Dashboard** — Control centre home: greeting, primary CTA (Command Center), shortcuts grid, membership, and activity.

### 2. **Trading**
- **Signals** — Trading setups and signals (permission-gated).
- **Auto Trader** — Automation configuration.
- **Gold to Glory** — 100 → 1000 challenge.

### 3. **Performance**
- **Command Center** — Unified view: focus, AI coach summary, equity, drawdown, metrics, best setup, leaks, consistency, recent trades, latest report.
- **Analytics** — Performance analytics and charts.
- **Reports** — Saved performance snapshots.
- **Performance Engine** — Filtered metrics and equity.
- **AI Trade Coach** — Insights and next actions from journal data.
- **Consistency** — Discipline and process scores.

### 4. **Journal**
- **Growth Journal** — Log and review trades.
- **Vision Timeline** — Vision and planning.

### 5. **Learning**
- **Education** — Courses and lessons (permission-gated).
- **Learning Path** — Adaptive learning.
- **AI Mentor** — Mentor chat.
- **Mentorship** — 1-on-1 sessions (subscription-gated).
- **Progress** — External link to `/dashboard/progress`.

### 6. **Community**
- **Community** — Hub (permission-gated).

### 7. **Account**
- **Account** — Profile and settings.
- **Notifications** — Alerts and updates.
- **Funding** — Prop accounts.
- **Rewards Wallet** — Wallet and points.
- **AI Assistant** — General AI assistant.

### 8. **Creator**
- **Affiliate** — Affiliate dashboard.
- **Marketing** — Marketing toolkit.
- **Campaigns** — Campaign manager.
- **Optimizer** — Optimizer dashboard.

### 9. **Admin** (admins only)
- **Admin Portal** — Link to `/dashboard/admin`.

## Navigation Behaviour

- **Desktop**: Grouped sidebar with collapsible sections. Group expand/collapse state is persisted in `localStorage` (`dashboard-nav-expanded`). The group containing the active section is auto-expanded. Sidebar can be collapsed to icon-only.
- **Mobile**: Bottom nav with 5 primary actions (Home, Command, Signals, Community, Account). Other sections are reachable from Dashboard shortcuts or via URL `?section=…`.

## Visual System

- **Background**: `#05080f` (main), `#0a0e14` (sidebar, mobile nav).
- **Borders**: `border-white/[0.06]` for panels and content area.
- **Accent**: Amber/gold for primary actions and active states.
- **Typography**: Uppercase tracking for group labels; clear hierarchy for headings and body.

## File Roles

- `components/dashboard/dashboard-layout.tsx` — Layout, section routing, mobile nav.
- `components/dashboard/dashboard-sidebar.tsx` — Grouped nav config (`NAV_GROUPS`) and sidebar UI.
- `components/dashboard/dashboard-overview.tsx` — Control centre home and shortcuts.
- `components/dashboard/dashboard-header.tsx` — Global header (brand, notifications, account).

## Adding a New Section

1. Add the section id to `DashboardTab` and `ALLOWED_SECTIONS` in `dashboard-layout.tsx`.
2. Add a `case` in `renderSection()` that renders the component.
3. Add an item to the appropriate group in `NAV_GROUPS` in `dashboard-sidebar.tsx` (id, name, icon, optional `requiredPermission`, `requiredRole`, `subscriptionRequired`, or `external` + `href`).
4. Optionally add a shortcut in `dashboard-overview.tsx` (`SHORTCUTS`).

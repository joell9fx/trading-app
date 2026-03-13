# Colour token consistency pass – summary

Visual consistency pass across the app: hardcoded greys, ambers, golds, and white/black opacities were replaced with the existing design tokens so the product uses a single black/white/gold luxury system. No layout, routing, or behaviour changes were made.

---

## Design tokens used

- **Backgrounds:** `bg-page`, `bg-surface`, `bg-panel`, `bg-elevated`
- **Borders:** `border-border`, `border-border-subtle`
- **Text:** `text-foreground`, `text-foreground/80`, `text-foreground/90`, `text-muted-foreground`
- **Accent:** `text-primary`, `bg-primary`, `bg-accent-muted`, `bg-accent-hover`, `border-primary`, `border-primary/20`, `border-primary/40`, `focus:ring-primary`, `focus:ring-primary/50`
- **Semantic (kept):** `text-emerald-400`, `text-red-400`, `bg-green-*` for success/paid states where appropriate

---

## Files updated

### Dashboard components (high-traffic)

| File | Replacements |
|------|--------------|
| `components/dashboard/locked-feature.tsx` | `border-gray-800`, `bg-gray-950/80`, `text-gray-400/500`, `text-white`, `bg-gold-*`, `border-gold-*` → tokens; outline button → `border-border`, `hover:border-primary`, `hover:text-primary` |
| `components/dashboard/notifications-panel.tsx` | `bg-gray-900/950`, `border-gray-800`, `text-gray-*`, `text-white`, `divide-gray-800`, `bg-gold-500/5`, `text-gold-400` → `bg-panel`, `border-border`, `text-foreground`, `text-muted-foreground`, `divide-border-subtle`, `bg-accent-muted`, `text-primary`; outline buttons → token-based |
| `components/dashboard/terminal-section.tsx` | All cards: `border-white/10`, `bg-white/5` → `border-border-subtle`, `bg-panel`; `text-gray-*`, `text-white`, `text-amber-*`, `text-gold-*` → `text-foreground`, `text-muted-foreground`, `text-primary`; focus panels → `border-primary/20`, `bg-accent-muted`; buttons → `border-border`, `bg-panel`, `hover:bg-elevated` |
| `components/dashboard/performance-engine-section.tsx` | Filters: `border-white/10`, `bg-black/30`, `text-white`, `focus:ring-gold-500` → `border-border`, `bg-panel`, `text-foreground`, `focus:ring-primary`; cards/headers → `border-border-subtle`, `bg-panel`; `text-gray-*`, `text-gold-400` → muted/primary; CTAs → `bg-primary`, `text-primary-foreground`; empty-state → `border-primary/20`, `bg-accent-muted`, `text-primary` |
| `components/dashboard/performance-analytics-section.tsx` | Same filter/card/table pattern as performance-engine; `border-white/5`, `border-white/10`, `text-gray-*`, `text-gold-400`, `text-amber-*` → tokens; buttons and links → primary/muted |
| `components/dashboard/auto-trader-section.tsx` | `bg-white/5`, `border-white/10`, `text-gray-*`, `text-white`, `text-gold-300`, `bg-gold-500`, `border-emerald-*` → `bg-panel`, `border-border-subtle`, `text-foreground`, `text-muted-foreground`, `text-primary`, default Button primary; overlay → `bg-page/60` |
| `components/dashboard/affiliate/affiliate-dashboard.tsx` | `bg-gray-950`, `border-gray-800`, `border-gold-500/50`, `text-gray-*`, `text-white`, `text-gold-400`, `bg-gray-800`, `bg-gray-900` → `bg-panel`, `border-border`, `border-primary/50`, `text-muted-foreground`, `text-foreground`, `text-primary`, `bg-elevated`; progress bar → `from-primary to-accent-hover`; outline button → token-based (paid badge kept green) |
| `components/dashboard/analytics/equity-curve.tsx` | `bg-gray-900`, `border-gray-800`, `text-white` → `bg-panel`, `border-border`, `text-foreground` |
| `components/dashboard/analytics/win-loss-pie.tsx` | Same as equity-curve |
| `components/dashboard/timeline/vision-timeline-client.tsx` | `bg-black`, `border-gold-500/40`, `text-gold-400`, `border-gray-700`, `text-gray-200`, filter buttons → `bg-surface`, `border-primary/40`, `text-primary`, `border-border`, `text-foreground/90`; timeline marker → `bg-primary`, `text-primary-foreground`; `text-gray-400/300` → `text-muted-foreground`, `text-foreground/80` |
| `components/dashboard/trade-annotation-editor.tsx` | Cards/inputs: `border-white/10`, `bg-white/5`, `bg-black`, `bg-gray-900`, `text-gray-*`, `focus:ring-gold-500` → `border-border-subtle`, `bg-panel`, `bg-elevated`, `text-muted-foreground`, `focus:ring-primary`; primary buttons → default variant; badge → `bg-accent-muted`, `text-primary` |
| `components/dashboard/growth-journal-section.tsx` | One input class string: `border-white/15`, `bg-black/40`, `text-white`, `placeholder:text-gray-500`, `focus:ring-gold-500/50` → `border-border`, `bg-panel`, `text-foreground`, `placeholder:text-muted-foreground`, `focus:ring-primary/50` |
| `components/dashboard/signals-history.tsx` | Filter inputs: `bg-black`, `border-white/15`, `text-white`, `focus:ring-gold-500/50` → `bg-panel`, `border-border`, `text-foreground`, `focus:ring-primary/50` |
| `components/dashboard/community-feed.tsx` | Inputs: `border-gray-700`, `bg-gray-800`, `text-gray-100`, `placeholder:text-gray-500`, `focus:ring-gold-500` → `border-border`, `bg-panel`, `text-foreground`, `placeholder:text-muted-foreground`, `focus:ring-primary` |
| `components/dashboard/realtime-chat.tsx` | Message input: `border-gray-700`, `bg-gray-800`, `text-gray-100`, `placeholder:text-gray-500`, `focus:border-gold-500`, `focus:ring-gold-500` → `border-border`, `bg-panel`, `text-foreground`, `placeholder:text-muted-foreground`, `focus:border-primary`, `focus:ring-primary` |

### Other components

| File | Replacements |
|------|--------------|
| `components/community-hub/message-input.tsx` | `bg-gray-900`, `border-gray-800`, `text-gray-100`, `placeholder:text-gray-500`, `focus:border-amber-400`, `focus:ring-amber-400` → panel/border/foreground/muted/primary |

### App pages

| File | Replacements |
|------|--------------|
| `app/dashboard/success/page.tsx` | `bg-black` → `bg-page`; cards → `bg-panel`, `border-border-subtle`, `text-foreground` |
| `app/dashboard/trade-review/[entry_id]/page.tsx` | `bg-black`, `text-white` → `bg-page`, `text-foreground`; loading/empty cards and links → `border-border-subtle`, `bg-panel`, `text-muted-foreground`, `hover:text-foreground`; button → `border-primary/40`, `text-primary`, `hover:bg-accent-muted` |
| `app/dashboard/timeline/page.tsx` | `text-gray-400/200` → `text-muted-foreground`, `text-foreground/90`; progress bar track → `bg-elevated` |
| `app/dashboard/progress/page.tsx` | `text-gray-400` → `text-muted-foreground`; feature cards → `border-border`, `bg-panel` (unlocked), `border-primary/60`, `bg-accent-muted` (unlocked highlight) |
| `app/superadmin/security/page.tsx` | `text-gray-400/300`, `border-gray-800`, `bg-neutral-950`, `border-gray-700`, `text-gray-200`, `hover:border-gold-500/60` → tokens |
| `app/superadmin/reports/page.tsx` | `text-gray-400/200`, `border-gray-800`, `bg-black/60`, `bg-gray-900` → `text-muted-foreground`, `text-foreground/90`, `border-border`, `bg-panel`, `bg-elevated` |
| `app/superadmin/page.tsx` | `text-gray-300` → `text-muted-foreground` |
| `app/admin/legal/page.tsx` | `text-gray-300/400`, `border-gold-500/40`, `bg-gray-900` → `text-foreground/80`, `text-muted-foreground`, `border-primary/40`, `bg-panel` |

---

## Hardcoded colour patterns replaced

1. **Backgrounds:** `bg-[#...]`, `bg-black`, `bg-gray-900/950`, `bg-white/5`, `bg-white/10`, `bg-black/30`, `bg-black/50`, `bg-neutral-950` → `bg-page`, `bg-surface`, `bg-panel`, `bg-elevated`, `bg-page/60`, `bg-page/80`
2. **Borders:** `border-white/10`, `border-white/15`, `border-white/20`, `border-gray-700/800`, `border-gold-500/40`, `border-amber-500/20` → `border-border`, `border-border-subtle`, `border-primary/20`, `border-primary/40`
3. **Text:** `text-white`, `text-gray-200/300/400/500`, `text-amber-200/400`, `text-gold-300/400` → `text-foreground`, `text-foreground/80`, `text-foreground/90`, `text-muted-foreground`, `text-primary`
4. **Buttons/links:** `border-gray-700`, `text-gray-200`, `hover:border-gold-500/60`, `hover:text-gold-300`, `bg-gold-500`, `hover:bg-gold-400`, `text-black` → `border-border`, `text-foreground/90`, `hover:border-primary/60`, `hover:text-primary`, default Button (primary) or `bg-primary`, `text-primary-foreground`, `hover:bg-accent-hover`
5. **Focus rings:** `focus:ring-gold-500`, `focus:ring-gold-500/50` → `focus:ring-primary`, `focus:ring-primary/50`
6. **Inputs:** `bg-black/30`, `bg-black/40`, `border-white/10`, `placeholder:text-gray-500` → `bg-panel`, `border-border`, `placeholder:text-muted-foreground`
7. **Cards/panels:** Recurring card and section wrapper classes standardised to `border-border-subtle`, `bg-panel`, with accent panels using `border-primary/20`, `bg-accent-muted`, `text-primary`
8. **Dividers:** `divide-gray-800`, `border-t border-gray-800` → `divide-border-subtle`, `border-t border-border`
9. **Badges:** Gold-style badges → `bg-accent-muted`, `text-primary`, `border-primary/40`; success (e.g. paid) left as green where semantic

---

## Not changed (intentional)

- **Public marketing pages** (`app/courses/page.tsx`, `app/pricing/page.tsx`, `app/mentoring/page.tsx`): Use `text-gray-900`, `dark:text-white`, `bg-gray-900`, etc. for light/dark section contrast. Can be tokenised in a later pass (e.g. map to `text-foreground` in dark mode).
- **Semantic colours:** `text-emerald-400`, `text-red-400`, `bg-green-*` for success/error/paid kept where they convey meaning.
- **Chart/visual colours:** e.g. equity curve stroke, pie colours left as-is where they are data-vis only.
- **Admin/ModerationDashboard** (`app/admin/community/ModerationDashboard.tsx`): Uses `bg-white`, `border-gray-200` (light UI); not updated in this pass.

---

## Build

- `npm run build` completes successfully.
- No new logic, layout, or routing changes; only class names and colour tokens.

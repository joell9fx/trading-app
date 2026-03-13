# Final consistency & polish pass – summary

A final token and polish pass was applied across public pages, dashboard/app pages, admin panels, and remaining components. No layout, routing, or logic changes were made. Only design tokens and class names were updated for visual consistency.

---

## 1. Files updated

### Public pages
| File | Changes |
|------|---------|
| `app/courses/page.tsx` | Root `bg-page`; sections `bg-surface`; all `text-gray-900 dark:text-white` → `text-foreground`; `text-gray-600 dark:text-gray-300` → `text-muted-foreground`; hero badge → `bg-accent-muted text-primary`; category cards use Card (token-based). |
| `app/pricing/page.tsx` | Same token set; `bg-surface`, `bg-panel`, `border-border`, `divide-border`; Pro column/cells → `bg-accent-muted`, `text-primary`; “Most Popular” badge and CTA → `bg-primary text-primary-foreground`; price amounts → `text-primary`; comparison CTA → `border-border hover:bg-panel hover:text-primary`. |
| `app/mentoring/page.tsx` | Root `bg-page`; sections `bg-surface`; all heading/body gray/dark → `text-foreground`, `text-muted-foreground`; hero badge → `bg-accent-muted text-primary`. |
| `app/signup/page.tsx` | Wrapper `bg-gray-50 dark:bg-gray-900` → `bg-page`. |

### Dashboard / app pages
| File | Changes |
|------|---------|
| `app/dashboard/timeline/page.tsx` | Wrapper `bg-black text-white` → `bg-page text-foreground`. |
| `app/dashboard/leaderboard/page.tsx` | Wrapper `bg-black text-white` → `bg-page text-foreground`. |
| `app/dashboard/trade-review/[entry_id]/page.tsx` | Back links `text-gray-400 hover:text-white` → `text-muted-foreground hover:text-foreground` (3 places). |
| `app/banned/page.tsx` | Wrapper `bg-black` → `bg-page`; heading `text-white` → `text-foreground`; body `text-gray-300` → `text-muted-foreground`; outline button → `border-border text-foreground/90 hover:border-red-400 hover:text-foreground`. |

### Admin
| File | Changes |
|------|---------|
| `app/admin/legal/page.tsx` | Wrapper `bg-black text-white` → `bg-page text-foreground`; title `text-gold-400` → `text-primary`; card `border-gold-500/40 bg-gray-900` → `border-primary/40 bg-panel`. |
| `app/admin/tools/page.tsx` | Wrapper `bg-black` → `bg-page`; heading `text-white` → `text-foreground`; Card `bg-gray-950 border-gray-800` → `bg-panel border-border`; description `text-gray-400` → `text-muted-foreground`. |
| `app/admin/analytics/KpiCards.tsx` | Card `bg-gray-900 text-white border-gray-800` → `bg-panel text-foreground border-border`; label/helper `text-gray-300/400` → `text-muted-foreground`. |
| `app/admin/analytics/AnalyticsDashboard.tsx` | Cards `bg-gray-950 border-gray-800` → `bg-panel border-border`; headings/labels `text-gray-*` → `text-foreground` / `text-muted-foreground`; range buttons `bg-blue-600` → `bg-primary`, outline → `border-border text-foreground/90`; badge → `bg-elevated border-border text-foreground/90`. |
| `app/admin/community/UsersPanel.tsx` | Cards, headers, table: `bg-gray-950/900`, `border-gray-800`, `text-white/gray-*` → `bg-panel`, `bg-elevated`, `border-border`, `text-foreground`, `text-muted-foreground`; selects/buttons → token-based. |
| `app/admin/community/ChannelsPanel.tsx` | Same pattern: panels, inputs, table, buttons → tokens. |
| `app/admin/community/Overview.tsx` | Card, headers, badges, empty state → `bg-panel`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-elevated`. |
| `app/admin/community/ModerationModal.tsx` | Overlay `bg-black/60` → `bg-page/80`; card `bg-gray-950 border-gray-800` → `bg-elevated border-border`; header/footer borders; text → `text-foreground`, `text-muted-foreground`, `text-foreground/90`; outline button → `border-border text-foreground/90`; confirm (non-destructive) → `bg-primary hover:bg-accent-hover`. |

### Superadmin
| File | Changes |
|------|---------|
| `app/superadmin/security/page.tsx` | Section title `text-white` → `text-foreground`; Lockdown label `text-gray-300` → `text-foreground/80`. |
| `app/superadmin/reports/page.tsx` | Summary heading `text-white` → `text-foreground`. |

### Dashboard components
| File | Changes |
|------|---------|
| `components/dashboard/growth-journal-section.tsx` | `labelClass` `text-gray-300` → `text-muted-foreground`; all remaining `text-gray-*`, `border-white/*`, `bg-white/*`, `hover:text-white`, `hover:text-gold-400`, `hover:bg-white/10` → tokens (`text-muted-foreground`, `text-foreground/80`, `border-border`, `bg-panel`, `hover:text-foreground`, `hover:text-primary`, `hover:bg-panel`); outline button `border-white/20` → `border-border`. |

---

## 2. Old patterns replaced

| Old pattern | New (tokens) |
|-------------|--------------|
| `min-h-screen bg-black`, `bg-black text-white` | `bg-page`, `bg-page text-foreground` |
| `bg-gradient-to-br from-slate-900 to-slate-800` | `bg-page` |
| `bg-gray-50 dark:bg-gray-900` | `bg-page` |
| `text-gray-900 dark:text-white` | `text-foreground` |
| `text-gray-600 dark:text-gray-300`, `text-gray-400` | `text-muted-foreground` |
| `text-gray-300`, `text-gray-200` | `text-foreground/80`, `text-foreground/90` |
| `bg-gray-900`, `bg-gray-950` | `bg-surface`, `bg-panel`, `bg-elevated` (by context) |
| `bg-gray-800` | `bg-panel` |
| `border-gray-800`, `border-gray-700` | `border-border` |
| `border-b border-gray-800` | `border-b border-border` |
| `text-gold-400`, hero/category pills `blue-100/800` | `text-primary`, `bg-accent-muted text-primary` |
| `bg-blue-500 text-white` (Most Popular, CTAs) | `bg-primary text-primary-foreground` |
| `bg-blue-100 dark:bg-blue-900/30` (Pro column) | `bg-accent-muted`, `bg-accent-muted/30` |
| `text-blue-600 dark:text-blue-400` (prices) | `text-primary` |
| `border-2 border-blue-500` (Pro card) | `border-2 border-primary` |
| `divide-gray-700`, `hover:bg-gray-700/50` | `divide-border`, `hover:bg-panel` |
| `bg-gray-700 text-gray-300` (badges) | `bg-elevated text-foreground/90` |
| Modal overlay `bg-black/60`, card `bg-gray-950 border-gray-800` | `bg-page/80`, `bg-elevated border-border` |
| `border-gray-700 text-gray-200` (outline buttons) | `border-border text-foreground/90` |
| `bg-blue-600` (admin range active) | `bg-primary` |
| Growth journal labels, empty states, list text | `text-muted-foreground`, `text-foreground/80`, `border-border-subtle`, `bg-panel` |

---

## 3. Remaining pages / components using old visual language

- **`app/funding-account/page.tsx`** – Still uses full light/dark pattern: `text-gray-900 dark:text-white`, `text-gray-600 dark:text-gray-300`, `bg-white dark:bg-gray-900`, `bg-gray-50 dark:bg-gray-800`, and blue/green icon circles. Can be tokenised in a later pass (e.g. `bg-page`/`bg-surface`, `text-foreground`/`text-muted-foreground`, icon circles → `bg-primary`/`bg-emerald-500` or tokens).
- **`app/admin/community/ModerationDashboard.tsx`** – Uses light UI (`bg-white`, `border-gray-200`, `text-gray-700`, `border-gray-300`, `bg-blue-600` for active tab). Intentionally light; if the rest of admin is dark, consider a follow-up pass to use tokens for a consistent dark admin theme.
- **Courses/pricing/mentoring** – Category icon wrappers (e.g. `bg-blue-100 dark:bg-blue-900`, `bg-green-100 dark:bg-green-900`) and some list bullets (e.g. `bg-blue-500`, `bg-green-500`) were left as-is for semantic variety; they can be switched to `bg-accent-muted`/`text-primary` or kept for clarity.
- **Chart/data colours** – Left unchanged (e.g. equity curve stroke, pie colours).
- **Destructive/red** – Kept for errors and destructive actions (e.g. banned page “Return to Sign In”, ModerationModal destructive confirm).

---

## 4. Build

- `npm run build` completes successfully.
- No changes to behaviour, routing, or permissions.

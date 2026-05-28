# BuildCrew.AI — Figma Component Build Punch-List

Build order: **Tokens → Atoms → Molecules → Organisms**. Name each Figma
component to match the CSS class in parentheses so Code Connect mapping stays 1:1.

Token references use the semantic names from `tokens.json`
(`accent`, `surface`, `fg`, `border`, `space.*`, `radius.*`, typography styles).

Legend — **Props** = Figma component properties (variant / boolean / instance-swap).

---

## TIER 0 · Foundations (from tokens.json — no components to draw)

- **Color** — primitives (orange/raisin/tiffany/stone) + semantic Dark/Light modes
- **Type styles** — heading-1…6, body-1/2/3, caption, micro, marketing-display
- **Effect styles** — shadow/sm, shadow/base, shadow/lg; focus-ring (orange, documented)
- **Icons** — Material Symbols Outlined (use the Material library); only the hex
  brand mark (`logo_icon.svg`) + `gradient-ai` gradient style are local assets

---

## TIER 1 · Atoms

| Component (class) | Props | Tokens consumed |
|---|---|---|
| **Button** (`.btn`, `.btn-primary`, `.btn-ghost`, `.btn-danger`) | `variant`: primary / secondary / ghost / danger · `state`: default / hover / disabled · bool `leadingIcon`, `trailingIcon` | `accent`/`accent-hover`/`accent-fg`, `danger`, `border`, `radius.base`, `space.2/3`, type `body-3` |
| **Badge** (`.badge` + `.b-*`) | `tone`: done / working / warn / high / med / low / info / draft / bid / lost | `success`, `accent-wash`, `warning`, `danger`, `info`, `radius.pill`, type `micro` |
| **Chip / Filter chip** (`.chip`, `.chip-count`) | `state`: default / active · bool `count` | `fg`, `accent`, `border`, `accent-wash`, `radius.pill` |
| **Segmented control** (`.seg`) | `state` per segment: default / active | `surface`, `bg-subtle`, `accent`, `radius.base` |
| **Avatar** (`.avatar`) | `size`: sm / md / lg · `type`: initials / image | `accent`, `accent-fg`, `radius.pill`, type `body-3` |
| **Status dot** (`.dot`, `.connect-status-dot`, `.run-dot`) | `tone`: working / on / running | `accent`, `success` |
| **Input / Select** (`.field`, `.files-filter-select`, `.bid-run-move-select`) | `type`: text / select · `state`: default / focus / disabled | `surface`, `border`, `focus-ring`, `radius.base`, type `body-2` |
| **Progress bar** (`.bar-track`/`.bar-fill`, `.run-skill-bar`) | bool `thin` (1px) | `accent`, `bg-subtle` |
| **Pill — utility** (`.conn-pill`, `.autosave-hint`, `.bid-run-pill`, `.files-count-pill`) | `tone`: neutral / accent / success | `accent-wash`, `success`, `radius.pill`, type `micro` |
| **Cody mark / Sparkle** (`.cody-mark`, `.sparkle`) | bool `spin` | `gradient-ai` style |
| **File-type icon** (`.files-ftype-icon` + `-pdf/-dwg/-sheet/-doc/-image/-other`) | `ftype`: pdf / dwg / sheet / doc / image / other | per-type tinted bg + Material icon, `radius.sm` |

---

## TIER 2 · Molecules

| Component (class) | Props | Tokens consumed |
|---|---|---|
| **KPI card** (`.kpi`, `.kpi-clickable`, `.kpi-open-hint`, `.delta`) | bool `clickable` · `delta`: up / down / neutral · bool `accent` | `surface`, `border`, `fg`, `tiffany.300` (up) / `danger` (down), `accent` (hint), `radius.md`, type `heading-2`+`micro` |
| **Pin card** (`.pin-card`, `.pin-toggle`, `.pin-kind`, `.pin-title`, `.pin-meta`) | `kind`: project / skill / drawing · bool `pinToggle` | white (project) / `accent-wash` (skill) / blue-wash (drawing), `radius.md`, type `heading-5`+`caption` |
| **Skill-run card** (`.run-skill-card`, `.run-skill-stop`, `.run-skill-video`) | `state`: resting / loading / completed | `accent`, `surface`, `danger` (stop), `radius.md` — loading uses the ripple video layer |
| **Drawing card** (`.drawing-card`, `.drawing-thumb`, `.drawing-meta`) | `status`: done / flagged | `surface`, `border`, trade accent color, `radius.md` |
| **Tab — top bar** (`.tab`, `.tab-close`, `.tab-label`, `.tab-progress`) | `state`: default / active / running · bool `closable` | `#fff` (active), `fg`, `accent` (progress), `radius.base` top-only |
| **Report / sub-tab** (`.report-tab`, `.report-tab-count`) | `state`: default / active · bool `count` | `fg`, `accent` (underline + count), type `body-3` |
| **Nav item** (`.nav-item`, `.nav-recent`, `.nav-integration`) | `state`: default / active · bool `collapsed`, `subLabel`, `runDot`, `count` | `fg`/`accent` icon, `accent-wash` (active), `bg-hover` |
| **Table** (`.bc-table`, `.files-table`, `.bid-table`) | `density`: default / compact · cell `align`: text / num | `surface`, `border`, `fg`/`fg-muted`, type `body-2`/`data` |
| **Dropdown menu** (`.rev-dd`/`.rev-menu`, `.sort-dd`) | `state`: closed / open · item `state`: default / active | `surface`, `border`, `accent` (active), `shadow.base`, `radius.md` |
| **Context menu** (`.ctx-menu`, `.ctx-menu-item`, `.ctx-menu-divider`) | item bool `danger`, `disabled`, `divider`, `shortcut` | `surface`, `border`, `danger`, `shadow.base` |
| **Connection row** (`.connect-row`, `.connect-logo`, `.connect-status`) | `state`: available / connected | `surface`, `success` (connected), `radius.md` — logo tile is white |
| **Upload field** (`.upload-zone`, `.labor-prompt`, `.ai-inline-dropzone`) | `state`: idle / drag · `theme`: neutral / blue / accent | dashed `border`, `accent-wash`/blue-wash, `radius.md` |
| **Donut + legend** (`.donut`, `.donut-card`, `.legend`, `.legend-row`) | — | series colors, `surface`, type `caption` |
| **Cody message item** (`.cody-msg-list-item`, `.cody-msg-check`) | `kind`: platform / alert | `accent` (alert), cody-base tint, `border` dashed |
| **Greet prompt bar** (`.greet-prompt`, `.greet-prompt-send`) | `state`: default / focus | `surface`, `accent` (border + send), `radius.pill` |
| **Edit-mode bar** (`.edit-mode-bar`) | bool `hasChanges` | `accent-wash`, `accent`, `radius.md` |
| **Editable text** (`.editable-text`) | `state`: idle / hover / editing / edited | dashed `accent` border, `accent-wash` |
| **Division tile** (`.da-tile`, `.da-tile-flag`, `.da-tile-tooltip`) | `state`: in-scope / out-of-scope · bool `flagged` | `surface`, dashed muted border (oos), `accent` (flag), `radius.md` |

---

## TIER 3 · Organisms

| Component (class) | Props / states | Notes |
|---|---|---|
| **NavRail** (`.col-nav`) | `state`: expanded (260px) / collapsed (56px) | sections: Workspace, Pinned, Recently visited, Recent projects, footer (theme cycle + user card). Dark surface always; icons white (dark/hybrid) / raisin (light) |
| **Taskbar** (`.taskbar`, `.crumb`) | slot `actions`, bool `switcher` | breadcrumb + right-aligned action buttons |
| **CodyMessage** (`.cody-msg`) | bool `items`, `dismissible`, `pill` · count pill | header (mascot + eyebrow + title), optional scrollable items list (cap 4), suggestion chips |
| **AI Assistant** (`.ai-panel` / `.ai-rail-collapsed`) | `state`: open / collapsed | open = full chat (header/body/input); collapsed = 56px mascot rail. Chat message kinds: choice, picker, dropzone, success-link, table, insights |
| **Modal shell** (`.modal-shell`, `.modal-h`, `.modal-body`, `.modal-foot`) | `variant`: New Project / Daily Report / Push Global / Delete File / Add Connection / Run Bid Analysis | shared chrome: backdrop, header (eyebrow+title+close), body, footer actions |
| **Drawing Viewer** (`.dv-root` + `dv-*`) | toolbar / stage / title-block / markup drawer | full-screen sheet viewer with hotspots + cost drawer |
| **Greeting / hero** (`.greet`) | — | Home only: animated Cody video + prompt bar + quick-action pills |
| **RFC board** (`.lanes`, `.lane`) | lane `priority`: critical / med / low / resolved | draggable clarification cards |
| **Bid pre-run** (`.bid-run-*`) | trade rows + file re-assignment | inside Run Bid Analysis modal |

---

## Page-level layouts (compose organisms — build last, as frames not components)

- **Home** — Greeting · Recent Projects · Pinned · Recent Skill Runs
- **Projects** — filter/sort toolbar + project card grid
- **Project Home** — heading + sub-tabs (Overview / Files / Bid Tracker / Labor Rates)
- **Skill Results** — ROM Estimate / Clarifications & RFIs / Bid Level Analysis (report-tabs: Overview / Detailed / Files)
- **Files (workspace)** — Project → Revision → File tree
- **Reports**, **Labor Rates**, **Settings** (Profile / Appearance / AI / Connections)

---

## Suggested Figma file structure

```
Library file (published)
├── Cover
├── Foundations   (color · type · spacing · elevation · icons)
├── Atoms
├── Molecules
├── Organisms
├── Patterns      (states, empty states, loading)
└── Changelog

Product file (consumes library)
└── Flows / screens
```

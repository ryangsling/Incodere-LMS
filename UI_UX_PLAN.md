# ILMS Corporate Training — Frontend Creative & UI/UX Brief

## 1. UI/UX Intelligence (ui-ux-pro-max)

**Pattern:** Minimal Single Column
*   **Focus:** Conversion-focused, single CTA, large typography, generous whitespace, no navigation clutter. Mobile-first.
*   **Sections:** Hero headline → Short description → Benefit bullets (max 3) → CTA → Footer.

**Style:** Trust & Authority
*   **Keywords:** Expert credentials, metrics, professional recognition.
*   **Performance:** Excellent.
*   **Accessibility:** WCAG AAA compliance target.

**Typography:** Poppins / Open Sans
*   **Mood:** Modern, professional, clean, corporate, approachable.
*   **Application:** SaaS, corporate sites, professional services.

**Key Effects & Pre-Delivery Checklist:**
*   Badge hover effects, metric pulse animations, smooth stat reveals.
*   No emojis as icons (use SVG: Heroicons/Lucide).
*   `cursor-pointer` on all clickable elements.
*   Hover states with smooth transitions (150-300ms).
*   Light mode: text contrast 4.5:1 minimum.
*   Focus states visible for keyboard navigation.
*   `prefers-reduced-motion` respected.
*   Responsive breakpoints: 375px, 768px, 1024px, 1440px.

---

## 2. AntiSlopUI Creative Direction

**Concept**
The ILMS platform must transcend the generic, cluttered "admin dashboard" slop. We are designing a premium, focused workspace for professional development. By leveraging a high-contrast structural canvas and restrained, tactile motion, the learning environment feels both authoritative and breathable. We use a stark bento-grid architecture bound by 1px rules, where motion serves strictly to maintain spatial context and focus.

**Art Direction & Color System**
*   *Primary Canvas:* `#FFFFFF` (Main content, reading zones, active video players).
*   *Structural Neutral:* `#F9F9FA` (App shell background, sidebars, inactive zones).
*   *Typography:* `#3A3A3A` (Deep charcoal, avoiding pure #000).
*   *Borders:* `#E5E7EB` (Hairline structural grids).
*   *Interactive Accent:* `#9333EA` / `#8B5CF6` (Vibrant purple for primary CTAs, active states, and progress indicators).
*   *Brand Mark strictly:* `#312E81` to `#06B6D4` gradient (Reserved for the logo mark, never used as a UI background).

**Typography Rules**
Strict sans-serif geometry (e.g., Poppins/Open Sans). Dashboard greetings and course titles use oversized display typography: `clamp(2rem, 5vw, 4.5rem)`, `leading-[0.92]`, `tracking-tight`. Body copy remains highly legible at `1rem`, `leading-[1.6]`.

**Composition**
Asymmetrical bento grid. Negative space is our primary grouping mechanism. Content cards sit completely flush on `#FFFFFF` against the `#F9F9FA` background, defined only by the `#E5E7EB` border. No drop shadows.

---

## 3. Page Structure & Intent
1.  **Auth / Preloader:** Split-pane layout. Left side stark white with the gradient logo mark; right side `#F9F9FA` holding the auth form. Minimal initial loader.
2.  **Dashboard (Home):** The command center. Bento-style grid containing Course Progress (hero tile), Upcoming Modules, and Quick Chat. Focus is on immediate next actions.
3.  **Course Player:** Immersive focus mode. Sidebar navigation collapses smoothly. The canvas shifts entirely to `#FFFFFF` to remove distraction.
4.  **Profile / Settings:** Utility-driven, list-based layout using strict hairline dividers.

---

## 4. Signature Motion Moves
We rely on only 3 high-impact techniques, bound by a site-wide easing signature of `cubic-bezier(0.16, 1, 0.3, 1)` (expo.out). 
1.  **Shared-Element Course Expansion (Motion React):** When a user clicks a course card on the dashboard, it does not link away. Instead, it uses Framer Motion `layoutId` to seamlessly expand into the full Course Player view, maintaining the cover image and title in continuous spatial context.
2.  **Mask-Line Stagger Reveal (GSAP):** Upon entering the dashboard, the bento grid does not fade in. Content blocks and the main `clamp()` typography are revealed via a strict `clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%)` wipe from bottom to top, staggered by `0.05s`.
3.  **Micro-Magnetic CTAs (ZProximity):** Primary actions ("Continue Course" buttons in purple) use subtle magnetic pulling when the cursor approaches. This provides a tactile, premium physical feel without overwhelming the interface.

**Motion Budget and Accessibility**
*   **Allowed Properties:** `transform`, `opacity`, `clip-path` ONLY. Zero animated layouts (except Framer Motion layout projections), zero animated box-shadows.
*   **Accessibility Gate:** All GSAP and Motion React logic must be wrapped in a `prefers-reduced-motion: reduce` check. If true, swap all durations to `0.01s` and replace `clip-path` with a simple opacity toggle.
*   **Pointer Gate:** The ZProximity magnetic cursor logic only mounts if `@media (pointer: fine)` is true. Touch devices get zero magnetic overhead.

---

## 5. Delegation Plan for Implementation

| Target Zone | Task / Effect | Specialist | Build Order | Parallel / Overlap Notes |
| :--- | :--- | :--- | :--- | :--- |
| `frontend/src/` | **Core Scaffold:** Setup Vite/React 19, Tailwind config (inject exact hex codes), Lenis smooth scroll provider, layout shells. | `antislopui-frontend-architect` | 1 | Blocks all other specialists. Owns root `App.tsx` and routing. |
| `frontend/src/components/` | **UI/UX System:** Build the Bento grid layouts, typography tokens, hairline borders, and pure static CSS mapping. | `antislopui-uiux-designer` | 2 | Runs after architect. No motion logic yet; static perfection first. |
| `frontend/src/pages/Dashboard.tsx` | **Mask-Line Reveals:** Implement GSAP `clip-path` entrance choreography for dashboard mounting. | `antislopui-animation-specialist` | 3 | Runs parallel with Motion Specialist. Owns strictly initial mount timeline. |
| `frontend/src/components/CourseCard.tsx` | **Layout Expansion:** Wire Motion React `layoutId` for Dashboard-to-Player transitions. | `antislopui-motion-specialist` | 3 | Runs parallel with Animation. Owns `<motion.div>` state and AnimatePresence. |
| `frontend/src/components/Button.tsx` | **Magnetic Interactions:** Add ZProximity hooks to purple primary CTA buttons. | `antislopui-interaction-specialist` | 4 | Runs after UI components exist. Must include the `pointer: fine` gate. |
| `frontend/src/` | **Final Gate:** Audit performance, ensure no double-driven properties, test reduced-motion toggle. | `antislopui-qa-reviewer` | 5 | Final pass. Checks React 19 compiler optimization and bundle weight. |

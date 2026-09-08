## Audit — top issues

1. **The pipeline barely reaches the screen.** On desktop, stage headers begin around **815px down**; no deal cards are visible. On mobile, the summary panel occupies roughly **690px**, with only the Filters header appearing at the bottom. Reviewing opportunities requires scrolling past reporting first.

2. **Mobile truncates information users need.** Open Pipeline reads **“$200,38…”**, while supporting text becomes “Draft and sent o…” and “Untouched in la…”. Labels wrap across multiple lines inside narrow cards. The layout preserves card dimensions at the expense of meaning.

3. **Global utilities outrank sales actions on mobile.** AI, shield, and bug icons occupy the top bar while the screen title is truncated. “New Lead” becomes an unlabeled plus; Schedule and Create Proposal have no visible equivalent in this viewport. The interface gives persistent space to utilities that are less central to moving a deal forward.

4. **The one follow-up opportunity lacks emphasis.** “Needs Follow-up: 1” receives the same treatment as zero appointments and unavailable Speed to Lead. It is the last metric, although it offers an immediate reason to contact a prospect.

5. **The metric grid wastes valuable space.** Seven cards leave an empty eighth position on both layouts. Desktop adds separate Monthly Goal and Salesperson Metrics regions beneath them, giving performance reporting several layers before users reach their work.

6. **Desktop navigation consumes a quarter of the width.** The icon rail and expanded sidebar total **360px**. Alongside generous content padding, this leaves only three complete stage columns and part of a fourth visible. The screen title also appears twice, with the top version truncated.

7. **Color emphasis and text emphasis are misaligned.** The blue canvas, gradient navigation selection, and large blue-purple Salesperson Metrics panel compete with the primary action. Meanwhile, metric labels and explanatory text are small and muted. Exact contrast needs measurement, but their visual prominence is clearly low.

## Redesign concept: **Next Coat**

Make the pipeline and the next customer action the center of the screen.

### Desktop layout

Use a **224px collapsible sidebar** containing the area switcher and Sales navigation. Merge the separate icon rail into this sidebar; collapse it to 64px when more board space is needed.

Order the main region as follows:

1. **Compact page header:** “Sales Pipeline” on the left; labeled **New lead** primary button, an **Actions** menu, and account controls on the right. Actions contains Schedule, Create Proposal, and Lost Leads. Put AI, integrations, training, and reporting utilities in a clearly labeled tools menu. Replace the instructional banner with a Help button.
2. **Single summary strip:** **Needs follow-up · 1**, **Open pipeline · $200,388.42**, and **Appointments today · 0**. Make follow-up a button that applies the existing follow-up filter. A **Performance** button opens Today’s Sales, inbound calls, set rate, speed to lead, monthly goal, and salesperson metrics.
3. **One filter toolbar:** Search by customer or address, salesperson, location, and active filter chips. Keep filters visible and compact instead of dedicating another full-width region to their container.
4. **Pipeline board:** Start it approximately **220–260px from the top**. Use horizontally scrolling columns around 264px wide, with sticky stage headers showing stage name, count, and total value. Provide a visible scrollbar and stage-jump control.

Each deal card should prioritize **customer, job location, estimate value, and next action/date**, followed by a short scope description. Show one contextual action—such as **Schedule**, **Finish proposal**, or **Follow up**—plus an overflow menu. Offer “Move to stage” alongside drag-and-drop.

This puts customer work within reach immediately and connects each opportunity to a concrete step toward booking or closing.

### Mobile layout

Default to a **stage-filtered deal list** using the same pipeline data:

- Compact header with menu, full page title, and account control.
- One tappable **Needs follow-up · 1** row.
- Search and Filters on one row.
- A labeled stage selector showing stage name and count.
- Full-width deal cards with readable amounts and a prominent next-action button.
- A persistent bottom **New lead** button, with safe-area padding and enough content padding to prevent overlap.

Keep metrics behind **Overview**, where values can use full-width rows. Preserve a Board view option for users who prefer it. This reduces sideways navigation and lets field staff act with fewer gestures.

### Component treatment

Use neutral theme surfaces through shadcn semantic tokens: `background`, `card`, `foreground`, and `muted-foreground`. Reserve the blue-to-magenta gradient for a small brand accent; use solid blue for primary actions. Keep stage colors as thin accents paired with text labels.

Use readable body text, visible keyboard focus, and at least 44px touch targets. React, Tailwind responsive layouts, and shadcn `Sheet`, `DropdownMenu`, `Select`, and `Button` components can support the structure.

## Quick wins

- Remove mobile truncation from monetary values; let Open Pipeline span both grid columns.
- Collapse Salesperson Metrics by default to recover desktop vertical space.
- Replace the persistent instructional banner with a compact Help control.
- Add a visible “New lead” label to the mobile plus button.
- Strengthen “Needs Follow-up: 1” with a blue border and a “View leads” link using the existing filter.

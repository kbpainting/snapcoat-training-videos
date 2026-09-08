## Audit — top issues

1. **There’s no visible “New appointment” action.** Refresh, Map, Progress, Cancelled, and Block Off Time all get prominent desktop buttons, but the primary scheduling action is absent from both screenshots.

2. **The calendar starts too far down.** On desktop, the global header, help banner, title card, toolbar, and date controls push the calendar grid to roughly **450px from the top**. The month extends below the viewport. Mobile spends almost 300px before reaching the selected day.

3. **Too many elements compete for attention.** Desktop weekday headers use seven saturated color blocks; toolbar buttons each have colored outlines; navigation, dates, and selection use gradients. The mobile empty day still has a bright gradient count bar. Color emphasizes the interface more than appointment information.

4. **The date and view controls communicate different things across devices.** Desktop shows a month grid headed **“Sep 7, 2026”**, rather than “September 2026.” Mobile puts **Today** beside Calendar and Map as if it were a view, although Today is a date shortcut.

5. **Appointment counts lack scope.** Both title cards say **“29 scheduled”**, while mobile says **“0 appointments scheduled”** for September 7. These may both be correct, but neither the relationship nor the filter scope is explained.

6. **Empty states consume space without helping users act.** The mobile empty-state card sits inside a large panel that continues nearly to the bottom of the screen. Its only instruction is to use the arrows; it offers no visible way to book an appointment or jump to the next scheduled visit.

7. **Navigation crowds out the task.** Desktop dedicates 360px to two left navigation columns, while the top bar truncates “Sales Appo…” alongside several utility buttons. Mobile repeats that truncated title and gives scarce header space to unexplained robot, shield, and bug icons.

8. **Some useful text is difficult to scan.** Muted gray help text, tiny uppercase metadata, and small icon labels have weak visual emphasis against dark surfaces. The calendar’s subtle grid lines also make day boundaries harder to distinguish. Exact contrast compliance would need measurement.

## Redesign concept: **Book & Go**

Make the schedule immediately readable, with booking and the next visit as the strongest actions. Preserve the blue-to-magenta gradient for the primary action and selected states.

### Desktop layout

Use **one 240px sidebar**, combining the current icon rail and contextual navigation. Keep Sales expanded with Appointments selected; place global utilities in a compact menu.

Structure the main area with 24px padding:

1. **Compact page header:** “Appointments” and a scoped subtitle such as “29 appointments · September,” with **New appointment** on the right. Move the permanent help banner into a help button. Put training, integrations, and reporting tools in the utility menu. This gives scheduling more room and makes booking easy to find.
2. **One toolbar:** salesperson filter on the left; **Agenda / Calendar / Map** view switch beside it. Put status filters, including Cancelled, in a Filters popover. Place Block off time in the New appointment dropdown; move Progress to a secondary menu. Show refresh as a quiet icon beside the last-updated indicator.
3. **Two-column workspace:** a flexible calendar plus a **320px selected-day agenda**. The calendar header contains previous/next, Today, “September 2026,” and a compact Month / Week / Day selector. Selecting a date updates the agenda without leaving the month.

Give weekday headers a neutral surface, thin visible dividers, and a consistent row height. Appointment chips show **time, customer, and visit type**, with a small labeled status indicator. Limit visible chips per cell and provide “+3 more” when needed.

The agenda shows the selected date, its appointment count, and cards ordered by time. Each card contains customer, address, assigned salesperson, and status. Opening a card reveals details and rescheduling controls. Office staff can check availability and book into the selected day without losing calendar context.

### Mobile layout

Default to **Agenda**, with this order:

1. A compact header with menu, “Appointments,” and **+ New**.
2. A salesperson filter chip and Filters button.
3. **Agenda / Calendar / Map** tabs.
4. A sticky date navigator with 44px previous/next targets, a tappable date picker, and a separate Today shortcut.
5. A chronological appointment list.

Each appointment card leads with **time and customer**, followed by address, visit type, and status. Provide clearly labeled **Directions** and **Call** actions; keep editing in the details sheet. This reduces tapping and reading while someone is traveling between estimates.

For an empty day, use a compact message: **“No appointments today”**, followed by **Book appointment** and, when available, **Next appointment · [date]**. Remove the full-height empty container.

### Component treatment

Use shadcn `Button`, `Tabs`, `Popover`, `DropdownMenu`, and mobile `Sheet` components with Tailwind responsive grids. Use shared light/dark surface and text tokens, visible keyboard focus, and text labels alongside status colors. Reserve gradients for **New appointment**, active navigation, and today’s marker so the brand guides attention toward useful actions.

## Quick wins

- Rename the desktop month heading to **“September 2026”** and explicitly scope “29 scheduled” to its actual date range.
- Replace the multicolor weekday backgrounds with one neutral surface and consistent text.
- Add a visible **New appointment** button wired to the existing booking flow.
- Remove the mobile empty panel’s minimum height and reduce its excess padding.
- Replace the always-visible help banner with a compact help popover.

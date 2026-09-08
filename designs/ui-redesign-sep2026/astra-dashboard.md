## Audit — top issues

1. **The screen doesn’t match a “today” dashboard.** Both screenshots show **Proposal Builder** and three project types. There are no daily metrics, appointments, or follow-ups to help staff decide what needs attention.

2. **Desktop space is poorly allocated.** Two navigation rails consume 360px—25% of the viewport—while most of the content area below the project cards is empty. The screen feels simultaneously crowded at the edges and sparse in the center.

3. **Utility actions dominate the header.** GARVIS AI, Generate Override Code, Connect to Zapier, Training, and Report Bug all receive prominent colored outlines. Their competing emphasis obscures the primary sales workflow; the page title is truncated even on desktop.

4. **Mobile makes a simple choice require scrolling.** Each project type occupies roughly 240px vertically, with a large icon, description, and separate Select button. At 390px wide, the third option’s button falls below the screenshot. Three choices should fit comfortably on one screen.

5. **Mobile removes meaning before removing clutter.** The header keeps several icon-only utility buttons while truncating “Proposal Builder.” The colorful controls remain visually prominent, but their purposes are no longer explained by visible labels.

6. **The controls have weak visual emphasis.** Blue “Select” labels and thin blue borders sit against near-black surfaces; secondary descriptions are muted gray. The strongest visual element is the large blue background, rather than the action users need to take.

7. **Navigation doesn’t clearly identify the current destination.** Sales is highlighted in the outer rail, but Proposals has the same treatment as neighboring links. Users can see their module without seeing their precise location.

## Redesign concept: Today’s Job Desk

Make this the daily sales home, with proposal creation one obvious action away.

**Desktop layout**

- **One 224px sidebar:** Merge the two navigation rails. Keep a Sales section with Pipeline, Leads, Appointments, Customers, and Proposals; move other modules into a compact module switcher. Give the current page a tinted background and a clear active indicator. This returns space to customer work and reduces navigation scanning.
- **A calm, single-row header:** Show location, “Today,” and the date on the left. Put **New proposal**, notifications, and the account menu on the right. Move integrations, training, override codes, and bug reporting into appropriately labeled menus. Keep GARVIS as a secondary assistant entry. Proposal creation becomes the unmistakable primary action.
- **Four compact metric cards:** New leads today, Appointments today, Follow-ups due, and Won today ($). Use large values, plain labels, and a small descriptive link. Each card opens its corresponding filtered list, turning counts into work users can complete.
- **A two-column work area beneath the metrics:** Use approximately **two-thirds width for Today’s appointments** and **one-third for Follow-ups due**. Appointment rows show time, customer, address, project type, and status, with Open estimate and Directions actions. Follow-up rows show customer, proposal value, and last-contact date, with a direct contact action. This puts travel preparation and revenue recovery within immediate reach.

**Mobile ordering**

Use a simple header with menu, “Today,” notifications, and avatar. Follow it with a **2×2 metrics grid**, the **next appointment**, **follow-ups due**, then the remaining agenda. Keep a labeled **New proposal** action in a bottom bar with safe-area padding and matching content padding.

Use full-width rows and at least 44px touch targets. Show customer, time, and address before secondary details so someone standing outside a job can quickly find the right estimate or directions.

**Proposal creation**

Move the current three cards into a desktop dialog and mobile bottom sheet. Present **Interior painting**, **Exterior painting**, and **Cabinet refinishing** as three compact, fully clickable rows with small icons and chevrons. Remove repeated Select buttons and obvious explanatory copy. All three choices fit together, shortening the path into an estimate.

**Visual treatment and implementation**

Use neutral page surfaces, elevated cards, and readable foreground colors in both themes. Preserve the blue→magenta identity in the logo, primary CTA, and small active accents; replace the full blue content background with a restrained accent.

Build with Tailwind responsive grids and shadcn `Card`, `Button`, `DropdownMenu`, `Dialog`, and `Sheet` components. Show explicit empty states and unavailable data rather than placeholder metrics.

## Quick wins

- Make project choices compact, fully clickable rows on mobile so all three fit above the fold.
- Collapse secondary header utilities into a labeled menu and allow the page title to display fully.
- Add an active treatment to Proposals in the sidebar.
- Replace outlined Select buttons with a stronger filled treatment and verify text contrast in both themes.
- Reduce the blue background to a subtle accent and increase secondary-text contrast.

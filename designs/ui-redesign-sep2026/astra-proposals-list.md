## Audit — top issues

*The desktop screenshot ends at the “Proposal List” heading; mobile ends at “Filters & Search.” Actual rows and row actions aren’t visible, so their treatment below is a redesign proposal.*

1. **The proposals are buried.** At 1440px, the list starts around **y=820**. At 390px, users reach the bottom of the screenshot without reaching search. Finding a customer’s proposal requires scrolling past the dashboard first.

2. **The page introduction consumes too much space.** “Proposals” appears in both the app bar and a large hero card. “PROPOSAL DESK · LIVE” and “View and manage all your proposals” add little actionable information. The desktop hero is roughly 180px tall.

3. **Summary metrics dominate the mobile workflow.** Six cards consume roughly **434px vertically** on mobile. “Sent: 0” receives the same space as “Draft: 34,” while the actual drafts remain inaccessible below the fold.

4. **Desktop navigation takes a quarter of the viewport.** The icon rail and expanded sidebar together occupy **360px**. This reduces room for the customer, address, amount, and actions that would make a proposal table useful.

5. **Global utilities compete with the primary task.** GARVIS AI, Generate Override Code, Connect to Zapier, Training, and Report Bug all have prominent colored outlines. On mobile, several become unexplained icons. Their visual prominence competes with creating and finding proposals.

6. **The filter card is oversized for its contents.** It occupies roughly **262px** on desktop for one row of inputs, a heading, Sync, a count, and Show Archived. Sync sits far from search, while the bottom count repeats information already supplied by the total card and list heading.

7. **Secondary text is difficult to scan.** The small, muted education banner, metric descriptions, and uppercase eyebrow labels recede strongly against the dark surfaces. The mixture of monospaced subtitles/numbers and proportional labels also fragments the hierarchy. Outdoor phone use would make the subdued text especially challenging; exact contrast needs measurement.

## Redesign concept: Close Next

Make this a working proposal queue: **find a customer, understand the status, take the next action.**

### Desktop layout

Use a **240px collapsible sidebar**, a **56px app bar**, and a main area with **24px padding**.

1. **Compact page header:** “Proposals” and a subdued total count on the left; **Create Proposal** on the right. Remove the hero card, eyebrow, and explanatory subtitle. Move the education banner into a Help popover beside the title. This immediately brings customer work higher on screen.

2. **Status navigation:** One compact row containing **All 71**, **Draft 34**, **Sent 0**, and **Accepted 22**, plus any remaining existing statuses. Treat these as filters with counts, replacing the six metric cards. Keep total and accepted dollar values in a small **Summary** disclosure for office reporting. Selecting Draft should take users directly to unfinished quotes.

3. **Single filter toolbar:** Flexible search field, Status, Salesperson, Sort, and a labeled refresh control. Put Archived in the Status menu; remove the separate archive button. Show the filtered result count beside the table header. Keep search prominent so staff can locate proposals while speaking with customers.

4. **Table immediately below:** Target the first row appearing within approximately **320–360px of the viewport top**. Use these columns:

   | Column | Treatment |
   |---|---|
   | Customer / proposal | Flexible width; customer prominent, proposal title and job address beneath |
   | Status | 112px; text badge with a small icon |
   | Amount | 112px; right aligned, tabular numerals |
   | Activity | 160px; meaningful event such as “Sent Sep 5” |
   | Salesperson | 136px; readable name |
   | Actions | 112px; one contextual action and an overflow menu |

   Use **64–72px rows**, subtle separators, and a sticky column header. Avoid placing every cell inside another card.

### Mobile layout

Use a **56px app bar** with menu, page title, and one account/utility menu. Consolidate the current utility icons there.

Order the content as:

1. **Search**, always visible near the top.
2. **Create Proposal** and **Filters** on one row, with the create action taking the available width.
3. **Status chips with counts**, wrapping into two rows when needed.
4. **Proposal cards**, with the first record beginning within roughly the first **350px**, depending on text wrapping.

Open advanced filters in a shadcn **Sheet** with Status, Salesperson, Sort, and an explicit Apply button. Show active filters as removable chips after closing it.

Each proposal card should contain:

- Customer name and a text status badge.
- Proposal title and job address.
- Amount and the latest meaningful activity.
- One full-width contextual action, with a separate **44px overflow target**.

Use **Send** for drafts, **Follow up** for sent proposals, and **View** for accepted proposals where those actions are supported. Send and Follow up should open the existing review or composition flow. Keep Preview, Duplicate, and Archive in overflow. Visible actions reduce hunting through menus on a phone and make unfinished quotes easier to advance.

### Brand and component treatment

Keep the blue-to-magenta identity in the logo, selected navigation accent, and primary action. Give global utilities quieter neutral styling so sales actions carry the emphasis.

Use shadcn `Table`, `Badge`, `Button`, `DropdownMenu`, and `Sheet`, with Tailwind responsive layouts. Apply semantic background, border, foreground, and muted-text tokens across both themes. Reserve monospaced styling for proposal IDs; use tabular numerals for money. Provide visible keyboard focus, text alongside status colors, and at least **44px touch targets** on mobile.

## Quick wins

- Remove the hero eyebrow and subtitle; reduce its padding and align the title with Create Proposal on desktop.
- Hide the six-card metric grid on mobile behind a “Summary” disclosure.
- Remove the filter card’s heading/subtitle and move Sync beside the search controls.
- Collapse the education banner into a Help button.
- Increase small helper-text size and contrast using shared theme tokens; verify both themes.

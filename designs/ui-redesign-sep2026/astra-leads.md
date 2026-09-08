## Audit — top issues

*Scope: these crops show the workspace header and controls; lead rows and an open detail view aren’t visible.*

1. **The leads are below the fold on both screens.** At 900px tall on desktop, we still haven’t reached a lead. On mobile, the first 844px contain headers, metrics, and a promotion for one hot lead. Field users must scroll before starting work.

2. **The page introduces itself repeatedly.** “LEAD WORKSPACE · LIVE,” “Lead Manager,” “51 leads ready for action,” “51 Total Leads,” and “Lead Workspace” repeat context. Large bordered containers give each introduction unnecessary weight.

3. **Four stacked metrics consume valuable mobile space.** The cards take roughly 288px, including gaps. “$0k” is awkward formatting, and “128d Avg. Age” offers no immediate next action. These summaries dominate the screen more than the customers do.

4. **The hot-lead banner is oversized and nonspecific.** It occupies about 180px on mobile but provides neither a customer name nor a follow-up action. “View Hot Leads” adds an intermediate step, and “1 hot leads” needs singular handling.

5. **Navigation and utility controls compete with the task.** Desktop has an 80px app rail, a 280px section sidebar, and a crowded utility header. On mobile, “Lead Mana…” is truncated while several icon controls retain prominent outlined boxes. The screen’s identity loses space to utilities.

6. **Control hierarchy is ambiguous.** Desktop offers both a prominent “Search” button and a lead-search input. “Grid” and “Table” have little visible distinction between states. The “New Lead” chip resembles a creation action despite sitting among status filters.

7. **Small, muted labels weaken readability.** Rail labels, helper copy, overlines, and inactive controls are visually faint against the dark surfaces. The mobile help strip wraps into two lines while contributing little to the immediate task. Exact contrast ratios would require the source colors.

## Redesign concept: Job-Ready Leads

Make the first screen answer: **Who needs attention, and what can I do next?**

### Desktop structure

- **One 232px navigation sidebar.** Combine the app rail and Sales sidebar into grouped navigation with expandable sections. Keep the SnapCoat logo and gradient active item. This returns roughly 128px to customer information.
- **A 56px utility bar.** Keep location selection, notifications, profile, and a Help menu. Move Training, Zapier, Report Bug, and Generate Override Code into appropriately labeled menus. Keep GARVIS accessible through a compact button.
- **One compact page header:** `Lead Manager · 51 leads`, with a clearly labeled **Add lead** primary button. Remove the hero panel, repeated workspace heading, and four metric cards. Put pipeline value and average age in Analytics.
- **A compact tab row:** Leads, Communication History, Lost Lead Analytics.
- **One toolbar:** lead search, Stage dropdown, **Hot · 1** filter, and Filters with an active-filter count. Replace the hot-lead banner with that filter. Rename “New Lead” to “New” wherever it denotes a stage.
- **Lead list immediately below.** Target the first row within roughly the top 280px. Use four columns: **Customer / property**, **Stage**, **Next action**, and **Owner**. Show temperature as a small labeled badge. Make due dates and overdue actions easy to scan.

Selecting a lead opens a **360px detail panel beside the list** on wide screens. Keep the selected row visible so office staff can work through follow-ups without repeatedly navigating back.

### Proposed detail layout

Order the panel around decisions:

1. Customer name, stage, temperature, and property address.
2. Clearly labeled **Call**, **Text**, and **Schedule** actions.
3. Next action and due date.
4. Job summary and proposal status.
5. Activity timeline and notes.

Keep contact actions near the top. This shortens the path from spotting an opportunity to contacting the customer or booking an estimate.

### Mobile structure

Use a single column with a compact header: menu, **Leads · 51**, and **Add**. Put utilities in the menu.

Below it, show search and Filters, followed by compact stage and Hot filters. Place History and Analytics in a secondary view menu. Remove the introductory panels and metric stack so customer cards appear in the first viewport.

Each lead card shows:

- Customer name and stage.
- Property address.
- Next action with its due time.
- Labeled Call and Text buttons with at least 44px touch targets.

Open details as a full-screen view with a clear Back control and a bottom action bar for Call, Text, and Schedule. Keep actions reachable without scrolling through the activity history.

### Component treatment

Use neutral page backgrounds, one surface level, and restrained borders. Preserve the blue-to-magenta gradient for the primary action and selected navigation. Reserve orange/red for urgent follow-ups.

Use readable body text, explicit selected states, keyboard focus rings, and text alongside status colors. Implement with Tailwind responsive grids and shadcn Table, Sheet, DropdownMenu, Tabs, Badge, and Button components, using semantic theme tokens for dark and light modes.

## Quick wins

- Hide the four metric cards on mobile and reduce desktop metrics to one compact summary row.
- Remove the repeated “Lead Workspace” heading and subtitle above the search controls.
- Change the banner to “1 hot lead needs follow-up” and reduce its mobile padding.
- Rename the status chip “New Lead” to “New” and make the selected Grid/Table option visibly distinct.
- Collapse the instructional strip into a Help control and give the mobile page title more room.

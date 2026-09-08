## Audit — top issues

1. **Mobile changes the meaning of the prices.** Desktop labels `$592.36` as **Labor Markup** and `$103.17` as **Material Markup**. Mobile calls these **Labor** and **Materials**. A salesperson could read markup amounts as actual costs. Preserve identical financial labels across breakpoints.

2. **The headers compete with the job.** Desktop repeats “Proposal Builder” and gives GARVIS AI, override codes, Zapier, training, and bug reporting prominent outlined buttons. Mobile keeps two header layers while truncating the customer’s address. Administrative utilities get space that field staff need for job context.

3. **The mobile stepper loses orientation.** “Project” is clipped on the left and “Send” is clipped on the right. The current “Rooms” pill is visible, but the sequence requires horizontal exploration. A simple “Step 4 of 6 · Rooms” would communicate progress immediately.

4. **Room controls are simultaneously crowded and space-hungry.** Desktop squeezes pricing and roughly nine action controls into one row. Mobile spreads the controls across two rows inside a roughly 250px-tall card, yet shows no individual surfaces. Small, unlabeled arrows and icons make common actions harder to identify and tap.

5. **Empty content receives too much emphasis.** Desktop gives “No custom line items” a large dashed panel, followed by another full-width add button. Meanwhile, the five existing surfaces remain hidden. The screen spends more space explaining an absence than supporting the work already entered.

6. **The pricing hierarchy is fragmented.** Base cost, red labor markup, orange material markup, green room total, and white project total use competing visual treatments. The room’s dimensions and cost labels are tiny. Muted text and chevrons also appear weak against the tinted dark surfaces; their contrast needs measurement.

7. **The mobile footer consumes substantial working space.** The fixed total, Discount, Back, and Next region occupies roughly the bottom 145px of an 844px screen. Together with the headers, it leaves little room to inspect the estimate. “Next” also misses an opportunity to explain that the next step is reviewing the proposal.

## Redesign concept: Quote Desk

Make the screen a workspace for checking scope and price, with a clear path to review.

### Desktop: scope on the left, price on the right

Keep the navigation rail. Within the page, use this structure:

- **One compact proposal header:** “Proposal Builder,” Braiden Smith, Draft, and the address on the left; saved status and Attach Renders on the right. Move AI, integrations, override codes, training, and support into a labeled **Tools** menu. This restores attention to the customer and estimate.
- **One six-step navigation row** beneath the header. Retain completed checks and use the brand gradient for the current step.
- **A two-column workspace:** flexible room editor on the left; a sticky, approximately 320px pricing panel on the right. Remove the desktop bottom action bar.

The room editor starts with **Rooms & surfaces** and an **Add room** button. Each room becomes a neutral card:

1. Header: expand control, room name, dimensions, surface count, and clearly aligned room total.
2. Actions: visible **Photos** and **Add surface** buttons; a labeled overflow menu for edit, duplicate, reorder, and delete.
3. Expanded content: a compact surface table with surface name, measurements, product/finish, amount, and edit action.

Expand the first room initially. Showing what produces the price helps staff catch missing scope before presenting the quote.

Replace the empty custom-items panel with a compact **Add custom line item** row beneath the rooms. Render a full section only when items exist, retaining its permission treatment.

The pricing panel contains subtotal, discount control, tax, and a dominant **Project total**. Put base cost and markups inside a **Cost & markup details** disclosure, with consistent labels on every device. End with **Review proposal** and a quieter Previous action. Keeping the total and next action together makes the estimate easier to assess.

### Mobile: one room at a time

Use a single column with this order:

1. Compact header: back, customer name and Draft, saved indicator, and overflow menu. Let the address open job details.
2. **Step 4 of 6 · Rooms**, with a thin progress indicator and a step-navigation trigger.
3. Rooms heading and Add room action.
4. Room cards, followed by the compact custom-item action.

Room cards retain dimensions and surface count. Keep **Photos** and **Add surface** visible with at least 44px touch targets; move secondary controls into a bottom sheet. Expanded surfaces become stacked rows, with editing in a sheet rather than a squeezed table. This keeps frequent field actions recognizable and reachable.

Use a compact sticky footer: total with “Includes 7% tax” and **Price details**, followed by Previous and **Review proposal**. Move Discount into Price details. Include safe-area spacing and matching content padding so the final item can scroll fully above the footer.

### Visual treatment and implementation

Use neutral surfaces, stronger text contrast, and restrained borders in both themes. Reserve the blue-to-magenta gradient for the primary action and current step. Use tabular numerals for prices; communicate pricing categories with labels rather than color alone.

This fits React, Tailwind responsive grids, and shadcn `Accordion`, `DropdownMenu`, `Sheet`, and `Button` components. Share the pricing component and label definitions across breakpoints to prevent the current terminology mismatch.

## Quick wins

- Rename mobile “Labor” and “Materials” to “Labor markup” and “Material markup.”
- Change this step’s **Next** label to **Review proposal**.
- Replace the mobile scrolling stepper with **Step 4 of 6 · Rooms**.
- Remove the empty custom-items placeholder; retain one add action.
- Increase room-action touch targets to 44px and add accessible names to every icon button.

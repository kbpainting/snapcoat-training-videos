# Proposal Builder — “Fieldline”

**Fieldline is a focused estimating workspace: clear scope, precise prices, comfortable touch controls, and a deliberate transition from staff work to customer presentation.**

This specification treats [the functionality inventory](ui-audit/astra/builder-inventory.md) as the implementation contract. Every existing capability retains a home. All **PROTECTED** calculations, eligibility rules, persistence behavior, accepted records, and financial workflows continue through their existing handlers and helpers.

The redesign changes presentation and interaction. Known inconsistencies documented in the inventory remain explicit implementation constraints; correcting them requires a separate change.

## Design principles

1. **Design for the hand holding the device.** On iPhone, place repeated actions near the bottom and use full-screen editors. On iPad, keep room context visible beside the work. Never require hover, precise icon taps, or dragging to complete a task.

2. **Make the room the unit of field work.** A salesperson should be able to measure, configure surfaces, change materials, capture photos, and review a room without repeatedly leaving its context.

3. **Show the price clearly and explain it on demand.** Keep the applicable total visible. Put labor, material, markup, tax, and package details in an accessible breakdown instead of compressing them into one crowded line.

4. **Distinguish included work, offered options, and accepted work.** Optional scope remains visible and priced without looking contracted. Preview selections must never look like customer acceptance.

5. **Separate staff information from customer presentation.** Internal rates, margins, crew notes, and technical scan findings belong in staff views. Customer presentation should feel intentional when the salesperson hands over an iPad.

6. **Make operational state trustworthy.** “Saved,” “queued,” “email processing,” “accepted,” and “paid” describe different events. Display the actual state and provide an actionable recovery path.

7. **Use restraint to create a premium feel.** Neutral surfaces, consistent spacing, strong typography, and a small amount of blue-to-magenta accent replace pervasive gradients, glowing borders, and competing toolbar buttons.

## Navigation & flow architecture

### The builder shell

Replace the stacked application header, builder header, progress strip, and oversized section banner with one focused shell.

| Region | iPhone | iPad | Desktop |
|---|---|---|---|
| Context header | 56px; customer/proposal identity, save status, Close, More | 64px; Back to Proposals, identity/address, save status, Attach Renders, utilities | Same, with fuller labels and optional collapsed application rail |
| Progress | 44px current-step button: “4 of 6 · Rooms”; opens step list | 48px row containing all six steps | Same |
| Workspace | One vertical content region | Room navigator plus working pane where useful | Wider working pane; optional contextual aside |
| Action dock | Cart row above Back/Next row | Back, shrinking cart, Discount, Next in one row | Same, with additional statistics |
| Application utilities | More sheet | Utilities popover | Utilities popover and application rail |

The utilities destination retains GARVIS AI, Generate Override Code, Connect to Zapier, Training, Report Bug, notifications, profile, theme, and application navigation. Notification counts remain available. These functions stop competing with estimating controls.

**Responsive rules use available workspace width, not device identity:**

- **Below 768px:** single-column layout and full-screen editors.
- **768–1099px:** compact tablet layout; room navigator becomes a drawer when it would leave less than 480px for editing.
- **1100–1399px:** 240px room navigator, 24px gutter, flexible detail pane.
- **1400px and above:** optionally add a 300–320px contextual aside only when the central workspace remains at least 640px wide.

At the supplied **1194 × 834** iPad size, the focused shell leaves roughly 640px of vertical workspace before inner padding. At **390 × 844**, the standard phone shell leaves approximately 590px, depending on safe-area and application-banner insets.

Use one main vertical scroll region per compact screen. Desktop and expanded tablet master/detail panes may scroll independently, with clear boundaries. Never place a scrolling form inside a scrolling card inside the page.

### Progress model

Keep the six canonical steps and their existing numbering:

**1 Customer → 2 Project → 3 Template → 4 Rooms/Areas → 5 Summary → 6 Send**

Each step has one of four presentations:

- **Current:** accent indicator and explicit label.
- **Completed/available:** checkmark; selectable.
- **Upcoming:** muted and unavailable.
- **Skipped for this flow:** dash and explanation; unavailable.

The progress display communicates position, not a fabricated percentage of work completed. Completing Customer does not imply one-sixth of the estimating effort is finished.

On iPhone, tapping the current-step button opens a bottom sheet containing all six numbered steps. Also expose this sheet through the dock’s contextual menu so navigation is reachable without stretching.

Earlier-step navigation uses the existing eligibility rules. Future steps never become freely selectable.

Back and Next remain outside the content scroller. Back is disabled on Customer. A real step change resets both the builder scroller and window scroll. Closing a same-step editor restores focus and visibility to its originating item.

### Alternate routes

| Flow | Route and presentation |
|---|---|
| Standard | All six numbered steps |
| Cabinet flat-rate | Customer → Project with embedded cabinet wizard → Summary → Send. Steps 3 and 4 show “Not used for cabinet pricing.” |
| Cabinet flat-rate change order | Customer → Summary → Send. Project, Template, and Rooms are skipped. Existing cabinet change orders open Summary after restoration. |
| Simple custom-item proposal | Keeps the numbered route. Step 4 centers custom items; Summary and Send use the simple presentation when the existing eligibility condition is satisfied. |
| All-fixed-price package configuration | Step 4 presents package selection and applicable custom-item tools instead of ordinary room entry. Preserve its separate step-4 and step-5 validation rules. |
| SnapScan with production rates | Capture/review/import → step 4 with imported rooms revealed |
| SnapPrice/SnapRates | Capture/review/import → Project when unset, otherwise Template |
| Existing proposal | Show a restoration state before exposing editing. Proposals with rooms open step 4 after hydration. |
| Revision | Respect the supported `revise=true` entry path and existing signed-record guard |
| Change order | Persistent mode banner, original financial baseline, locked package behavior, supported scope edits, and remote approval only |

Cabinet wizard stages use names—**Count, Packages, Add-ons, Custom Services, Review**—rather than introducing another competing numbered proposal sequence.

### Validation and error placement

Validation remains authoritative in the existing navigation and action handlers.

| Trigger | Presentation |
|---|---|
| Missing or invalid field | Inline message beneath the field; invalid state includes text and icon |
| Failed Next | Compact error summary above the step content; focus the first relevant field or section |
| Required context missing | Disabled dependent control with a visible explanation |
| Server rejection | Persistent actionable banner; preserve entered content |
| Save conflict or permission failure | “Changes aren’t saving.” Show the returned reason and existing recovery actions |
| Transport failure queued successfully | “Saved on this device · waiting to sync” or “Queued to send,” as applicable |
| Photo/handoff gate | Purpose-specific sheet that retains the pending action where the existing workflow supports resumption |

Preserve these distinctions exactly:

- Customer and project selection are required at their respective steps.
- Template selection is optional.
- Ordinary step 4 accepts a room or a non-optional custom item.
- Empty rooms can pass step 4 but cannot alone pass Summary/send validation.
- Optional custom items alone do not establish billable scope.
- Qualifying zero-priced scope remains valid; billable-scope validation is not a positive-dollar test.
- A fixed-price package may satisfy step 4 while step 5 still requires the inventory’s qualifying billable item.
- Cabinet setup requires a positive count; in-person cabinet signing additionally requires a selected package.
- Presentation, send, and signature handlers revalidate independently.

For fixed-price proposals lacking qualifying scope, Summary explains the specific requirement and links to the applicable custom-item or scope entry. It must not silently create a charge or relax validation.

### Persistent cart and save status

The cart appears from step 4 when qualifying scope exists. Its expanded state survives rerenders.

**Phone:** a compact total row with “View breakdown” and Discount sits above Back/Next.  
**iPad:** Back, total, Discount, and Next share one dock; the total column uses `min-width: 0`.  
**Desktop:** add room/surface counts, labor hours, or the applicable custom-item/cabinet statistics.

Label the amount according to the existing calculation context: scope amount, package-inclusive proposal total, cabinet offer range, or change-order adjustment. Do not imply that every step uses the same pricing basis.

Tapping the total opens the breakdown sheet. It contains:

- Labor/material bases, applicable hours/gallons, production markups, and package treatment.
- Room breakdowns and custom items, including FREE items.
- Optional scope separately identified as excluded from the contracted base.
- Optional custom preview selections.
- Discount and expiration.
- Tax and the applicable total.
- Original/new/adjustment amounts for change orders.
- Shortcuts to existing room and package/Summary destinations.

The primary Discount control remains available across roles. Preserve additional admin-only shortcuts under the applicable staff quick actions.

Save status is a control that opens a small activity panel:

| State | Visible wording |
|---|---|
| Hydrating | Restoring proposal… |
| Main autosave active | Saving… |
| Server save accepted | Saved · relative timestamp |
| Local queue accepted | Saved on this device · waiting to sync |
| Server rejection | Changes aren’t saving |
| Photo pending | 2 photos waiting to upload |
| Schedule save failed | Payment schedule changes haven’t saved |
| Change order | Change order · saved through its existing submission flow |

Do not show “Saved” merely because an animation finished.

## Screen-by-screen spec

### Step 1 — Customer

#### iPad layout

Use a two-column workspace:

- **Left, approximately 60%:** customer search and results, replaced by the selected-customer card.
- **Right:** salesperson assignments and eligible SnapScan entry.
- Place appointment context and CompanyCam recommendations beneath the selected customer when applicable.

Search results are comfortable 72–88px rows containing name, customer badge, and available email, phone, and address. The entire row is selectable.

Keep the two-character minimum, approximately 350ms debounce, 30-result limit, and distinct initial/loading/empty states. Do not introduce unbounded server searches.

The selected card provides **Edit Info** and **Change Customer** as labeled actions.

#### iPhone layout

Stack search/customer card, salesperson assignment, and SnapScan entry. Selection dismisses the search keyboard and reveals the draft status.

Edit Info opens a full-screen form with a bottom Save action. Use appropriate email, telephone, and address input affordances. Keep Google address suggestions within the active interaction layer so selecting a suggestion does not dismiss the editor.

All existing fields remain available: names, contact information, address and unit, gate code, source, and lead notes. Pipeline stage remains visibly read-only and excluded from the update payload.

Salesperson allocation opens a short sheet. Show two names and complementary percentage fields; a text summary states “Total: 100%.” Preserve all existing defaults, clamping, tolerance, exclusions, and role eligibility.

#### Behavior and improvement

Selecting a customer establishes the draft through the existing lead-resolution workflow. Show an explicit pending/error state if a customer-only record cannot be converted offline.

Respect URL preselection, appointment association, returned lead IDs, and intentional customer changes during later hydration.

SnapScan and manual estimation remain parallel choices. Hide SnapScan when ineligible or in change-order mode.

**Improvement:** customer selection becomes a short, legible task, while staff assignments remain available without crowding the primary decision.

---

### Step 2 — Project

#### iPad layout

Present three large project cards:

- Interior Painting
- Exterior Painting
- Kitchen Cabinets Refinishing

Each card contains a simple icon, project name, a short description, and a clear selection control. Selection must be understandable without relying on border color.

With multi-category enabled, cards behave as independent selections. Display selected categories beneath them in selection order, identifying the first as the primary category.

A right-side context panel explains what the choice controls: available templates, rates, materials, presets, and terminology.

#### iPhone layout

Use full-width stacked cards with 56px or larger selection rows. Keep explanations within each card; avoid a separate sidebar.

For multi-category work, a compact category switcher persists into Template and Scope. It opens a labeled sheet rather than squeezing several truncated category chips into the header.

#### Cabinet and switching behavior

Flat-rate cabinet cards explain their exclusivity before selection. Selecting them replaces other categories; selecting another category replaces flat-rate cabinets.

Automatically open the cabinet wizard only for a new, unconfigured flat-rate cabinet proposal. Restoring an existing proposal must not reopen it unnecessarily.

When a primary-project change would clear rooms on a new proposal, show the actual affected scope before committing that action. Keep the existing room-clearing behavior; do not apply it to existing-proposal editing or assume category deselection deletes all associated scope.

Category template snapshots retain their existing initialization, removal, and preservation rules. Legacy unstamped scope remains attributed to the first selected category.

**Improvement:** project selection explains its consequences instead of allowing an apparently cosmetic choice to produce surprising scope changes.

---

### Step 3 — Template and package configuration

#### iPad layout

Use a template list on the left and a preview on the right.

Each compatible template card shows name, description, project type, and Default indication. **No Template · Build from scratch** is a first-class option.

The preview has three sections:

- **Customer appearance:** logo, header, cover, and representative content.
- **Packages:** configured tiers and their presentation.
- **Terms and payment defaults:** deposit, milestones, warranty, validity, and other carried settings.

For multiple categories, render a separate template choice for each category. The active category switcher controls the editor; a compact checklist shows which categories have a selection.

#### iPhone layout

Stack template cards. Tapping Preview opens a full-screen read-only view; selecting a template remains a separate, explicit action.

A bottom action uses **Use Template** when a selection is pending. Continuing without a template remains available.

#### Package preview

Show each package’s name, tagline, description, icon/color, features, services/products, warranty, price treatment, estimated duration, and promotional metadata where configured.

Mark staff-only markup information clearly. Preserve:

- Percentage and fixed-price packages.
- Enabled/disabled states and the supported packages-off behavior.
- Saved package snapshots and selected tier.
- ID normalization and existing JSON parsing.
- Built-in fallback tiers and their exact Best 30%, Better 15%, Good 7% markups.
- Better default selection where applicable.
- Valid-selection recovery when tiers become unavailable.

Provide **Manage templates in Settings** as the destination for package editing. This preview does not become a second package editor.

For multi-category proposals, the preview explains the categories contributing to the combined tiers. The existing engine composes tiers by array position, uses the first applicable presentation metadata, and retains each category’s own pricing inputs—including fixed-price tiers and unmarked categories.

Retain video, cover, AI appointment-summary, financing, footer, customer-display, payment, and terms configuration even when those properties are not individually editable here.

**Improvement:** the salesperson can inspect the customer-facing result and commercial defaults before entering scope, while saved configuration remains stable.

---

### Step 4 — Rooms, areas, surfaces, and custom items

This is the primary field workspace and the first screen to rebuild.

#### iPad layout

Use two persistent regions:

| Region | Content |
|---|---|
| Room navigator, 240px | Category sections, room names, surface counts, optional indicators, room totals, Add Room, Custom Items destination |
| Working pane | Selected room or expanded room list, surface rows, room details, photos, scan artifacts, contextual actions |

The navigator supports quick reveal/scroll to a room, individual collapse, category collapse, and Expand/Collapse All.

The working-pane room header contains:

- Room name and applicable dimensions.
- Surface count and room total.
- Optional status/group.
- **Add Surface**, **Photos**, and **More**.

More contains labeled actions for Edit Room, Change Materials, Duplicate, ordering, optional controls, and Delete. The most frequently used actions stay visible.

At wider desktop sizes, allow several expanded rooms and denser surface tables. Keep the same commands and underlying state.

#### iPhone layout

Show compact room cards in a single vertical list. A collapsed card contains:

- Name and expand control.
- Room total.
- Dimensions and surface count.
- Optional/group status when relevant.

Expanding reveals surface cards followed by photos and scan artifacts. Surface cards show the customer label, quantity/coats summary, total, and an Edit action.

A bottom **Add** action sheet offers Add Room/Area and Add Custom Item. While a room is active, it also offers Add Surface and Photos for that room. These duplicate the visible room actions for thumb reach.

A **Rooms** navigator sheet lets the rep jump through a long proposal without scrolling past every expanded surface.

Replace the current phone card’s scattered rows of tiny icons with two labeled frequent actions and one 44px-or-larger More control.

#### Room creation and presets

The Add Room editor begins with **Preset** or **Custom**.

On iPad, use a compact two-column preset grid beside editable room details. On iPhone, select the preset first, then reveal the same editable details within the editor.

Support all measurement models:

| Model | Visible measurement fields |
|---|---|
| Area | Length, width, height |
| Surface | Length, width |
| Wall | Measured run, height |

Use exterior-specific labels and perimeter/run entry where applicable. Hidden dimensions must follow existing normalization behavior and cannot silently block submission.

Preserve manual defaults of 10 × 10 × 8, preset dimensions, required names, negative/positive validation, and the zero-geometry exception for entirely count/hour-item presets.

A **Manage local presets** destination supports creation, deletion, and reset. It preserves project-specific storage, the 16-entry limit, company/local ID distinctions, malformed-storage recovery, asynchronous company preset refresh, and all built-in presets:

- Interior: Living Room, Master Bedroom, Bedroom, Kitchen, Bathroom, Dining Room, Office, Hallway, Accent Wall.
- Exterior: Exterior Home, Exterior Driveway, Exterior Patio, Exterior Shed.

Adding a preset room retains default-category resolution, available default surfaces, measurement metadata, whole-gallon behavior, and fresh entity IDs.

#### Room editing, duplication, and ordering

Room editing uses a single editor with Details and Surfaces sections. Existing surfaces remain manageable inside it; adding or editing a surface changes the editor’s internal view instead of stacking dialogs.

Duplication preserves the existing distinction:

- Empty room: duplicate immediately.
- Populated room: show name, with-surfaces/empty choice, and optional replacement dimensions.

Show which dimensions will carry over when left blank. Apply the existing normalized-name validation, adjacent insertion, fresh IDs, automatic-quantity recalculation, and manual-quantity preservation.

Ordering supports:

- Pointer dragging from an explicit handle, retaining the 8px activation threshold.
- A deliberate touch interaction on that handle.
- Move Up/Move Down controls with boundary states.
- Keyboard sorting and position announcements.

Never require dragging. Keep persisted order identical across proposal, PDF, and work-order output.

For deletion, name the affected room and surface count. Surface deletion retains existing local/server behavior and failure reporting. Do not invent a client-only Undo that suggests a server deletion has been reversed.

#### Surface add/edit flow

Use one **Surface Composer** with three internal views: **Choose, Configure, Review**.

**iPad:** open a wide sheet within the viewport. Show the catalog on the left and per-rate configuration on the right.  
**iPhone:** use a full-screen editor with internal Back navigation, a selection count, and a bottom action. Quantity prompts stay inside this editor.

**Choose**

- Pin the target room and active project/category.
- Search internal name, client label, and description using existing all-term matching.
- Preserve company order and collapsible surface-type groups.
- Support individual selection, Select All Filtered in Category, Clear Selections, and Clear Search.
- Mark rates already present.
- Distinguish active choices from linked archived records available only for editing.
- Respect project metadata matching, legacy fallback, and usable-material linkage requirements.
- Keep loading, empty-catalog, no-match, and failed-creation states separate.

**Configure**

Each selected rate owns its own state. Selecting another rate must never copy the previous rate’s count, coats, condition, or material accidentally.

| Input | Interaction |
|---|---|
| Geometry-derived quantity | Show value and source; provide Manual Override |
| Item count | Integer minus/plus controls and direct entry; retain minimum one |
| Stored-hours-per-item rate | Enter count; show configured hours relationship |
| Legacy manual-hours rate | Enter positive total labor hours; support applicable fractions |
| Coats | Ordinary 1–4 control; existing profile-specific limits and hidden states |
| Condition | Excellent, Good, Fair, Poor |
| Prep and masking | Separate nonnegative hour fields |
| Material | Default product, override chooser, Reset to Rate Default |
| Description | Customer-facing default with editable replacement |
| Notes | Separate Customer Notes and Crew Notes fields |

Show a clear **Automatic** or **Manual** quantity indicator without exposing internal calculation markers to the customer.

Material information distinguishes exact usage from whole gallons billed where applicable. Product cost and coverage details remain available to staff.

**Review and commit**

Keep the existing operations distinct:

| Operation | Commit wording and behavior |
|---|---|
| Add selection | “Add 3 surfaces”; exclude already-present duplicates |
| Replace a selected set | “Update selection · 2 added, 1 removed”; retain unchanged configurations |
| Edit one surface | “Update surface” |
| Edit with queued additions | “Update surface + add 2” |
| No change | Explicit no-change outcome |

Deselected existing rates are removed only through the supported replacement flow. A formerly active rate must not reappear automatically.

Cancel discards the editor’s uncommitted changes. Canceling a count/hour prompt does not add that rate.

Inline counted-surface controls use the existing full-catalog repricing path. If the linked rate is unavailable, show the existing direction to Edit rather than calculating a substitute.

#### Materials

**Change Materials** opens a room-scoped chooser with product name and brand. The action states **Apply to all surfaces in Living Room**.

Require a selected product, clear chooser state on cancel, update all applicable room surface product IDs, and invoke existing repricing. Make clear that the action changes proposal surfaces; global production rates remain managed elsewhere.

#### Optional rooms, surfaces, and groups

Use a small **Included / Optional** control on room and surface detail views.

Optional scope receives a neutral outlined treatment and explicit “Not included” wording. It remains priced and discoverable.

For whole optional rooms:

- Show the group at room level.
- Disable individual surface optional controls with the reason “Controlled by optional room.”
- Retain underlying surface flags.
- Avoid displaying the room and its surfaces as separate additive offers.

The group selector supports Ungrouped, existing groups, and inline creation. Preserve trimmed-name validation, Enter-to-create, cancellation, stable IDs, cross-room membership, and missing-declaration fallback labels.

An **Optional scope** workspace action opens bulk operations. Show candidate surface types with affected room count, surface count, amount, and skipped surfaces. Preserve category scoping, candidate sorting, mixed-selection behavior, clear-optionality behavior, and one-update commits.

Accepted optional scope is identified as accepted and follows the existing contracted calculation. The informational optional total never becomes an automatic addition.

#### Custom line items

Custom Items is a permanent section/destination, including for room-based proposals. It is not visually labeled Admin unless the specific action actually requires that role.

**iPad/desktop:** readable rows for title, category, quantity, unit price, total, optional/package badges, and actions.  
**iPhone:** cards with the same fields and labeled Edit/More actions.

The editor supports:

- Manual creation and category-grouped templates.
- Required title and description.
- Bold, italic, underline, and bulleted lists.
- Quantity ≥ 0.01 and nonnegative unit price.
- FREE display for zero-price items.
- Independent Optional and Affected by Package Pricing switches.
- Existing template approval and override-code workflow.
- Save/update, cancel, delete, and up/down ordering.

Template selection appears during creation; ordinary edits retain item identity and metadata.

Optional custom items remain separate from room/surface groups. Their Summary/Send selections are labeled **Preview addition**, not Accepted.

SnapPrice items open a specialized measurement editor. It edits source measurement and applicable coats, then uses the existing SnapPrice helper to retain the quantity-one customer lump sum and internal scan metadata.

Legacy negative discount lines remain a hydration/save compatibility concern. They do not become a new negative-price authoring control.

**Improvement:** the entire estimating task becomes readable at room level, while detailed controls move into one coherent editor instead of spreading across icon toolbars and stacked dialogs.

---

### Cabinet flat-rate wizard

#### iPad

Open a wide wizard with a left-side stage list and right-side content. Keep the current count and effective offer total/range visible.

#### iPhone

Use a full-screen sequence with named stages and persistent Back/Continue actions. Package cards stack; add-on rows use large selection targets.

| Stage | Required presentation |
|---|---|
| Count | Doors/drawers field with existing 1–200 bounds and positive-count validation |
| Packages | Eligible packages in configured order; features, count limit, pricing, premium/best-value labels |
| Custom package branch | Base premium configuration, custom name/details/count, positive price |
| Add-ons | Active choices, Select All/Clear All, package-specific included/FREE treatment |
| Custom Services | Add/edit/delete; required title/price, optional description, FREE support |
| Review | Count, offered packages, add-ons, custom services, total/range |

Preserve new-versus-existing defaults, eligibility reevaluation, removal of newly ineligible selections, and at least one offered package.

Intermediate navigation continues to propagate selections at existing callbacks. Close/reopen retains the documented reset-and-restore behavior. Save full package/add-on/custom-package snapshots and existing duration/material metadata.

Summary provides explicit edit shortcuts back into this wizard. Saved snapshots remain usable when live catalog retrieval fails.

---

### SnapScan workspace

SnapScan opens outside the numbered step content, then returns through its existing import route.

#### iPad

Use a capture/review workspace with a room list, large plan/room preview, and a correction panel. Native scanning may temporarily own the viewport.

#### iPhone

Use full-screen capture and review. Review cards show one room at a time with full-width completion actions. **Add & Scan Next Room** remains available on the applicable native path.

The workspace contains:

- Eligibility, hardware, native/browser simulation, progress, cancel, and specific tracking/low-light failure states.
- Multiple captures, removal before import, floor identification, dimensions, openings, objects, warnings, and scan IDs.
- Editable names with AI labels and collision handling.
- Walls, ceiling, baseboard, crown, doors, and windows.
- Nonnegative measurement corrections committed on Enter/blur.
- Zero-count doors/windows that remain visible for missed detections.
- Existing selection/count/coats behavior and no-selected-surfaces validation.
- Return to scanning and recoverable import-error handling.

**Review with Customer** removes internal unit rates, labor/profit estimates, and technical warnings. It restricts direct measurement editing while retaining the implemented scope/count/coat interactions.

AI Vision appears as an informational section with uploading, pending, running, completed, and timeout states. Findings show label/count/confidence and accessible note details. Textured-ceiling findings can direct staff to manually add an appropriate rate; they never silently add priced scope.

Production-rate import retains catalog-readiness retry, matching preference/order, default material/coats, manually preserved scan quantities, crew-note destination, skipped-kind reporting, and append behavior.

SnapPrice import retains its own rate card, coat factor, estimates, package-affected items, attribution, customer-safe descriptions, and Project/Template route.

**Saved Captures** appears in room/Summary views only when content exists. It includes floor plans, supported 3D/AR links, HD photos, archived findings, and **Add from Previous Scan**. Archived additions preserve current SnapPrice-helper pricing, positive-quantity selection, title-based duplicate prevention, and portal-based pickers/lightboxes.

---

### Photos and attached renders

#### Room photos

Photos opens a room-scoped sheet on iPad and a full-screen gallery/editor on iPhone.

Expose Gallery and the existing iOS **Take Photo** path. Show format guidance, the 50MB limit, selected-file preview/name/size, removal, compression/upload progress, and distinct uploaded versus queued status.

The gallery supports thumbnails, full-image viewing, metadata, fallback image loading, and confirmed staff deletion. Retain public-token read-only behavior.

CompanyCam appears as a labeled source with connection/project/loading/empty states. Keep the address-matched Link/Not Now recommendation, existing company connection, and room attachment flow. It does not ask the rep to sign in separately.

#### Attached renders

Attach Renders remains in the header once customer and saved proposal identity exist. On iPhone it becomes an accessible icon/count action.

The picker shows before/after images, colors, project/date metadata, attached states, and multi-selection. Preserve per-render attachment requests, partial-success reporting, and count refresh.

This workflow attaches existing renders. Generation and detach controls are not introduced.

---

### Step 5 — Summary

#### iPad layout

Use a large review pane with a 300px financial/notes aside where space allows.

The primary pane contains:

1. Project/customer context and scope statistics.
2. Package comparison, when applicable.
3. Included scope and custom items.
4. Optional offers and preview selections.
5. Photos and saved scan artifacts.

The aside contains the price breakdown, discount, duration, handoff notes, and customer job note. At compact tablet widths it becomes a normal section below the scope.

Clearly identify this as **Staff Review**.

#### iPhone layout

Stack:

1. Total and scope status.
2. Package selection.
3. Included scope.
4. Optional offers.
5. Handoff/customer notes.
6. Detailed internal breakdown.

Use section disclosure controls with useful summaries. A collapsed section must still reveal a validation problem.

Package options appear as stacked cards with all tier names and totals visible. Do not make horizontal swiping the only way to discover a tier.

#### Standard summary

Package cards show effective prices, enabled features/services, warranty, duration, badges, and relevant savings. Selection uses the existing pricing engine and remains locked in change orders.

A **Compare details** sheet aligns features across tiers. Multi-category details show each category’s contribution without replacing the existing shared presentation metadata.

Room/surface review includes applicable dimensions, quantities, coats, material, labor, costs, markup, and totals. Edit opens the correct scope/edit state with an explicit Return to Summary destination. Delete invokes existing surface-deletion behavior.

The financial breakdown exposes:

- Base labor/material.
- Production labor/material markup.
- Package-affected required items and package markup.
- Non-package required items.
- Discount.
- Applicable pre-tax subtotal, tax, and total.

Show actual derived values, including valid zero or negative adjustments. Scan/custom-only proposals explain that their price is carried in items; zero production labor/material is not presented as an empty proposal.

Group qualifying `Room — Surface` scan items by room prefix. Preserve FREE items and package/optional badges.

#### Simple-item summary

Activate only under the existing condition: no surfaces and no required package-affected custom items.

Show descriptions, quantities, unit prices, subtotal, optional preview additions, tax, discount, and total. Omit ordinary package comparison. Keep saved scan captures where present.

Removing the discount clears both existing state representations.

#### Cabinet summary

Show count, offered packages, add-ons, custom services, effective package prices, duration where saved, and salesperson split information.

When remote package choice remains open, show the price range and explain that the customer chooses. Do not force the rep to choose prematurely.

Change orders show original amount, updated amount/range, and signed additional charge or credit.

#### Notes

Use two explicitly different editors:

- **Project handoff notes — for the project manager**
- **Customer job note — appears on the proposal**

Keep these distinct from lead notes, crew notes, surface customer notes, and template job notes.

On phone, each opens a full-screen text editor with a bottom Done action. Required handoff notes show trimmed character count against the configured minimum.

Retain session persistence, saved-note restoration, and protection against overwriting text already being typed. Main draft save status must not imply that session-only note behavior has changed.

#### Discounts

Open the same Discount editor from the dock, Summary, and applicable customer-preview controls.

Show amount/type, expiration, code state, and remove action. Dollar/percentage selection exposes the applicable calculated dollar equivalent.

Preserve:

- Positive input and maximum 100% percentage.
- Percentage-to-dollar storage and safe reopening.
- Future date/time, configured timezone, and all four presets.
- Backend thresholds/policy/code validation and uppercase codes.
- Exact role bypasses and override-use logging.
- Existing percentage bases for ordinary versus cabinet flows.
- Post-package subtraction, expiration behavior, duplicated-state synchronization, and accepted-record protection.

**Improvement:** the salesperson gets a deliberate review checkpoint with readable package choices and notes, without conflating staff economics with the customer proposal.

---

### Step 6 — Customer preview and delivery setup

#### iPad layout

Use a **320px staff setup panel** beside a flexible customer-preview pane.

The setup panel contains:

- Delivery mode.
- Customer/email status.
- Scope/package/total preflight.
- Photo and handoff readiness.
- Customer display controls.
- Deposit, card-fee, and payment-schedule editors.

The preview renders the customer-facing document with its actual branding and content.

**Expand preview** fills the viewport with the customer document and a clear Exit Preview control. It removes staff pricing and editing chrome.

#### iPhone layout

Use two local tabs within step 6: **Setup** and **Preview**. These are views of the same step, not additional wizard steps.

Setup contains stacked settings rows that open focused sheets. Preview shows the customer document at readable width. The persistent final action remains available without requiring the user to scroll through the entire document.

#### Delivery modes and preflight

Ordinary proposals offer Remote and In Person. Change orders show remote approval with an explanation that in-person signing is unavailable.

Preflight shows customer/email, scope, package, total/tax, effective deposit, delivery mode, and photo guidance, with existing edit shortcuts.

Missing email blocks remote delivery, not in-person signing or presentation without sending.

For cabinets:

- Remote mode keeps offered packages available for customer choice.
- In-person mode requires one selected package and applicable add-ons.
- Switching modes follows existing reset behavior.
- Premium-included add-ons show FREE.
- Custom services, discount, tax, deposit, and schedule reflect the existing selected calculation.

#### Customer display controls

Expose exactly the five existing controls:

- Line-item pricing.
- Surface dimensions.
- Units.
- Coats.
- Material names.

Use proposal overrides before template defaults and visible fallback according to the existing resolver. Retain saved labor/material-breakdown and total-hours flags without inventing corresponding switches.

The known finalization-spread precedence discrepancy is a release test and a separate correction candidate. A styling change must not silently change outgoing payload precedence.

#### Proposal presentation

Preserve all existing content:

- Company identity, logo, template header, cover settings, and footer.
- Customer/contact/project details.
- Attached before/after renders and color swatches.
- Package cards, enabled visibility controls, features, services, warranty, badges, savings, and prices.
- Scope, custom items, optional preview additions, and customer notes.
- Investment, discount, tax, total, and deposit.
- Terms, acceptance, validity, warranty, payment terms, additional notes, and job notes.
- Template/worker video behavior and supported AI appointment-summary configuration.
- Telephone/email links and normalized website links.

Package visibility has an accessible eye action labeled **Show to customer**. Prevent hiding the final enabled package, recover selection as currently implemented, and lock both selection and visibility in change orders.

Customer line prices retain existing package uplift allocation. Internal markup/profile labels never enter customer text.

Terms use readable expandable sections with sanitized HTML and supported legacy plain text.

Preserve the distinction between the shared primary-template builder preview and downstream category-specific content.

#### Deposit, card fee, and payment schedule

| Editor | Design |
|---|---|
| Deposit | Show effective amount and source. Percentage/fixed amount mode, reset to default, and applicable code entry |
| Card fee | Show configured/custom label, effective percentage, waiver/reset, fee amount, and total card charge |
| Payment schedule | Editable milestone cards with label, type/value, supported due trigger, description, remove, add, and reset |

The deposit editor retains formatted-number parsing, blank clearing, mutually exclusive overrides, caps, seeding, precedence, and exact caller-specific defaults. Do not replace the documented ordinary/cabinet/send fallback differences with one new universal default.

Card fees retain configuration/Stripe gating, the 0–4% effective range, explicit-zero waiver semantics, code policy, and charge-time calculation. Display fee money separately from proposal total, invoice principal, schedule principal, and balance reduction.

Payment schedules retain:

- Saved-schedule priority and asynchronous default seeding.
- Separate approximately 900ms writes.
- Existing pre-tax calculation basis.
- Percentage-first allocation, fixed allocation, remainder splitting, and cent reconciliation.
- Separate milestone override-code behavior.
- Trigger-date/automation metadata.

Fixed-date trigger metadata remains preserved; this redesign does not add a date input that the current editor lacks.

Show schedule saving/failure independently. Schedule writes, code validation, and processor payments must not inherit an offline-success badge from the proposal outbox.

#### Send, present, and sign

**Remote Send Proposal** opens the existing choice dialog:

- **Send Now**
- **View Customer Proposal — Don’t Send**
- Cancel

Explain the delivery outcome beside each choice.

Presentation validates scope, saves through the existing path, requires a usable numeric proposal ID, and opens the authenticated presentation link in the same tab. Preserve draft status and presentation-mode tracking behavior. Email is not required solely to present.

Remote sending preserves finalization-before-email, complete payloads, idempotency, rates-version metadata, validity, asynchronous generation, portal delivery, PDF fallback, logging, and automations.

Change orders use their dedicated remote approval path and final label.

#### In-person signing

Use a full-screen signing surface on phone and a large, centered signing sheet on iPad.

The visible order is:

1. Customer/project and signer/date identity.
2. Applicable subtotal, tax, total, and deposit.
3. Terms with scroll guidance.
4. Signature canvas.
5. Clear and **Accept & Continue**.

The phone signature canvas uses the available width and at least approximately 180px height; the iPad canvas is larger. Prevent page scrolling only while drawing within the canvas. Rotation/resizing must preserve strokes and the resulting PNG signature.

Do not add a read-to-bottom requirement or acceptance checkbox. Require only the existing nonempty signature and validation.

Completion rechecks handoff requirements, saves acceptance and financial snapshots, then creates or reuses the invoice. Payment collection opens only after invoice creation succeeds.

If invoice creation fails after acceptance, show the actual accepted state and existing recovery path. Do not imply the customer needs to sign again or attempt duplicate acceptance.

#### Payment collection and completion

Preserve the shared payment flow:

**Amount → Method → Processing/result → Receipt/completion**

Show deposit/full-amount shortcuts and an edit-amount Back action. Preserve manual amount through ordinary method changes and settle bounds in cents.

Visible methods remain the applicable configured card processor, enabled BNPL options, and **Pay In-Person** for deferred office collection.

Pay In-Person must state **Payment will remain pending**. It does not record cash collection.

BNPL retains coded eligibility, full-amount behavior, deposit restoration on exit, and distinct surcharge treatment. Preserve the existing difference between package financing messaging and modal eligibility wiring.

Use existing Stripe and Helcim interfaces and authoritative status checks. Helcim pending bank payments remain pending. Declines, cancellations, initialization failures, and retries stay within the appropriate flow.

Retain shared terminal, offline-recording, token, and milestone branches for other callers without adding new builder method buttons.

After successful payment:

- Offer the applicable receipt choice once.
- Preserve payment success if receipt delivery fails.
- Retain invoice-email options where used.
- Finalize/send the signed proposal.
- Run the protected success countdown and automatic navigation.

Use distinct result wording for remote submission, signed-and-paid, signed-with-payment-deferred, and change-order submission. Keep remote follow-up actions available: Present Customer Portal, Copy Customer Link, and Back to Proposals.

Copy Link uses the real public-link generator, Safari asynchronous clipboard support, and a manually copyable fallback.

**Improvement:** staff setup, customer review, legal acceptance, and payment each have a clear interaction stage and an accurate outcome.

## Animation & motion language

Motion confirms navigation and state changes. It must never delay data entry, saving, or payment processing.

Define these easing tokens:

- **Enter:** `cubic-bezier(0.22, 1, 0.36, 1)`
- **Standard:** `cubic-bezier(0.2, 0, 0, 1)`
- **Exit:** `cubic-bezier(0.4, 0, 1, 1)`

| Interaction | Motion |
|---|---|
| Step change | 180ms opacity transition with at most 12px horizontal travel; reverse direction for Back |
| Phone sheet presentation | 240ms enter from bottom; 180ms exit |
| iPad side panel | 220ms enter with 24px maximum travel |
| Backdrop | 140ms opacity only |
| Room expand/collapse | 180ms for a small section; large room bodies reveal without animating full content height |
| Add item | 160ms fade with 6px translation; reveal the inserted row |
| Remove item | 120ms fade; compact nearby rows only |
| Reorder | Active item follows input; neighboring items settle over 160ms |
| Price update | Replace digits immediately; 180ms subtle background emphasis |
| Button press | 80ms tonal response; optional 0.99 scale on large buttons |
| Save completion | 120ms icon/text crossfade |
| Successful send/sign | 240ms checkmark reveal and one bounded confetti burst, approximately 700ms |

Prices use tabular numerals and stable layout. Do not count money through intermediate values.

Confetti is limited to a small particle count and never appears for autosave, item addition, or queued offline work. Preserve the existing success celebration while keeping it brief.

For reduced motion, remove translation, scale, reorder animation, and confetti. Use immediate updates or brief opacity changes. Timers required by the existing completion workflow remain functional.

For field performance:

- Animate transforms and opacity; avoid large blur, animated gradients, and page-wide layout animations.
- Scope Framer Motion to the active transition or changed rows.
- Do not animate entire proposal lists when totals change.
- Lazy-load images and memoize stable room/surface rows.
- Reserve image dimensions to prevent layout movement.
- Never put signature strokes or processor updates through decorative animation.
- Profile on physical field iPads; target 60fps during scrolling, drawing, and interaction.

## Component system

### Visual tokens

| Token | Light | Dark |
|---|---|---|
| Canvas | `#F5F7FB` | `#0D1117` |
| Primary surface | `#FFFFFF` | `#151B24` |
| Raised surface | `#FFFFFF` | `#1C2430` |
| Primary text | `#172033` | `#F2F5FA` |
| Secondary text | `#536176` | `#B1BED0` |
| Decorative divider | `#DCE2EC` | `#303D50` |
| Interactive boundary | `#7B8799` | `#63748B` |
| Brand blue | `#2454D8` | Accent adapted for contrast |
| Brand magenta | `#AD258F` | Accent adapted for contrast |

These are starting tokens; verify every actual foreground/background combination. Normal text targets at least 4.5:1 contrast and qualifying large text 3:1, following [WCAG contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

Light mode is a fully designed field theme, with readable outlines and no dependence on shadows. Dark mode uses neutral surfaces rather than purple-tinted cards throughout.

Default to the user’s stored theme or system preference. Provide theme switching in utilities. Customer preview follows its actual presentation configuration rather than blindly inheriting staff colors.

### Typography and spacing

Use the existing product font if suitable, with a system sans-serif fallback.

| Role | Size / line height |
|---|---|
| Main screen title | 24/32px; 22/28px on phone |
| Section title | 18/26px, semibold |
| Body and input text | 16/24px |
| Supporting information | 14/20px |
| Compact metadata | 12/16px; never required instructions or primary prices |
| Main total | 28/34px; 24/30px on phone |
| Row price | 16/24px, semibold, tabular numerals |

Spacing scale: **4, 8, 12, 16, 24, 32, 40, 48px**.

Phone content gutters are 16px. iPad gutters are 24px. Use 12–16px within related field groups and 24–32px between sections.

Avoid fixed-height cards containing variable text. Long customer names, room names, translations, and larger text settings must wrap.

### Touch and controls

All independent controls have at least a **44 × 44 CSS-pixel target**, including icon actions, disclosure controls, and drag handles. This deliberately adopts the enhanced target size described by [WCAG](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html).

Primary actions and frequently used field controls are preferably 48–56px high. Maintain at least 8px between adjacent independent actions.

Use:

- Real labels above fields.
- Units visibly associated with numeric inputs.
- Appropriate input modes and keyboard actions.
- Explicit minus/plus controls for counts.
- Text alternatives to color and icons.
- Accessible names that include context, such as “Photos for Living Room.”

### Cards, rows, and sheets

**Cards:** 12px radius, 1px boundary, restrained elevation. A selected card uses a checkmark, stronger border, and subtle accent wash.

**Rows:** 56px minimum for ordinary touch rows; larger when multiple lines are needed. Desktop density can reduce unused space but not interactive target size.

**Sheets:** 20px top corners on phone, bounded viewport height, fixed local header/footer, one scrolling interior. Use body portals for overlays, especially scan pickers and lightboxes.

**Menus:** labeled action rows; destructive actions separated at the bottom.

**Dialogs:** short confirmations or decisions only. Long forms use sheets/full-screen editors.

**Focus:** trap focus in the active modal layer, restore it to the trigger, and preserve Google autocomplete interaction. Internal editor navigation replaces stacked dialogs.

Gesture dismissal applies only where safe. Uncommitted editor state, signature processing, and protected success transitions must follow their existing cancel/dismiss rules.

### Gradient rules

Use a blue-to-magenta gradient for:

- The current-step accent.
- The active surface’s primary action.
- A small brand signature in the shell.

Avoid gradients on room backgrounds, price text, every outline, or every toolbar action. A neutral secondary action should not compete with Next or Save.

The active dialog owns the primary visual emphasis; its background page becomes visually quiet.

### Price, status, and privacy components

Create shared presentation components for:

- `Money`: existing settled value, tabular numerals, FREE and signed adjustment variants.
- `PriceBreakdown`: supplied engine outputs; no independent arithmetic.
- `ScopeStatus`: Included, Optional, Accepted Optional, Preview Addition.
- `SaveStatus`: server, queue, rejection, and timestamp states.
- `PermissionGate`: existing role/configuration behavior and code prompts.
- `NotesField`: explicit destination and applicable character count.
- `CustomerPreview`: existing customer-safe rendering and visibility rules.

Quoted totals use primary text. Reserve semantic green for confirmed positive states rather than making every estimate amount look like a completed payment.

### Viewport and accessibility behavior

Use dynamic viewport sizing and safe-area insets. Include the application bottom-banner offset in the dock calculation.

An editor’s action dock replaces the background proposal dock. When the keyboard appears, keep the active field and editor action visible without leaving a second fixed footer behind it.

At narrow widths, enlarged text, or split-screen iPad sizes, switch to the compact layout without changing proposal state.

Support keyboard navigation, visible focus, screen-reader field errors, polite status announcements, and keyboard sorting. Price announcements occur after meaningful committed edits, not every keystroke.

## Functionality preservation map

The headings below mirror the inventory. Child headings are qualified where needed. **Every bullet within each referenced section remains a requirement of its listed destination**, including behaviors that live in controllers rather than visible controls.

| Inventory heading | Home in Fieldline |
|---|---|
| **Steps & flow** | Builder shell and existing route controller |
| Standard flow | Six numbered steps |
| Alternate flows | Route table, cabinet wizard, SnapScan return routes, revision/change-order mode |
| Navigation and validation | Progress controls, persistent dock, inline errors, authoritative existing handlers |
| **Per-step features** | Steps 1–6 and their associated workspaces below |
| **Step 1 — Customer** | Customer workspace |
| Search and selection | Customer search/results/selected card; existing draft and lead-resolution controller |
| Edit Info | Customer information editor |
| Salesperson commissions — **PROTECTED** | Salesperson allocation sheet and unchanged financial payloads |
| SnapScan entry | Eligible customer-context entry |
| **Step 2 — Project** | Project cards and active-category switcher |
| Cabinet exclusion rules | Project-card explanations and cabinet route guard |
| Current project-switch behavior | Impact disclosure and existing project-change handler |
| **Step 3 — Template and package configuration** | Template chooser and read-only configuration preview |
| Templates | Per-category chooser, No Template option, saved snapshots |
| Template-carried behavior | Appearance/defaults preview; retained downstream content |
| Package configuration — **PROTECTED** | Template package preview, Summary selection, Send visibility |
| Multi-category package composition — **PROTECTED** | Category contribution details and unchanged composition engine |
| **Step 4 — Rooms, areas, and surfaces** | Scope workspace |
| Room/area creation | Preset/custom room editor |
| Room presets | Preset chooser and Manage Local Presets |
| Room editing and organization | Navigator, room editor, collapse controls, sorting actions |
| Room duplication — **PROTECTED** | Immediate empty-room copy or populated-room duplication sheet |
| Room cards and scope display — **PROTECTED** | Room headers, surface rows/cards, details, photo/scan sections |
| Surface catalog and selection — **PROTECTED** | Surface Composer: Choose |
| Surface editing — **PROTECTED** | Surface Composer: Configure/Review and existing server/local handlers |
| Quantities, coats, and time — **PROTECTED** | Per-rate configuration and inline count controls |
| Materials — **PROTECTED** | Per-surface material chooser and Change Materials sheet |
| Descriptions and notes | Surface customer description, customer notes, crew notes |
| **Step 4 — Optional rooms, surfaces, and groups** | Optional controls and Optional Scope workspace |
| Optional scope controls — **PROTECTED** | Included/Optional selectors and group selector |
| Bulk optional operations — **PROTECTED** | Category-scoped bulk optional sheet |
| **Step 4 — Custom line items** | Custom Items section/destination |
| Creation and editing — **PROTECTED** | Custom-item editor, cards/table, ordering controls |
| Template approval | Existing override prompt inside item-creation workflow |
| Optional custom items — **PROTECTED** | Item switch and separate Summary/Send preview selections |
| Legacy custom-item discounts — **PROTECTED** | Existing hydration/save conversion; Discount presentation |
| SnapPrice custom items — **PROTECTED** | Specialized source-measurement editor |
| **Cabinet flat-rate wizard — launched from Project and summary edit actions** | Cabinet workspace |
| Count step — **PROTECTED** | Count stage |
| Packages step — **PROTECTED** | Offered-package and custom-package stages |
| Add-ons step — **PROTECTED** | Add-ons stage |
| Custom items step — **PROTECTED** | Custom Services stage |
| Wizard summary and persistence — **PROTECTED** | Review stage and existing snapshot/navigation callbacks |
| **SnapScan — capture, review, import, and archived captures** | Full-screen capture/review workspace |
| Capture | Native/browser capture and availability/error states |
| Review and corrections | Room review and per-kind measurement controls |
| Customer co-review | Review with Customer mode |
| AI Vision | Informational analysis panel with upload/poll states |
| Import with company production rates — **PROTECTED** | Existing production-rate importer; return to step 4 |
| SnapPrice/SnapRates import — **PROTECTED** | Existing SnapPrice importer; return to Project/Template |
| Saved capture panel | Saved Captures, lightboxes, 3D links, Add from Previous Scan |
| **Photos — available from rooms and reinforced before sending** | Room Photos and Send preflight |
| Capture/upload | Gallery/Take Photo, preview, compression/upload/queue states |
| CompanyCam | Link recommendation and CompanyCam photo source |
| Photo display | Gallery/lightbox, metadata, staff deletion, public read-only mode |
| **Attached color renders** | Header attachment picker and customer preview |
| **Step 5 — Summary** | Staff Review workspace |
| Standard summary — **PROTECTED** | Packages, scope, financial details, edit/delete shortcuts |
| Simple-item summary — **PROTECTED** | Conditional item-focused summary |
| Cabinet summary — **PROTECTED** | Cabinet offers, selection/range, configuration shortcuts |
| Notes | Separate handoff and customer-job-note editors |
| **Discounts — available from cart and summary/customer preview** | Shared Discount editor |
| Discount modal — **PROTECTED** | Amount/type/expiration/code controls |
| Pricing and expiration — **PROTECTED** | Existing discount helpers, expiration status, accepted-record guards |
| **Step 6 — Customer preview and delivery setup** | Setup panel/tab and Customer Preview |
| Delivery selection | Remote/In Person selection with cabinet/change-order behavior |
| Send preflight | Readiness rows and edit shortcuts |
| Customer display controls | Five-control display sheet; retained additional saved flags |
| Proposal presentation | Customer document renderer and expanded preview |
| Cabinet customer presentation — **PROTECTED** | Remote offered packages or in-person package/add-on choice |
| **Deposits — PROTECTED** | Deposit editor and unchanged caller-specific resolution |
| **Card-fee overrides — PROTECTED** | Fee editor and existing processor-specific charging |
| **Payment schedules — PROTECTED** | Milestone editor and separate save/controller path |
| **Send, present, signature, and payment completion** | Final action flow |
| Send-choice dialog | Send Now / View Customer Proposal — Don’t Send |
| Present without sending | Existing save, numeric-ID, public-link, same-tab presentation path |
| Remote sending — **PROTECTED** | Existing finalization, delivery, generation, logging, automation handlers |
| Signature and terms | Full-screen/large-sheet signing surface |
| Acceptance and invoice creation — **PROTECTED** | Existing acceptance snapshot and invoice sequence |
| Payment modal — **PROTECTED** | Shared sales-rep payment flow |
| BNPL — **PROTECTED** | Existing financing messaging and modal method branches |
| Receipts and completion | Receipt/invoice choices, countdown, finalization, deferred completion |
| Shared payment branches versus builder wiring | Preserved shared modal internals; unchanged builder-visible methods |
| Success overlay | Accurate result states, bounded celebration, portal/link/list actions |
| **Cross-cutting behaviors** | Single proposal controller and shared services |
| Instant drafts, hydration, dirty tracking, and autosave | Existing draft lifecycle with new status presentation |
| Offline outbox | Existing queue/storage/replay services and activity/outbox UI |
| Permission and feature gates | Existing authenticated company gates and exact role policies |
| Handoff gates | Required Notes and Add Job Photos First sheets |
| Pricing engine and financial data — **PROTECTED** | Existing engine, snapshots, settlement, and financial handlers |
| Calculation profiles and precision — **PROTECTED** | Existing per-surface profiles, rounding, saved rates, and recalculation rules |
| Taxes — **PROTECTED** | Existing tax helpers and accepted metadata; clearly labeled amounts |
| Change orders — **PROTECTED** | Mode banner, original/new/adjustment review, locked package, dedicated send/cancel |
| Persistent cart and quick actions — **PROTECTED** | Action dock and stable breakdown sheet |
| Content preservation and downstream contracts | Existing payload/render adapters and retained opaque fields |
| **Device-specific behaviors today** | Responsive shell and platform adapters |
| Mobile phones | Internal scroll region, safe dock, full-screen editors, camera/signature support |
| Tablets | Shrinking cart, master/detail layouts, touch workflows, native LiDAR, viewport portals |
| Desktop/browser | Tables, fuller labels, keyboard/pointer input, file picker, simulation, public links |
| Native versus web persistence and connectivity | Existing Capacitor/web storage, foreground/network draining, file handling, Safari clipboard |

## Build plan

### Phase 0 — Establish the protected boundary

Document the current proposal controller and its responsibilities before moving UI:

- Draft creation/hydration and dirty tracking.
- Route eligibility and alternate-flow entry.
- Catalog loading and saved snapshot retention.
- Pricing and optional-scope helpers.
- Autosave/outbox.
- Notes and milestone persistence.
- Finalization, change orders, acceptance, invoice creation, and payment.

Create representative fixtures for ordinary, optional, multi-category, fixed-price, simple-item, cabinet, scan, legacy-profile, accepted, and change-order proposals.

Record expected settled amounts and payloads. New views receive existing calculated values; they do not rebuild pricing in display components.

Explicitly preserve `snapcoat_per_coat`, `dripjobs_cumulative`, legacy markers, PaintScout rounding, valid zero/negative adjustments, per-line versus aggregate rounding boundaries, saved rates, tax metadata, and locked package snapshots.

### Phase 1 — Introduce the shell without replacing behavior

Add design tokens, responsive shell, stepper, dock, save status, and sheet primitives.

Keep the current step bodies and behavior-bearing dialogs mounted through the existing controller. There must be only one live autosave owner and one set of payment/finalization side effects.

Introduce a server-controlled company/rep rollout flag plus a stable proposal-level assignment. The assignment must survive replacement of a queued draft UUID with a numeric ID.

Use independent flags for the shell and later step views so rollback does not require reverting unrelated work.

### Phase 2 — Rebuild Step 4 first

Ship in small slices:

1. Room navigator, room cards, and surface presentation using existing editors.
2. Custom-item presentation and room actions.
3. Surface Composer and room editor.
4. Optional-scope and bulk-material presentation.
5. Photos and scan-artifact presentation.

This targets the screen with the greatest field-use benefit while initially retaining the highest-risk dialogs.

Validate on physical iPhone and iPad before expanding the cohort.

### Phase 3 — Customer, Project, Template, and alternate workspaces

Replace steps 1–3 with the new layouts. Then adapt cabinet, SnapScan, and media workspaces.

Preserve draft identity, customer conversion, category selection order, template snapshots, archived-catalog editing, cabinet intermediate callbacks, and exact scan return routes.

Do not migrate or rewrite saved proposal content merely because a proposal opens in Fieldline.

### Phase 4 — Summary and customer preview

Replace Summary and the read-only Send preview first.

Verify staff/customer separation, optional-preview effects, package visibility, category contribution displays, discounts, notes, and all specialized summaries.

Keep existing send/sign/payment components available behind their own flags until their behavior has passed parity checks.

### Phase 5 — Delivery, signing, and payment presentation

Adapt the presentation around the existing handlers and shared processor components.

Roll out remote sending, presentation-only, in-person signing, and payment presentation separately. Pin active acceptance/payment transactions to their current implementation until completion; a flag change must not remount a processing payment modal.

Preserve exact role distinctions. In particular, custom-item template approval must not inherit the broader superadmin bypass used by discount/deposit/milestone workflows.

### Autosave and offline invariants throughout

Keep the approximately **1.5-second main autosave**, hydration/catalog holds, user-change tracking, concurrency timestamp, and signed/change-order suppression.

Retain suspicious-wipe and incomplete-hydration guards, including their documented limitation around deleting the final saved room/surface. Display the rejection accurately rather than bypassing it.

Preserve:

- Existing-lead offline draft creation with client UUID.
- Draft → autosave/finalization → email dependencies.
- Latest-snapshot replacement for queued autosaves.
- ID patching and idempotency on replay.
- Permanent-failure dependency handling.
- Web local-storage and native application-data journals.
- Multipart photo reconstruction and file cleanup.
- Initialization/connectivity/foreground/heartbeat draining.
- Backoff, retention limits, corrupt-journal recovery, retry, and discard behavior.

Do not homogenize caller-specific queuing behavior into a new universal “offline success” wrapper.

Keep milestone saves and session notes separate. Preserve documented note-clearing behavior and the lack of a general ordinary-exit flush/confirmation guarantee unless separately corrected.

For handoff notes, retain the trimmed minimum with floor 25/default 200 and resume the stored pending action after valid notes. For photo gates, retain the rendered Got It/retry flow; do not revive the unused CompanyCam auto-resume action.

### Release checks

| Area | Required evidence |
|---|---|
| Financial parity | Identical settled rows/totals, package treatment, discounts, taxes, deposits, fees, acceptance amounts, and change-order adjustments |
| Persistence parity | Save/reopen preserves IDs, order, notes destinations, category snapshots, optional selections, videos, and opaque legacy fields |
| Navigation | Every standard/alternate route and validation distinction behaves as inventoried |
| Offline | Draft, autosave, finalization, and photo replay survive restart; queue state never masquerades as delivered email |
| Concurrency | Conflicts and server rejections preserve entered work and show a persistent error |
| Acceptance/payment | No duplicate acceptance, invoice, or charge; pending/declined/deferred states remain distinct |
| Permissions | Each role and company gate retains its exact behavior |
| Devices | Supplied 390px phone, 1194px landscape iPad, and 1440px desktop; also portrait, split-screen, keyboard-open, and rotation |
| Accessibility | Target sizes, contrast, enlarged text, VoiceOver, keyboard sorting, focus restoration, reduced motion |
| Performance | Smooth real-device scrolling, room editing, image loading, sheet transitions, and signature drawing |

Roll out to an internal company, then a small opt-in rep cohort, then progressively wider company cohorts. Monitor save rejection, abandoned edits, send failure, duplicate requests, and rendering performance.

Rollback switches presentation at a safe boundary while retaining the same proposal state and services. It must not reload away an active edit or interrupt an acceptance/payment transaction.

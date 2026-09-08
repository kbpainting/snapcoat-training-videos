# Proposal Builder — Functionality Inventory

Scope: `client/src/pages/sales/proposal-builder-redesign.tsx`, its behavior-bearing dialogs/components/hooks, shared pricing and optional-scope helpers, offline outbox, and connected send/payment workflows.

**PROTECTED** identifies production-rate access, quantity calculations, money calculations, accepted financial records, and their persistence. Where a subsection is marked **PROTECTED**, that designation applies to all its pricing behavior.

## Steps & flow

### Standard flow

1. **Customer**
   - Find and select a lead or customer.
   - Review/edit contact information.
   - Assign salesperson commission splits.
   - Create an instant proposal draft.
   - Launch SnapScan when enabled.
2. **Project**
   - Choose Interior Painting, Exterior Painting, or Kitchen Cabinets Refinishing.
   - Select multiple categories when the company feature is enabled.
   - Enter the cabinet flat-rate workflow when configured.
3. **Template**
   - Choose a project-compatible template or proceed without one.
   - Review template package configuration.
   - In multi-category mode, choose templates separately for each category.
4. **Rooms & Surfaces / Areas & Surfaces**
   - Build and organize measured scope.
   - Add/edit surfaces, materials, optional scope, custom items, and photos.
   - For an all-fixed-price package configuration, show package selection instead of ordinary room entry.
5. **Summary**
   - Review scope, package choices, internal pricing, optional-item previews, discounts, and totals.
   - Enter project handoff notes and customer job notes.
   - Render specialized summaries for cabinet flat-rate and simple custom-item proposals.
6. **Send**
   - Review customer presentation.
   - Configure visible details, deposit overrides, card-fee overrides, and payment schedule.
   - Send remotely, present without sending, or sign and collect/defer payment in person.

### Alternate flows

- **Cabinet flat-rate proposal:** Customer → Project/cabinet wizard → Summary → Send; skips Template and Rooms.
- **Cabinet flat-rate change order:** Customer → Summary → Send; additionally skips Project.
- **Simple custom-item proposal:** Uses the numbered flow, but renders a simpler summary/customer preview when there are no surfaces and no required package-affected custom items.
- **SnapScan with production rates:** Imports rooms/surfaces and opens step 4.
- **SnapScan with SnapPrice/SnapRates:** Imports priced custom items and opens Project if a project was not established, otherwise Template.
- **Existing proposal:** Restores saved scope and configuration; proposals containing rooms move to step 4 after hydration.
- **Existing cabinet change order:** Restores cabinet configuration and opens its summary.
- **Revision:** `revise=true` permits the supported revision entry path through the signed-proposal guard.
- **Change order:** Uses an original-proposal snapshot, locked package behavior, adjustment pricing, and a dedicated remote approval send path.

### Navigation and validation

- Previous/Back and Next controls persist below the scrollable step content.
- Previous is disabled on step 1.
- Next follows the active standard or cabinet sequence.
- Step chips permit navigation to earlier completed steps; future steps are not freely selectable.
- Cabinet step-chip navigation respects skipped steps.
- The progress track still uses the six-step numbering.
- Changing steps resets both the content container and window scroll position.
- Customer selection is required to leave step 1.
- Project selection is required to leave step 2; multi-category mode requires a selected category/project.
- Cabinet flat-rate setup requires a positive door/drawer count.
- Template selection is optional.
- Ordinary step 4 permits progression with a room or a non-optional custom item.
- Fixed-price step 4 requires a selected package, except the simple-item branch.
- Step 5 requires a surface or non-optional custom item in ordinary mode.
- Optional custom items alone do not satisfy billable-scope validation.
- Billable-scope checks test the presence of qualifying scope, not whether its dollar value is positive.
- Empty rooms can pass ordinary step 4 but cannot alone pass step 5/send.
- **Current fixed-price distinction:** A package can satisfy step 4 while step 5’s billable-item check still requires a surface or non-optional custom item.
- Cabinet summary progression is permitted after cabinet setup; in-person cabinet signing additionally requires a selected package.
- Final action labels adapt to Send Proposal, Sign Proposal, or Send Change Order.
- Sending disables the final action while work is underway.
- Send, presentation, and signature handlers perform their own validation beyond button enablement.
- Header Back to Proposals and mobile Close navigate to the proposal list.
- The rendered flow ends at step 6; retained step-7 validation and “Start New Proposal” fallback code are not an additional reachable wizard step.

## Per-step features

### Step 1 — Customer

#### Search and selection

- Search leads/customers by name, email, or phone.
- Require at least two search characters.
- Debounce searches by approximately 350 ms.
- Limit server search results to 30.
- Show initial typing guidance, loading state, and no-results state.
- Distinguish customer records with a customer badge.
- Show available customer name, email, phone, and address.
- Select a result and replace search with the selected-customer card.
- Change Customer returns to selection.
- Support customer/lead preselection from URL context.
- Preserve an intentional customer change instead of repeatedly overwriting it from hydration.
- Create an instant draft upon selection.
- For customer-only records, create/resolve the associated lead through the backend.
- Use the returned lead ID instead of assuming customer and lead primary keys match.
- Associate drafts with the supplied appointment when applicable.
- Prevent a customer-only offline selection from pretending its required lead conversion succeeded.

#### Edit Info

- Open the imported Edit Lead dialog for lead-backed selections.
- Load current lead information when the dialog opens.
- Edit first name, last name, email, phone, street address, unit/apartment, gate code, city, state, ZIP, source, and lead notes.
- Require first and last names of at least two characters.
- Validate email format and minimum phone length.
- Use Google address autocomplete to populate address/city/state/ZIP.
- Keep the dialog open when interacting with the Google autocomplete dropdown.
- Display pipeline stage as disabled/read-only; proposal status manages it.
- Exclude stage from the update request.
- Save changes, display errors/success, and refresh relevant lead/pipeline caches.
- Cancel or close without submitting.
- Disable relevant controls during save.

#### Salesperson commissions — **PROTECTED**

- Default primary salesperson to the current user.
- Limit selectable salespeople to commission-enabled users.
- Default a single salesperson to 100%.
- Add a second salesperson.
- Initialize a two-person split at 50%/50%.
- Exclude the primary salesperson from secondary selection.
- Edit split percentages.
- Clamp percentages to 0–100 and maintain complementary values.
- Validate that the split totals 100%, with the implementation’s tolerance.
- Remove the second salesperson and restore 100%/0%.
- Restore saved salesperson assignments and splits.
- Carry assignments/splits into save, acceptance, and send payloads.

#### SnapScan entry

- Show SnapScan only when the server reports company eligibility.
- Require customer context.
- Suppress the entry in change-order mode.
- Preserve manual estimation as an available parallel workflow.

### Step 2 — Project

- Offer Interior Painting, Exterior Painting, and Kitchen Cabinets Refinishing.
- Show selected state and project-specific wording.
- Use Areas & Surfaces terminology for exterior work.
- Load project-compatible production categories, rates, materials, templates, and room presets.
- Read the multi-category feature flag through the authenticated company-features endpoint.
- With multi-category enabled, toggle multiple project categories.
- Treat the first selected category as the primary category for legacy fields.
- Store multi-category proposals with the multi-category content/snapshot fields.
- Use the active category to scope subsequent template/scope entry.
- Attribute legacy unstamped rooms/custom items to the first selected category.
- Remove deselected categories’ template entries.
- Retain existing category template snapshots rather than continually replacing them with defaults.
- Seed missing category templates from the category default or first available template.

#### Cabinet exclusion rules

- When cabinets use flat-rate pricing, cabinets cannot coexist with another selected category.
- Selecting flat-rate cabinets replaces other selected categories.
- Selecting another category replaces flat-rate cabinets.
- Explain the exclusion on the project cards.
- Enter the cabinet wizard automatically for a new, unconfigured flat-rate cabinet proposal.
- Avoid reopening that wizard merely because an existing proposal is being restored.
- Defensively prevent flat-rate mode from activating for a true multi-category selection.

#### Current project-switch behavior

- Changing the primary project type on a new proposal clears rooms.
- Editing an existing proposal avoids that room-clearing effect.
- Category selection itself does not uniformly delete all previously entered category scope; the primary-project change effect is a separate behavior.

### Step 3 — Template and package configuration

#### Templates

- Display compatible template cards with name, description, project type, and default indication.
- Allow No Template/build-from-scratch.
- Select a template and apply its proposal configuration.
- Normalize template logo URLs.
- Restore saved template/content configuration when editing.
- Preserve saved package definitions until an explicit template change unlocks/replaces them.
- In multi-category mode, render a separate template choice for each selected category.
- Save category template snapshots alongside the legacy primary template.
- Use the primary template for the builder’s shared header/terms presentation.
- Preserve category-specific settings for downstream customer rendering.

#### Template-carried behavior

- Company branding, logo, header color/content, footer content.
- Package enablement and package definitions.
- Payment terms, warranty, contract terms, acceptance text, validity, additional notes, and job notes.
- Deposit configuration.
- Default payment milestones.
- Customer display defaults.
- Video URL, video placement, and autoplay.
- Cover-related settings and AI appointment-summary visibility.
- Template financing/package eligibility metadata where supplied.

#### Package configuration — **PROTECTED**

- Show package names, descriptions, taglines, icons, colors, features, additional services/paint products, warranty, markup, and fixed-price details.
- Support percentage-priced and fixed-price packages.
- Support package estimated days and promotional/popular/savings information.
- Honor package-level enabled/disabled state.
- Turning packages off clears active package presentation/calculation state.
- Parse saved package JSON.
- Normalize package IDs.
- Fall back to the built-in three tiers when a valid three-package configuration is unavailable.
- Built-in fallback markups are Best 30%, Better 15%, Good 7%.
- Default selection to Better when applicable.
- Restore a saved selected package.
- Prevent invalid/hidden selection from leaving the proposal without an available selected tier.
- Package editing is performed in **Settings → Proposal Templates**.
- The builder’s template/package preview is not a full package editor.

#### Multi-category package composition — **PROTECTED**

- Enable package presentation when at least one selected category enables packages.
- Compose corresponding category tiers by array position.
- Use the first applicable category’s tier for shared presentation metadata.
- Price each category using its own tier configuration.
- Include categories without packages at their unmarked category base.
- Support fixed-price category tiers within a multi-category estimate.
- Preserve category pricing inputs even though the displayed tier uses shared metadata.
- Recalculate when a non-primary category template changes.
- Use the highest positive category-template deposit percentage for the combined proposal.

### Step 4 — Rooms, areas, and surfaces

#### Room/area creation

- Add a room/area manually or from a preset.
- Enter a custom name.
- Support three measurement models:
  - **Area:** length, width, height.
  - **Surface:** length and width.
  - **Wall:** measured run and height.
- Default manual dimensions to 10 × 10 × 8.
- Use exterior-specific wording and measured exterior runs.
- Require a room name.
- Reject negative dimensions.
- Require positive dimensions relevant to the measurement model.
- Convert blank/invalid hidden dimensions to zero so a hidden width cannot silently block Wall submission.
- Allow zero geometry when a preset’s default rates are entirely item-count/hour-item based.
- Preserve measurement type, default category IDs, and whole-gallon behavior on the room snapshot.
- Add default surfaces from a preset’s configured category default rates.
- Skip unavailable/unresolvable default rates.
- Assign fresh proposal entity IDs.

#### Room presets

- Read company-managed room types.
- Merge/select appropriate company and local presets using the preset helper.
- Keep company IDs distinct from local timestamp/string IDs.
- Save local presets separately by project type in browser storage.
- Filter cached presets to their project type.
- Recover from malformed local storage by using defaults.
- Inject the Accent Wall preset into older applicable cached lists.
- Built-in interior presets:
  - Living Room, Master Bedroom, Bedroom, Kitchen, Bathroom, Dining Room, Office, Hallway, Accent Wall.
- Built-in exterior presets:
  - Exterior Home, Exterior Driveway, Exterior Patio, Exterior Shed.
- Preserve each preset’s default dimensions and measurement model.
- Add Custom Area/Room with name, optional description, and default dimensions.
- Use perimeter/height inputs for custom exterior presets.
- Limit local preset lists to 16 entries.
- Delete custom local presets.
- Clear the current preset selection when deleting its selected custom preset.
- Reset local presets to defaults.
- Refresh asynchronously loaded company presets without clearing rooms already entered.

#### Room editing and organization

- Edit room name, preset, and applicable dimensions.
- Display and manage the room’s existing surfaces inside the room editor.
- Add/edit/delete surfaces from that editor.
- Update or cancel the room dialog.
- Delete rooms.
- Collapse/expand individual rooms.
- Expand/collapse rooms together.
- Use the quick room navigator to reveal/scroll to a room.
- Group scope under collapsible category sections in multi-category mode.
- Reorder rooms with up/down controls.
- Disable movement beyond the first/last position.
- Reorder rooms by drag and drop.
- Support pointer dragging with an 8-pixel activation threshold.
- Support keyboard sorting.
- Persist room order for downstream proposal/PDF/work-order use.

#### Room duplication — **PROTECTED** for resized quantities/pricing

- Duplicate a room immediately when it has no surfaces.
- For populated rooms, open a duplication prompt.
- Offer duplication with surfaces or as an empty room.
- Generate a unique suggested name.
- Allow a custom duplicate name.
- Reject duplicate names using the normalized-name helper.
- Permit optional replacement dimensions; blank values retain the source dimensions.
- Preserve the measurement model and room/category metadata.
- Assign new room and surface IDs.
- Insert the copy adjacent to the original.
- Recalculate automatically derived quantities when dimensions change.
- Preserve manually specified quantities.
- Preserve meaningful unique room names used by photo/color/work-order associations.

#### Room cards and scope display — **PROTECTED**

- Show room name, dimensions, surface count, cost, labor hours, and material quantities where applicable.
- Show optional-room status/group.
- Expose Photos, Add Surface, Edit, Change Materials, Duplicate, Delete, and ordering controls.
- Show customer descriptions and notes where relevant.
- Render room photos below scope.
- Display existing scan captures in applicable room/summary views.
- Distinguish optional scope from included scope.

#### Surface catalog and selection — **PROTECTED**

- Require a valid target room.
- Load active production rates/categories and materials.
- Filter by project/category.
- Respect explicit category estimate-type metadata before legacy name-based matching.
- Use project-specific legacy filtering when metadata is absent.
- Honor company display order.
- Keep archived/inactive records linked to an existing surface available for editing that surface.
- Exclude new material-requiring choices that lack the required usable product linkage.
- Search across internal name, client label, and description.
- Match all search terms.
- Clear search.
- Group rates by surface type and expand/collapse those groups.
- Show staff-facing internal names while preserving client-facing labels/descriptions.
- Select one or multiple production rates.
- Select all filtered choices in a category.
- Clear selections.
- Keep per-rate quantity/coats/condition configuration independent.
- Preserve already-entered surface data for retained selected rates.
- Add newly selected rates.
- Remove deselected existing rates in the multi-selection replacement flow.
- Do not resurrect a rate merely because it was once the form’s active selection.
- Report added/removed counts and no-change outcomes.
- Do not create a second copy of an already-present rate through the add-selection path.
- Handle no matching rate/no created surface with explicit errors.

#### Surface editing — **PROTECTED**

- Edit production category/rate.
- Edit coats, condition, prep time, masking time, quantity mode/value, material, and notes.
- Hydrate all editable values each time the dialog opens.
- Distinguish replacing the edited surface’s rate from queuing additional rates.
- Offer Update plus queued additions in edit mode.
- Identify rates already in the room.
- Exclude duplicate additions and the actively edited surface appropriately.
- Cancel without applying the edit.
- Delete surfaces.
- Where existing server-backed surfaces are deleted directly, update the server and local state and report failures.

#### Quantities, coats, and time — **PROTECTED**

- Automatically derive square-foot, wall, ceiling/floor, and linear-foot quantities from room geometry.
- Permit manual quantity override.
- Treat item-priced rates as item counts.
- Treat stored-hours-per-item rates as counts multiplied by configured man-hours.
- Treat legacy hours rates without stored man-hours as manually entered total hours.
- Prompt for item counts or labor hours using the applicable imported dialogs/inline equivalents.
- Require positive labor hours.
- Use fractional-hour inputs where supported.
- Enforce a minimum of one item for counted surface controls.
- Allow counted surface quantity adjustment with inline minus/plus.
- Round current counted quantities to integer counts for those controls.
- Reprice quantity adjustments using the surface’s rate from the full catalog, including another active category.
- Show an error directing the user to Edit if the linked rate cannot be found.
- Keep quantities isolated per selected rate; one door count must not become another rate’s fallback.
- Canceling a quantity prompt must not add its rate.
- Support coats 1–4 in the ordinary surface form.
- Apply cumulative-profile coat limits/semantics.
- Hide unnecessary coats controls for applicable each/manual-hours rows.
- Offer Excellent, Good, Fair, and Poor conditions.
- Accept nonnegative prep/masking hours.
- Preserve manually entered quantities during room-dimension edits.
- Recompute geometry-derived quantities when they still match the prior automatic geometry, including the existing tolerance/zero-value rules.

#### Materials — **PROTECTED**

- Use the production rate’s default paint product when creating a surface.
- Show material/product name and applicable cost/coverage information.
- Override a material for an individual edited surface.
- Include the currently linked product even when ordinary filtering would omit it.
- Reset an override to the rate default.
- Apply each rate’s own default product in multi-add.
- Change Materials selects one paint product for every surface in a room.
- Show product name/brand in the bulk chooser.
- Require a selected product before Apply to Room.
- Update all room surface product IDs and trigger the existing repricing path.
- Cancel/close clears bulk-material chooser state.
- Preserve per-product markup/coverage and profile-specific behavior.
- Keep exact material usage separate from whole gallons billed where whole-gallon rounding applies.
- Material changes affect proposal surfaces; they do not edit global production rates.

#### Descriptions and notes

- Preserve production-rate customer descriptions.
- Allow a custom description to replace the default.
- Enter customer-visible surface notes.
- Enter crew-only surface notes.
- Preserve internal versus customer-facing note destinations.
- Preserve descriptions/notes through edit, duplication, hydration, and finalization.

### Step 4 — Optional rooms, surfaces, and groups

#### Optional scope controls — **PROTECTED**

- Mark an entire room optional.
- Mark an individual surface optional.
- Exclude unpurchased optional scope from the contracted base.
- Keep optional scope priced and visible as an offer.
- Disable individual surface optional controls while its whole room is optional.
- Preserve those surface flags so removing room optionality restores their meaning.
- Clearing optionality clears the associated optional-group ID.
- Support ungrouped optional scope.
- Assign optional rooms/surfaces to an existing group.
- Create a new group inline.
- Trim/validate new group names.
- Support Enter to create and cancel to abandon.
- Generate stable group IDs.
- Permit groups spanning rooms and individual surfaces.
- Display a fallback group identifier if a declaration is missing.
- Avoid double-counting a whole optional room and its surfaces.
- Restore accepted optional room/surface/group IDs.
- Include purchased optional scope in contracted calculations through the shared helpers.
- Keep `optionalScopeTotal` informational rather than adding it automatically to the proposal total.
- Preserve group declarations and accepted selections in saved content.

#### Bulk optional operations — **PROTECTED**

- Offer the bulk tool for qualifying multi-room scope.
- Aggregate matching surface types across rooms.
- Scope aggregation to the relevant category.
- Show matching room count, surface count, and combined amount.
- Identify surfaces skipped because their whole room is already optional.
- Sort candidates by affected-room count, amount, then label.
- Mark all applicable matches optional in one operation.
- Apply no group, an existing group, or a newly created group.
- If all applicable matches are already optional, switch the operation to clearing optionality.
- Clearing also removes group assignments.
- Mixed selections become uniformly optional.
- Commit the batch as one state update.

### Step 4 — Custom line items

#### Creation and editing — **PROTECTED**

- Add a manual line item.
- Add from a saved custom-item template.
- Group available templates by the selected project categories.
- Populate title, description, quantity, and unit price from a template.
- Stamp a template-created item with the template’s category.
- Stamp manually created items with the active category.
- Require title and description.
- Support rich text: bold, italic, underline, and bulleted lists.
- Require quantity of at least 0.01.
- Permit zero unit price.
- Reject negative pricing and direct discounts to the discount workflow.
- Calculate quantity × unit price.
- Display zero-priced items as FREE.
- Independently toggle:
  - Optional item.
  - Affected by package pricing.
- Preserve item identity when editing.
- Show template selection on create, not ordinary edit.
- Save/update, cancel, and delete.
- Reorder with up/down controls.
- Show quantity, unit price, total, optional badge, and package-pricing badge.
- Use desktop table and mobile card presentations.
- Preserve item description and pricing metadata downstream.

#### Template approval

- Honor templates marked as requiring approval.
- Admin and company-admin users bypass this custom-item approval prompt.
- Other roles may use the existing proposal discount/override code where supported.
- Otherwise open the override-code prompt.
- Validate through the override-code endpoint with discount purpose.
- Support entering/submitting a code, applying, canceling, and validation errors.
- Save a validated code for the subsequent operation.
- Preserve template ID/approval metadata on template-created items.
- **Current distinction:** This approval bypass is narrower than the discount/deposit admin-role bypass; it does not use the same superadmin check.

#### Optional custom items — **PROTECTED**

- Optional custom items are separate from room/surface optional groups.
- Exclude them from the initial required base.
- Show them as selectable preview additions in Summary/Send.
- Apply package markup to previewed optional items only when their package-pricing flag requires it.
- Include previewed selections in the corresponding preview/cart/tax calculations.
- Keep builder preview selection separate from customer acceptance.
- Clear preview selections for change orders.

#### Legacy custom-item discounts — **PROTECTED**

- Detect legacy negative/discount custom lines.
- Normalize them into the proposal’s single dollar-discount field.
- Avoid applying the legacy discount twice when an explicit discount already exists.
- Keep the legacy save conversion path.
- The current custom-item dialog creates ordinary nonnegative items.

#### SnapPrice custom items — **PROTECTED**

- Recognize structured SnapPrice metadata.
- Recognize supported legacy scan-item titles/descriptions.
- Edit the source measurement and applicable coat count.
- Reprice with the shared SnapPrice rate card.
- Store a quantity-one lump-sum line for customer presentation.
- Preserve original scan kind, measured quantity, and coats internally.
- Keep internal rate/version/math details out of the customer description.
- Let package pricing apply to imported scan items.

### Cabinet flat-rate wizard — launched from Project and summary edit actions

#### Count step — **PROTECTED**

- Enter total doors/drawers.
- Require a positive count.
- Present numeric bounds of 1–200.
- Find active packages whose maximum door/drawer count covers the entered count.
- Sort packages by configured display order.
- Reevaluate package eligibility when the count changes.
- Remove selected packages that are no longer eligible.

#### Packages step — **PROTECTED**

- Offer multiple cabinet packages to the customer.
- Default a new eligible configuration to all eligible packages.
- Restore prior selections when editing instead of reapplying new-proposal defaults.
- Show package name, description, features, count limit, price, and best-value/premium presentation.
- Require at least one package to continue.
- Preserve package-specific framing/sanding/features.
- If no standard package qualifies, support a custom package based on the highest-priced active premium package.
- Carry the base package’s descriptive/features configuration into that custom package.
- Set custom name, count/details, and price.
- Require a positive custom-package price.
- Preserve custom-package identity/configuration in the proposal snapshot.

#### Add-ons step — **PROTECTED**

- List active add-ons.
- Select/deselect individual add-ons.
- Select all/deselect all.
- Show add-on names, descriptions, and prices.
- Identify add-ons included with Premium.
- Preselect eligible included add-ons for the applicable new premium-only configuration.
- Show FREE/included presentation where Premium waives an add-on.
- Preserve selected add-ons while editing.
- Respect premium inclusion separately for each offered/selected package’s price.

#### Custom items step — **PROTECTED**

- Add cabinet-specific custom services.
- Require title and price; description is optional.
- Allow a zero-priced FREE service.
- Reject negative prices.
- Edit/update an existing custom service.
- Cancel an in-progress service edit.
- Delete services.
- Show custom-service totals.
- Include these services in all offered package totals.
- Permit skipping the custom-service step when none are needed.

#### Wizard summary and persistence — **PROTECTED**

- Review count, offered packages, add-ons, custom services, and total/range.
- Navigate Back through wizard steps.
- Return to count when leaving the custom-package branch as implemented.
- Continue to the builder summary.
- Reopen for count/package/add-on/custom-service changes.
- Propagate intermediate wizard selections at navigation callbacks.
- On completion, update the full cabinet selection.
- Reset transient wizard state on close and restore from supplied initial values on reopen.
- Save full package/add-on/custom-package objects, not only live catalog IDs.
- Preserve estimated-days/material-gallon metadata already present in cabinet data.
- Restore usable saved snapshots even if live cabinet catalog retrieval fails.
- For change orders, resolve accepted package/add-on IDs against live data, with saved-object fallback.
- Preserve saved cabinet content when temporary selection state is absent.

### SnapScan — capture, review, import, and archived captures

#### Capture

- Check company SnapScan status.
- Distinguish native Capacitor from browser use.
- Check native scanner/LiDAR availability.
- Explain that supported iPhone Pro/iPad Pro hardware is required for native scanning.
- Offer browser simulation.
- Offer the native simulation fallback exposed by the dialog.
- Start a scan and show scanning/progress state.
- Capture multiple rooms.
- Remove captured rooms before import.
- Finish scanning and process captures.
- Treat cancellation separately from scan failure.
- Give a specific low-light/tracking-failure message.
- Obtain an HD-upload ticket and associate scan artifacts with customer/proposal context.
- Map scan geometry through the backend.
- Retrieve AI room naming/surface suggestions.
- Preserve measured openings, objects, warnings, room dimensions, and scan identifiers.
- Generate/archive floor plans and 3D models.
- Associate HD scan photographs using the upload ticket.
- Detect separate floors from capture elevation and label reviewed rooms accordingly.

#### Review and corrections

- Edit scanned room names.
- Mark AI-suggested names.
- Avoid collisions with existing room names using the naming workflow.
- Show estimated floor area and ceiling height.
- Show measurement warnings.
- Show AI room notes.
- Review walls, ceiling, baseboard, crown, doors, and windows.
- Include/exclude each detected surface kind.
- Correct area/linear measurements.
- Use Enter/blur to commit measurement corrections.
- Clamp corrected measurements to nonnegative values.
- Automatically include a positively corrected surface.
- Keep counted doors/windows visible at zero so missed detections can be added.
- Increment/decrement doors/windows.
- Removing the final counted unit deselects that surface.
- Explain that wall openings may represent missed closet/bifold doors.
- Show storage/cabinet detection hints.
- Reject completion with no selected surfaces.
- Return to scanning.
- Add and finish.
- On native devices, Add & Scan Next Room commits the current selection and continues capturing.
- Keep the review open when the parent import reports a recoverable failure.
- Reset transient capture/review state when closing.

#### Customer co-review

- Toggle Review with Customer / Exit Customer View.
- Hide internal unit rates, labor/profit estimates, and technical warnings in customer view.
- Keep customer-relevant scope and totals visible.
- Restrict direct measurement editing in presentation mode.
- Retain available scope toggles/count adjustments and coat choices as implemented.

#### AI Vision

- Poll analysis status while review is open.
- Show pending/running analysis.
- Show “photos still uploading” for delayed HD photos.
- Retry analysis while photos are arriving within the implementation’s time window.
- Stop polling after completion/timeout or dialog cleanup.
- Show completed findings with label, count, confidence, and note tooltip.
- Highlight textured/popcorn ceiling findings.
- Suggest manually adding the appropriate removal rate.
- Keep vision suggestions informational; they do not silently add priced scope.

#### Import with company production rates — **PROTECTED**

- Wait for production catalogs to load; offer retry rather than misreporting no rates.
- Match scanned kinds to suitable interior rates.
- Prefer both calculation-type and name matches.
- Fall back to name matches.
- Allow area-type fallback for walls/ceilings.
- Prefer explicitly standard rates over ordinary and then specialty rates.
- Keep company display order as the tie-breaker.
- Avoid defaulting to specialty accent/closet/etc. rates when a standard choice exists.
- Import fresh rooms with measured dimensions.
- Import selected surfaces with manually preserved scan quantities.
- Use the matched rate’s coats/material defaults and the existing production-rate engine.
- Put AI notes into crew notes.
- Skip unmatched kinds and report which were skipped.
- Reject an import producing no priced surfaces.
- Append to existing proposal scope.
- Default the project to Interior when needed.
- Open Rooms & Surfaces for review.

#### SnapPrice/SnapRates import — **PROTECTED**

- Price scans directly from the shared SnapPrice card when the company activates that mode.
- Avoid consulting or changing company production rates on this path.
- Show per-surface prices, room totals, and grand total.
- Support one/two coats for area items.
- Apply the shared one-coat factor.
- Show internal estimated labor hours, crew duration, labor cost, and amount retained.
- Use company labor/crew inputs or shared defaults for those estimates.
- Keep estimated labor cost separate from the customer price calculation.
- Import selected scope as package-affected custom line items.
- Preserve scan measurement/coats metadata.
- Describe door scope as the room-facing side plus frame.
- Preserve category attribution in multi-category mode.
- Navigate through Project/Template instead of skipping directly to internal Summary.

#### Saved capture panel

- Display saved floor-plan thumbnails.
- Enlarge floor plans.
- Show saved 3D model links with AR-compatible behavior.
- Display HD scan photos and enlarge them.
- Show archived AI findings.
- Hide the panel when there is no artifact/finding to display.
- Open Add from Previous Scan.
- Fetch archived scan surfaces.
- Show loading and no-archived-scans states.
- Offer positive-quantity surface kinds with measurement and price.
- Disable entries whose generated item title already exists.
- Select multiple archived surfaces and add them.
- Price archived additions using the current SnapPrice helper.
- Close picker/enlarged views using close controls or backdrop.
- Render picker/lightbox through a body portal so transformed builder containers do not misposition them.

### Photos — available from rooms and reinforced before sending

#### Capture/upload

- Open a room-specific photo dialog.
- Associate uploads with proposal ID, room ID, and room name.
- Offer Gallery/file selection.
- Offer Take Photo on the iOS-detected path.
- Use the rear/environment camera capture input.
- Accept image files, with supported-format guidance.
- Enforce the 50 MB upload limit.
- Preview the selected image, filename, and size.
- Remove the pending selection.
- Compress before uploading.
- Show upload progress/busy state and success/error feedback.
- Queue file uploads on transport failure.
- Tell the user when a photo was queued rather than already uploaded.
- Refresh room/proposal photo queries after successful actions.

#### CompanyCam

- Detect an address-matched CompanyCam project using the company connection.
- Require no separate rep sign-in in this workflow.
- Offer the inline Link/Not Now recommendation.
- Display linking/linked state.
- Persist the linked project ID/name.
- Report link failures.
- In the room photo dialog, browse photographs from the linked CompanyCam project.
- Show connection/project/no-photo/loading states.
- Select a photo and attach it to the proposal room.
- Return from CompanyCam selection to the ordinary upload view.

#### Photo display

- Show photo counts and thumbnails.
- Lazy-load image content.
- Fall back from unavailable thumbnail to full image.
- Open a full-image viewer.
- Close with its control or backdrop.
- Show available caption, room, uploader, and timestamp information.
- Show file/size/compression metadata where provided.
- Delete a photo with confirmation for staff.
- Retain the imported display component’s public-token read-only behavior.

### Attached color renders

- Show Attach Renders once a customer and saved proposal ID exist.
- Display attached-render count/state in the builder header.
- Load the customer/lead’s existing renders.
- Show before/after imagery and color information.
- Use image-data fallbacks where available.
- Show project/date metadata in the configured timezone.
- Distinguish already attached renders.
- Disable already attached choices.
- Permit selection of other eligible renders, including those associated elsewhere as implemented.
- Select multiple renders.
- Attach through per-render proposal-link requests.
- Report partial success and failures.
- Refresh attached render count/preview after success.
- Show empty/all-attached states.
- Display attached before/after/color render content in the customer preview.
- The builder attaches existing renders; it does not expose render generation or detach controls.

### Step 5 — Summary

#### Standard summary — **PROTECTED**

- Show project/customer context.
- Show room/surface counts, labor hours, estimated duration, and financial totals.
- Show applicable category base totals.
- Show package comparison and selection.
- Show base/package calculation details for staff.
- Include package-affected custom items in the package base.
- Show category-specific contributions in multi-category comparisons.
- Show enabled package features/services/warranty and calculated amounts.
- Select a package unless change-order locks apply.
- Show room/surface breakdowns.
- Show dimensions, quantities, coats, materials, labor, material cost, markups, and totals as applicable.
- Edit a surface from summary by opening the appropriate edit state/step.
- Delete a surface from summary.
- Show custom items, FREE items, optional status, and package treatment.
- Group qualifying scan-style `Room — Surface` custom items by room prefix.
- Show optional-item preview switches.
- Show base labor, base material, production labor/material markup, package markup, required custom items, discount, pre-tax subtotal, tax, and total.
- Reflect actual derived markup values, including zero/negative adjustments.
- Explain scan/custom-only zero production labor/material values rather than treating those as an empty quote.

#### Simple-item summary — **PROTECTED**

- Activate when there are no surfaces and required items are not package-affected.
- Omit ordinary package comparison.
- Show item descriptions, quantities/prices, subtotal, tax, and total.
- Preview optional custom items and their tax-inclusive effect.
- Add/edit/remove the discount.
- Clear both discount state representations when removing it.
- Preserve the scan-capture panel where saved captures exist.

#### Cabinet summary — **PROTECTED**

- Show door/drawer count.
- Show offered packages and their contents.
- Show selected add-ons and custom services.
- Reopen cabinet configuration for edits.
- Show each package’s effective price after premium inclusions, custom services, and discount.
- Show price range when more than one customer choice remains.
- Show salesperson split information.
- Explain that remote customers choose their package.
- In change orders, show original amount, new amount/range, and additional charge/credit.

#### Notes

- Show project handoff notes on step 5 across non-change-order summary modes.
- Explain that handoff notes go to the project manager/project notes.
- Show an optional whole-job customer note.
- Explain that the customer note appears on the proposal.
- Preserve the distinction from lead notes, surface customer notes, crew notes, and template job notes.
- Persist both whole-job note drafts in session storage.
- Restore saved proposal notes on reopening.
- Avoid overwriting text already being typed.

### Discounts — available from cart and summary/customer preview

#### Discount modal — **PROTECTED**

- Open from the persistent cart discount control.
- Open from relevant summary/preview edit controls.
- Show current discount amount, code/type information, and expiration.
- Edit or remove a current discount.
- Choose dollar or percentage input.
- Require a positive amount.
- Reject percentages above 100%.
- Show the percentage’s dollar equivalent.
- Convert percentage input to a stored dollar discount.
- Reopen a saved percentage-origin discount without accidentally converting the dollar value as a percentage again.
- Require an expiration in the future.
- Set a date/time manually.
- Offer End of Today, 24 Hours, 48 Hours, and 1 Week presets.
- Use configured timezone formatting/preset construction.
- Accept uppercase override codes.
- Validate non-admin discount policy and thresholds through the backend.
- Allow policy-compliant discounts without a code when the backend permits them.
- Report invalid/expired/insufficient code responses.
- Log actual override-code usage without making audit-log failure discard an otherwise authorized discount.
- Bypass code validation for admin, company-admin, and superadmin discount mode.
- Display the admin-specific apply state.
- Disable Apply while invalid or loading.
- Cancel/close resets modal editing state.

#### Pricing and expiration — **PROTECTED**

- Apply the stored dollar discount after applicable package markup.
- Recalculate totals when a discount is added, changed, removed, or expires.
- Synchronize duplicated discount state used by saving/finalization.
- Preserve explicit zero values instead of reviving stale saved discounts.
- Show discount/expired status on the cart.
- Warn before expiration.
- Remove expired discounts from eligible unsigned proposals and notify the user.
- Preserve discounts on accepted/signed financial records.
- **Current percentage-base distinction:** The normal discount modal derives its input base from surface totals plus required custom items, before package markup; its surface walk includes optional surfaces. Cabinet percentage input uses its own minimum-offer/add-on/custom-service basis. These are separate existing calculations.

### Step 6 — Customer preview and delivery setup

#### Delivery selection

- Show customer identity/email and project context.
- Require an email for remote proposal delivery.
- Permit in-person signing without an email.
- Offer in-person signing for ordinary proposals.
- Disable in-person signing in change-order mode.
- Show an explicit change-order explanation.
- For cabinets, switch between email/customer-choice mode and in-person mode.
- Reset cabinet in-person package/add-on selection appropriately when switching modes.
- Require a cabinet package before signing in person.

#### Send preflight

- Show customer/email status.
- Provide an Edit Customer shortcut to step 1.
- Show scope status/counts.
- Provide an Edit Scope shortcut to step 4.
- Show total, tax, configured deposit, and selected package.
- Provide package-edit/review navigation.
- Show delivery mode.
- Show proposal-photo guidance/counts.
- Offer the CompanyCam recommendation where available.
- Treat the checklist as presentation plus shortcuts; handler validation remains authoritative.

#### Customer display controls

- Expose switches for:
  - Line-item pricing.
  - Surface dimensions.
  - Units.
  - Coats.
  - Material names.
- Resolve explicit proposal choices before template defaults.
- Default an absent flag to visible.
- Save/hydrate display overrides.
- Preserve additional saved/template flags for labor/material breakdown and total hours.
- **Current distinction:** Those latter two flags are supported in content but do not have matching switches in the visible five-control panel.
- **Current persistence distinction:** Finalization template spreads can overwrite some display values even though autosave resolves explicit overrides; this differs from the display resolver’s intended precedence.

#### Proposal presentation

- Show company logo/name and template header styling/content.
- Show selected customer/contact/project information.
- Show attached color-render comparisons and color swatches.
- Show offered package cards with descriptions, features, services, warranty, badges, savings, and price.
- Select the proposal’s active package.
- Hide/show individual offered packages with the eye control.
- Prevent hiding the final enabled package.
- If the selected package is hidden, move selection to another enabled package.
- Keep change-order package selection/visibility locked.
- Show optional item previews.
- Show service/room/custom-item scope.
- Honor dimensions/units/coats/material/pricing visibility.
- Preserve customer-facing descriptions and notes.
- Fold package uplift into displayed customer line prices where applicable.
- Keep staff-only markup labels out of customer scope presentation.
- Show investment, discounts, tax, total, and deposit.
- Avoid misleading labor/material breakdowns for scan-only lump-sum scope.
- Show template job notes and customer job note.
- Show payment terms, warranty, contract terms, validity, acceptance, and additional notes.
- Expand/collapse terms sections.
- Preserve the multi-category distinction between the builder’s shared primary-template preview and downstream category-specific content.
- Render company/footer contact information.
- Support telephone/email links.
- Normalize website links and open them appropriately.
- Sanitize/render rich footer/terms content and supported legacy plain text.

#### Cabinet customer presentation — **PROTECTED**

- Show offered cabinet packages without forcing the rep to choose in email mode.
- Explain that the customer selects remotely.
- In in-person mode, select one package.
- Select/deselect its available add-ons.
- Recalculate premium-included add-ons as FREE.
- Include cabinet custom services.
- Edit custom services/configuration through the existing flow.
- Edit discount.
- Show live selected price, tax, deposit, and payment schedule.
- Show original/new/adjustment amounts for change orders.

### Deposits — **PROTECTED**

- Read template deposit settings and cabinet-category flat-rate deposit settings.
- Support template percentage and fixed-dollar deposit types.
- Show the effective deposit and its source/default.
- Override the proposal deposit using a percentage.
- Override it using a fixed dollar amount.
- Keep percentage and fixed-dollar overrides mutually exclusive.
- Parse formatted numeric entry, including commas/currency symbols.
- Treat a blank field as clearing an override.
- Round stored/displayed override amounts as implemented.
- Limit percentage overrides to 100%.
- Cap a fixed-dollar deposit at the proposal total.
- Seed a useful value when switching override mode.
- Clear overrides and return to configured defaults.
- Apply manual amount before manual percentage before the caller’s fallback.
- Use tax-inclusive proposal totals in payment/deposit calculations where passed by the caller.
- Save override fields on the proposal.
- Read the company requirement for deposit-change override codes.
- Show uppercase code entry for affected non-admin users.
- Disable gated deposit/fee editing until a code is supplied.
- Let the backend validate the supplied code.
- Bypass this gate for admin, company-admin, and superadmin.
- Preserve current default differences: ordinary preview paths may use 25%, cabinet paths 30%, and other send/payment callers 50% when no effective setting is available.

### Card-fee overrides — **PROTECTED**

- Show the proposal fee editor only when company card fees are enabled with a positive configured rate and applicable Stripe setup.
- Show configured/custom fee label.
- Preview fee amount and card charge.
- Override the fee percentage for this proposal.
- Clamp effective fee percentages to the shared 0–4% range.
- Waive the fee.
- Treat an explicit zero-percent override as a waiver.
- Unwaive without accidentally restoring a stale override.
- Reset to company configuration.
- Apply the deposit-change override-code policy to these edits.
- Restore row-level values with legacy content fallback.
- Charge the fee only for applicable Stripe card payments.
- Exclude BNPL, Helcim, terminal, cash/check/offline methods from this shared Stripe surcharge.
- Add the fee at charge time after tax.
- Keep fee money separate from invoice principal, proposal total, payment-schedule principal, and balance reduction.
- Record/apply the base payment while disclosing the processor charge including fee.

### Payment schedules — **PROTECTED**

- Load/save proposal milestones separately from the main draft.
- Prefer an explicitly saved schedule.
- Otherwise seed from the template or cabinet category default.
- Permit defaults to seed/persist before the user reaches Send.
- Wait for required asynchronous default configuration.
- Start a custom schedule with current deposit plus remaining balance.
- Add milestones.
- Edit milestone label.
- Choose percentage, fixed amount, or remaining balance.
- Enter amount/percentage where applicable.
- Choose the supported due trigger:
  - Acceptance.
  - Manual.
  - Before materials.
  - Project start.
  - Completion.
  - Fixed date.
- Edit the customer-facing payment description.
- Remove a milestone.
- Reset to standard deposit.
- Preserve supplied trigger-date and automation-tag metadata.
- **Current distinction:** Fixed-date metadata is supported, but this editor does not expose a corresponding date input.
- Calculate percentages first, capped to available total.
- Allocate fixed amounts within the remaining balance.
- Split remainder among remainder milestones with cent reconciliation.
- Use the current selected pre-tax total in this editor’s existing calculation.
- Debounce schedule writes approximately 900 ms.
- Support the separate milestone-change override code.
- Bypass that gate for admin/company-admin/superadmin.
- Report required/invalid code/save failures.
- Keep this save path distinct from main autosave and its offline outbox behavior.

### Send, present, signature, and payment completion

#### Send-choice dialog

- Open for ordinary remote Send Proposal.
- Offer Send Now.
- Offer View Customer Proposal — Don’t Send.
- Explain the different delivery outcomes.
- Show preparation/sending state.
- Cancel without sending.

#### Present without sending

- Validate billable scope.
- Ensure/save the proposal before presentation.
- Require a usable saved numeric proposal ID.
- Generate/open the customer presentation link.
- Navigate in the same tab through the authenticated public-link opener.
- Preserve draft status.
- Use presentation mode to avoid customer-view tracking.
- Do not require customer email solely to present.

#### Remote sending — **PROTECTED** for saved prices/status

- Validate scope, customer email, and required handoff notes.
- Save/finalize complete proposal content before email delivery.
- Persist customer/project, scope, selected/offered packages, commissions, discounts, terms, display choices, deposits, fees, category snapshots, notes, and applicable cabinet/video data.
- Stamp the last-known production-rates version when supplied by field-kit.
- Use an idempotency key for finalization.
- Use configured validity or the existing 30-day fallback.
- Send enabled package choices and their calculated prices.
- Send selected-package confirmation data for signed proposals.
- Queue enhanced email generation in the backend.
- Generate a proposal PDF when available.
- Still send the portal link if PDF generation fails.
- Keep PDF/email generation off the immediate response path.
- Preserve server email delivery logging and proposal-sent automation side effects.
- The builder does not expose an independent proposal SMS composer/send button.
- Configured downstream proposal-sent automations may send SMS/email follow-ups.
- Preserve portal-link delivery and public customer acceptance as the remote handoff.

#### Signature and terms

- Open the imported signature dialog for in-person signing.
- Show customer/project and applicable subtotal, tax, total, and deposit.
- Render terms inline.
- Support template terms and fallback payment/contract/warranty/acceptance text.
- Convert supported plain text and sanitize HTML.
- Show scroll guidance for long terms.
- Signing represents acceptance; no additional read-to-bottom or checkbox gate is imposed here.
- Draw with mouse or touch.
- Store signature as PNG data.
- Clear signature.
- Show signing identity/date information.
- Require a nonempty signature before completion.
- Disable completion while processing.
- Cancel/close without completing acceptance.

#### Acceptance and invoice creation — **PROTECTED**

- Recheck handoff requirements during signature completion.
- Save signature, signer identity, signing time, and terms-acceptance time.
- Save accepted package and accepted financial snapshot.
- Preserve tax-applied/rate/pre-tax acceptance fields.
- Mark acceptance before payment collection.
- Create or reuse the generated invoice.
- Do not open payment collection if invoice creation fails.
- Report signature/invoice errors.
- Retain the signature for final completion after payment/defer.
- Preserve the existing invoice-email options branch.

#### Payment modal — **PROTECTED**

- Open in `sales_rep` mode at method selection.
- Supply proposal ID, invoice ID, customer name/email/phone, tax-inclusive proposal amount, and effective deposit.
- Show amount to collect.
- Go Back to edit amount.
- Offer deposit/full-amount shortcuts.
- Require a positive collection amount no greater than the allowed proposal amount.
- Compare/settle monetary limits in cents.
- Preserve a manually chosen amount through ordinary method changes.
- Offer credit card when the company processor supports it.
- Offer enabled Pay Over Time/BNPL methods.
- Offer Pay In-Person for later office collection.
- Keep deferred payment pending; do not record it as cash collected.
- Use configured Stripe or Helcim payment UI.
- Load Stripe configuration/account/key as required.
- Create a server payment intent and use its authoritative amount/fee.
- Confirm processor status and backend payment status before declaring success.
- Render Helcim hosted checkout with initialization, retry/back, cancel, decline/error, and confirmation handling.
- Preserve bank-payment submitted/pending handling in the shared Helcim component.
- Show processing state.
- Report payment errors without falsely completing the proposal.
- On success, refresh payment/invoice caches and continue finalization.

#### BNPL — **PROTECTED**

- Show company/package financing messaging where eligible.
- Suppress applicable messaging in change-order mode.
- Respect the messaging component’s amount visibility limits.
- Offer supported Affirm/Klarna/Afterpay options according to configuration.
- Apply the modal’s coded eligibility ranges.
- Force full proposal amount for BNPL.
- Restore deposit behavior when leaving BNPL.
- Keep BNPL separate from credit-card surcharge behavior.
- **Current wiring distinction:** Package financing messaging and payment-modal eligibility do not receive identical props; the builder does not pass the modal’s optional package-financing eligibility prop.

#### Receipts and completion

- After applicable successful staff payments, offer Send Receipt or Skip.
- Use available customer email/SMS contact information.
- Send through the receipt endpoint.
- Warn if receipt delivery fails while preserving payment success.
- Avoid a duplicate receipt prompt when the shared flow already sent one.
- Show payment success.
- Run the staff success countdown.
- Prevent outside-click/Escape dismissal during the protected automatic-success transition.
- Finalize/send the signed proposal after payment succeeds.
- For Pay In-Person, finalize with deferred payment and the applicable reminder behavior.
- Offer Email Invoice to Customer or Skip for Now when the invoice-options branch is used.
- Show invoice number/total in that dialog.
- Report invoice-email failure without pretending it sent.

#### Shared payment branches versus builder wiring

- The imported modal also contains offline-payment recording, terminal, customer-token, and milestone-specific branches.
- This builder supplies `showInPersonPaymentOption`, so its visible staff offline choice defers collection rather than exposing the offline-recording form.
- Terminal processing code exists in the shared modal, but the builder’s ordinary visible method choices do not provide a terminal radio option.
- These shared branches must remain intact if the component is changed, but they are not additional visible builder buttons today.

#### Success overlay

- Show distinct sent/signed and proposal/change-order messages.
- Show customer name and email when available.
- Celebrate with confetti.
- Explain queued generation/email and PDF fallback.
- Keep the remote-sent result available for follow-up actions.
- Offer Present Customer Portal for ordinary sent proposals.
- Offer Copy Customer Link.
- Generate the actual customer public link.
- Support Safari’s asynchronous clipboard pattern.
- Fall back to showing a manually copyable link if clipboard access fails.
- Offer Back to Proposals where applicable.
- Automatically leave the successful paid in-person completion flow.
- Distinguish deferred-payment completion messaging.

## Cross-cutting behaviors

### Instant drafts, hydration, dirty tracking, and autosave

- Create a draft as soon as customer selection establishes valid lead context.
- Track both numeric ID and UUID where available.
- Pin the saved proposal ID into the URL so refresh reopens the same draft.
- Restore existing proposal data from the full detail response.
- Prefer persisted room/surface detail with legacy content fallback.
- Handle legacy string/number values and saved field-name variants.
- Restore customer, project/category selections, rooms/surfaces, custom items, package snapshots/selection, discounts, optional groups/selections, deposits/fees, and cabinet state.
- Preserve worker-attached video fields during hydration.
- Hold autosave during initial hydration and catalog readiness.
- Track actual user changes with `markUserChange`/the user-initiated ref.
- Do not treat hydration or ordinary total-recalculation effects as user edits.
- Debounce main autosave approximately 1.5 seconds.
- Include changes stored outside `proposalData`, such as package selection, category templates, cabinet state, and display toggles.
- Require selected customer and an existing draft identity.
- Suppress autosave for signed proposals.
- Suppress autosave for change orders.
- Block existing-proposal saves while initial room/surface counts are unknown.
- Block a suspicious save that reduces previously nonempty rooms or surfaces to zero.
- Block incomplete room hydration as implemented.
- Preserve the simple-item exception where appropriate.
- Send the saved update timestamp for concurrency protection.
- Surface server save rejection with “Changes aren’t saving.”
- Do not silently classify a validation/conflict/permission rejection as an offline success.
- Refresh proposal/pipeline/detail caches after accepted saves.
- Clear dirty state after successful save or successful queueing.
- Show Saving/Saved state and relative save-time tooltip.
- Cancel pending debounce timers on unmount.
- **Current limitation:** Ordinary exit controls do not implement a general dirty-draft confirmation/flush. The explicit `beforeunload` behavior is for change-order cancellation.
- **Current limitation:** The catastrophic-wipe guard also affects intentional deletion of the last previously saved room/surface.
- Keep handoff/customer-note session persistence separate from main draft autosave; finalization carries those notes.
- Session note writes store nonempty text; clearing text is not equivalent to deleting the prior storage entry.

### Offline outbox

- Queue instant draft creation for an existing lead when transport is unavailable.
- Generate a client UUID so subsequent work can target the pending draft.
- Make queued autosaves/finalization depend on queued draft creation.
- Replace stale pending autosaves for the same draft with the latest snapshot.
- Preserve finalization-before-email dependencies.
- Patch dependent requests with numeric IDs returned by delivered parent requests.
- Prevent dependent work from proceeding after a required parent permanently fails.
- Reuse idempotency keys on replay.
- Remove obsolete queued autosaves before finalization where implemented.
- Persist web queues in local storage.
- Persist native queues/files in Capacitor application data.
- Reconstruct queued multipart photos on replay.
- Remove delivered/evicted photo files.
- Recover persisted work after restart.
- Drain on initialization, connectivity restoration, native foregrounding, and periodic heartbeat.
- Stop draining when the network is unavailable.
- Back off transient queued failures, including 408/429/5xx and expired-session 401 responses.
- Dead-letter permanent failures and dependent requests.
- Retain retry/discard/count/subscription support for application outbox UI.
- Apply queue age/count/attempt limits and bounded failed-item retention.
- Quarantine/recover corrupt persisted journals.
- Main builder autosave/send callers explicitly distinguish transport failures from server rejection.
- **Shared-helper distinction:** `sendOrQueue` itself also queues initial 408/429/5xx responses despite its narrower comment; this should not be confused with every builder caller’s behavior.
- Milestone saves, code validation, and processor payments are separate online workflows, not covered automatically by proposal outbox support.
- Queued delivery is not proof that the recipient has received an email or an uploaded photo is already available to server handoff validation.

### Permission and feature gates

- Require authentication and preserve the requested URL when redirecting to login.
- Use company-scoped feature/configuration endpoints.
- Gate multi-category selection with the company feature flag.
- Gate SnapScan/SnapPrice using server company status.
- Gate cabinet flat-rate mode using cabinet category configuration.
- Restrict selectable salespeople to commission-enabled users.
- Apply role-specific discount bypass.
- Apply role-specific deposit/card-fee/milestone bypass.
- Preserve the narrower custom-item template-approval bypass.
- Honor per-user handoff-note requirements and minimum character count.
- Enforce server photo/handoff requirements on send/sign.
- Respect processor onboarding/configuration and enabled financing methods.
- Keep signed/accepted financial records protected.
- Block ordinary editing of a signed proposal unless the supported change-order/revision path applies.
- Show the signed-proposal message and redirect to proposals when blocked.
- Preserve server authorization, validation, conflict, and signed-record rejection responses.

### Handoff gates

- Require handoff notes when the user setting enables the gate.
- Use configured minimum length, with a minimum floor of 25 and default of 200.
- Count trimmed characters.
- Preserve the pending send/sign action.
- Open Project Handoff Notes Required.
- Show current/minimum character count.
- Disable Save Notes & Continue until valid.
- Resume the original action after saving sufficient notes.
- Handle backend handoff-photo requirement error codes.
- Open Add Job Photos First with the server message.
- Direct the rep to a room’s Photos control.
- Close with Got It and let the rep retry sending after adding photos.
- **Current distinction:** An older CompanyCam auto-link-and-resume helper remains defined, but the rendered photo-gate dialog does not call it or expose its former “I took photos” action.

### Pricing engine and financial data — **PROTECTED**

- Production-rate/category catalog reads.
- Active-versus-linked archived record selection.
- Project/category rate matching.
- Default rate/product/preset resolution.
- Labor settings, hourly cost/sell rate, crew size, and condition settings.
- Material product cost, coverage, markup, usage, substrate width, and waste settings.
- Rate input-unit/calculation-type derivation.
- Geometry-to-quantity conversion for room walls, individual walls, floor/ceiling/surfaces, and linear feet.
- Manual/count/hour quantity routing.
- Coats and cumulative/per-coat rate handling.
- Prep/masking/default-prep time.
- Condition effects.
- Labor/material base cost, sell cost, profit/markup, and surface totals.
- Whole-gallon versus exact material quantities.
- Per-product versus default material markup.
- Fixed-item price semantics and separate material billing where applicable.
- Required/optional/accepted-scope partitions.
- Category bases and downstream subcontractor/payment-related bases.
- Custom-item multiplication and package-affect flags.
- Package percentages, fixed prices, category composition, selected-tier totals, savings, and markup distribution.
- Discount input basis, conversion, expiry, and subtraction order.
- Duration estimates using hours/crew/8-hour days or saved fixed-package/cabinet estimates.
- SnapPrice card, coat factors, rounding, and labor/profit estimates.
- Tax settlement and accepted tax snapshots.
- Deposit default/override/cap behavior.
- Payment-schedule allocation.
- Card-fee resolution and charging.
- Commission percentages and financial snapshots.
- Acceptance amount, invoice principal, payments, receipts, outstanding balance, and change-order adjustment.
- Rates-version metadata and preservation of saved calculation behavior.

### Calculation profiles and precision — **PROTECTED**

- Support `snapcoat_per_coat` and `dripjobs_cumulative`.
- Resolve explicit per-rate overrides before legacy markers/company defaults.
- Preserve saved per-surface calculation profile and labor-sell-rate snapshots.
- Preserve legacy DripJobs marker compatibility.
- Apply cumulative coat semantics rather than adding cumulative values as separate coats.
- Clamp cumulative calculations to three coats.
- Preserve PaintScout’s separate half-hour rounding marker.
- Round PaintScout production hours upward to the next half-hour without incorrectly rounding explicit prep/masking as the production line.
- Preserve profile-specific condition/material/waste behavior.
- Preserve legacy fixed-item inclusive-material behavior versus cumulative separate-product billing.
- Preserve profile-specific acceptance of zero cost inputs.
- Treat invalid/nonpositive cumulative sell rates as unconfigured and fall back to markup pricing.
- Preserve explicit zero and negative markup/adjustment values where valid.
- Use shared decimal/currency helpers for applicable package, tax, fee, and settled-total calculations.
- Sum the same cent-settled surface totals shown to the user so visible rows reconcile.
- Preserve existing per-line versus aggregate rounding boundaries.
- Avoid repricing an unchanged reopened proposal merely because current settings/catalogs arrived.
- Recalculate for meaningful surface-cost, item, discount, package-definition, or category-template changes.
- Keep saved package snapshots locked until an explicit supported change.
- Avoid leaking internal pricing labels/markers into customer text.

### Taxes — **PROTECTED**

- Read current company tax configuration.
- Apply tax only when enabled with a finite positive rate.
- Apply tax to the discounted applicable pre-tax amount.
- Show tax amount/rate and tax-inclusive total.
- Use shared settlement where implemented.
- Save accepted pre-tax amount, rate, applied-tax flag, and accepted total.
- Normalize legacy accepted totals according to stored tax metadata.
- Avoid applying tax twice when comparing an accepted total to a change-order total.
- Keep card fees outside the taxable proposal/invoice principal.
- Preserve current caller differences in whether an intermediate amount is pre-tax or tax-inclusive.

### Change orders — **PROTECTED**

- Restore the original signed proposal and accepted financial baseline.
- Show Change Order Mode banner.
- Show original signer/date/amount when available.
- Lock the original package selection.
- Disable in-person signing.
- Suppress normal autosave.
- Preserve accepted optional scope.
- Allow supported scope/custom-item/cabinet edits.
- Detect added/removed rooms.
- Detect room name/dimension changes.
- Detect added/removed surfaces.
- Detect surface type/category, quantity, coats, condition, prep/masking, linked rate/material, dimensions, description, and customer/crew-note changes.
- Detect custom-item addition/removal and title/description/quantity/unit-price/total/package/optional changes.
- Normalize legacy string/number/null forms during comparison.
- Include total-cost differences in change detection.
- Preserve the original baseline when no meaningful change exists.
- Calculate changed scope using the locked effective package treatment.
- Keep non-package custom items outside package markup.
- Subtract discount using the existing change-order calculation.
- Show original amount, updated amount, and signed additional charge/credit.
- Support cabinet exact adjustments or min/max ranges while remote package choice remains open.
- Persist the change snapshot and use dedicated change-order email delivery.
- Require remote customer review/approval.
- Cancel Change Order with confirmation.
- Restore the signed proposal through the cancellation endpoint and return to the list.
- Attempt cancellation with `sendBeacon` on browser unload when an unsent change order is active.
- Stop that unload behavior after the proposal/change order is sent.
- Preserve distinctions among the main change detector, cart comparison, cabinet comparison, and send calculations; they are not a single unified implementation.
- Preserve the existing offline replay path separately from the dedicated online change-order email path.

### Persistent cart and quick actions — **PROTECTED**

- Show cart from step 4 onward when qualifying scope exists.
- Support room/surface, custom-only, fixed-price, cabinet, and change-order totals.
- Show the appropriate base/package-inclusive amount for the current step.
- Include tax labeling where configured.
- Show cabinet selected total or offered price range.
- Show room/surface/labor statistics on larger screens.
- Show custom-item count for custom-only proposals.
- Show cabinet package/add-on/custom-item counts and saved duration.
- Open/close the breakdown sheet by tapping the total.
- Close through close button or backdrop.
- Preserve expansion state through component rerenders.
- Show labor/material bases and markups.
- Show applicable hours/gallons.
- Show custom items and FREE amounts.
- Show optional scope separately as not included.
- Show selected optional custom preview additions.
- Show discount and expiration.
- Show package markup at the relevant steps, including locked change-order treatment.
- Show room-level breakdown.
- Show change-order original/new/adjustment totals.
- Offer quick navigation to package/summary review or room editing.
- Keep the main Discount control available across roles; retain additional admin-only quick-action discount buttons.

### Content preservation and downstream contracts

- Preserve proposal/room/surface/custom-item IDs and ordering.
- Preserve customer-facing labels separately from staff/internal labels.
- Preserve group definitions, category attribution, template snapshots, and accepted optional IDs.
- Preserve customer notes versus crew/project handoff destinations.
- Sanitize rich text and support legacy plain text.
- Preserve template videos: URL, placement, autoplay.
- Preserve worker-attached walkthrough videos across save/send, with proposal-specific worker video taking precedence over template video.
- Preserve cover and AI appointment-summary configuration.
- The builder does not expose an independent video-generation/editor workflow.
- Preserve PDF/email/portal content payloads and public-link semantics.
- Preserve invoice reuse, deferred collection, receipts, pipeline/cache refresh, and backend proposal-sent automations.
- Do not equate “queued/saved,” “sent,” “viewed,” “accepted,” and “paid”; they remain separate states.

## Device-specific behaviors today

### Mobile phones

- Lock body scrolling on initial widths below 768 px.
- Use the builder’s own scrollable content region.
- Restore body overflow on unmount.
- Keep header and bottom navigation outside that scrolling region.
- Reset inner/window scroll when steps change, including iOS/Capacitor.
- Show a mobile-only Close control.
- Shorten labels such as Previous → Back and Send Change Order → Send CO.
- Hide longer Attach Renders text and show icon/count treatment.
- Put cart above the mobile navigation row.
- Use larger minimum touch heights for primary navigation.
- Respect the application bottom-banner offset.
- Render surfaces/custom items as mobile cards rather than desktop tables where provided.
- Stack dialog fields/actions and package content at small widths.
- Bound dialogs/sheets to viewport height and make their interiors scrollable.
- Use touch-capable signature drawing.
- Prevent signature gestures from scrolling the page.
- Offer the iOS-specific Take Photo input alongside Gallery.
- Keep quantity prompts inside the surface dialog to avoid stacked-dialog focus problems.
- Stack SnapScan review actions full-width to avoid viewport overflow.

### Tablets

- Use the medium-width navigation grid with Back, a shrinking center cart, and Next/Send.
- Allow the center cart column to shrink so it does not push the final action offscreen.
- Hide the dense cart statistics until the large-screen breakpoint.
- Use responsive room/preset/package grids.
- Support iPad Pro native LiDAR scanning when available.
- Preserve touch signature, photo, and scan workflows.
- Keep scan picker/lightbox overlays anchored to the viewport through body portals.

### Desktop/browser

- Show denser surface/custom-item tables and wider multi-column forms.
- Show fuller header/action labels.
- Show large-screen cart statistics.
- Use mouse signature input and pointer/keyboard room reordering.
- Use ordinary file selection instead of the iOS camera-specific action.
- Offer simulated SnapScan capture in the browser.
- Open supported 3D links according to browser/device capability.
- Preserve same-tab customer presentation and clipboard fallback behavior.

### Native versus web persistence and connectivity

- Native outbox journals and queued photo files use Capacitor application storage.
- Web outbox persistence uses local storage and inline file reconstruction.
- Native connectivity and foreground listeners trigger queue draining.
- Native scanner/HD-upload behavior is separate from browser simulation.
- Late scan-photo uploads can leave AI Vision pending while the proposal remains usable.
- Browser storage availability affects local room presets and session note recovery.
- Safari receives the asynchronous clipboard handling used for customer-link copying.

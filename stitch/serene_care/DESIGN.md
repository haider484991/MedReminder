# The Design System: Editorial Wellness & Narrative Care

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Restorative Gallery."** 

Medical applications often feel clinical, cold, or anxiety-inducing. This system rejects the "utility-only" aesthetic in favor of a high-end, editorial experience that feels like a premium wellness publication. We move beyond the "app template" by utilizing intentional white space, sophisticated tonal layering, and an authoritative typographic scale. 

By prioritizing **Asymmetric Breathing Room** and **Depth through Texture**, we transform a simple reminder tool into a trustworthy companion. The goal is to make the user feel "cared for" rather than "managed."

---

## 2. Colors: Tonal Architecture
The palette is rooted in medical authority but executed with a soft, human touch. We move away from flat hex codes toward a living system of light and shadow.

### The "No-Line" Rule
**Standard 1px borders are strictly prohibited.** To define sections, use shifts in background tokens (e.g., a `surface-container-low` card resting on a `surface` background). This creates a seamless, organic flow that feels modern and high-end.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-translucent materials.
- **Base Layer:** `surface` (#f9f9ff) – Use for the primary background.
- **Sectioning:** `surface-container-low` (#f1f3fe) – Use for large secondary areas or groupings.
- **Actionable Containers:** `surface-container-lowest` (#ffffff) – Use for primary interaction cards.
- **Nesting Logic:** An "Active Dose" card (`surface-container-lowest`) should sit atop a "Today’s Schedule" section (`surface-container-low`), creating natural depth without visual clutter.

### The "Glass & Gradient" Rule
To elevate the "trustworthy" blue (#0058bc), apply a **Signature Gradient** for primary CTAs and Hero states: 
*   **Linear Gradient:** From `primary` (#0058bc) to `primary-container` (#0070eb) at a 135° angle.
*   **Glassmorphism:** For floating navigation or modal overlays, use `surface_container_lowest` at 85% opacity with a `24px` backdrop-blur. This keeps the medical context visible while focusing the user's attention.

---

## 3. Typography: Authoritative Clarity
We pair two sans-serifs to balance technical precision with approachable warmth.

*   **Display & Headlines (Manrope):** Chosen for its geometric stability. Use `display-lg` (3.5rem) for "Good Morning" greetings to create an editorial, high-impact feel. Use `headline-sm` (1.5rem) for screen titles to assert quiet confidence.
*   **Body & Labels (Plus Jakarta Sans):** A modern typeface with open apertures, ensuring legibility for all ages.
    *   **Body-lg (1rem):** Primary instructions and medication names.
    *   **Label-md (0.75rem):** Metadata (e.g., "Take with food") in `on-surface-variant` (#414755).
*   **Visual Hierarchy:** Always use a 2:1 ratio for headline-to-body size to ensure the "Editorial" look. Don't be afraid of the `display-md` (2.75rem) for data points like "98% Adherence."

---

## 4. Elevation & Depth: The Layering Principle
Hierarchy is achieved through **Tonal Layering** rather than structural scaffolding.

*   **Ambient Shadows:** If a card must "float" (e.g., a critical alert), use a shadow with a blur of `32px`, a Y-offset of `8px`, and an opacity of 6% using the `on-surface` color. It should feel like a soft glow, not a drop-shadow.
*   **The "Ghost Border" Fallback:** In high-density layouts where a border is legally or functionally required, use `outline-variant` (#c1c6d7) at **15% opacity**. It must be felt, not seen.
*   **Corner Radii:** We use a "Friendly Fluidity" scale. 
    *   Small UI elements (Chips): `sm` (0.25rem).
    *   Medication Cards: `xl` (1.5rem).
    *   Action Buttons: `full` (9999px) for a soft, pill-shaped feel.

---

## 5. Components: Refined Interaction

### Primary Buttons
- **Style:** Gradient fill (`primary` to `primary-container`), `full` roundedness.
- **State:** On hover, increase the gradient brightness. On press, scale slightly (0.98x) to provide tactile feedback without a "button-press" shadow.

### Medication Cards (The Hero Component)
- **Constraint:** **Zero dividers.**
- **Layout:** Use `xl` (1.5rem) rounded corners. Separate the medication name (`title-lg`) from the dosage (`body-md`) using `spacing-4` (1rem) of vertical white space. Use `tertiary-container` (#008733) as a subtle background tint for "Completed" doses.

### Progress Indicators
- **Style:** Avoid thin lines. Use a "Thick-Track" approach (12px height) with `primary-fixed` (#d8e2ff) as the track and `primary` as the progress.

### Soft Input Fields
- **Background:** `surface-container-high` (#e6e8f3).
- **Focus State:** No border. Transition the background to `surface-container-lowest` and add a `2px` outer "glow" using `primary` at 20% opacity.

---

## 6. Do's and Don'ts

### Do
- **Do** use `spacing-12` (3rem) or `spacing-16` (4rem) for top-level margins to create an "Editorial" feel.
- **Do** use `tertiary` (soft greens) exclusively for success and health-positive states.
- **Do** use `surface-container-highest` for inactive states to keep the UI looking "baked-in" rather than "greyed out."

### Don't
- **Don't** use black (#000000). Always use `on-surface` (#181c23) for text to maintain a premium softness.
- **Don't** use 1px dividers between list items. Use `spacing-2` (0.5rem) of clear space and a subtle background shift.
- **Don't** use harsh, small corners. Anything less than `md` (0.75rem) on a card will feel too "technical" and lose the approachable wellness vibe.

---

## 7. Signature Pattern: The "Focus Layer"
When a user is logging a dose, dim the rest of the UI using a `surface-dim` (#d8d9e5) overlay at 40% opacity with a heavy blur. This "Focus Layer" mimics the cognitive clarity we want the user to feel when managing their health.
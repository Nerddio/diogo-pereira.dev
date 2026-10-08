# Manual accessibility review

US-30 and NFR-04 require a manual pass before release, in addition to the automated scan.
The two are not alternatives. `tests/e2e/accessibility.spec.ts` runs axe against the 70 rules
covering WCAG 2.2 Level A and AA on every pull request, and the Lighthouse gate scores a
subset of the same rules. Both are necessary and neither is sufficient: automated tooling
detects a minority of WCAG failures, and the ones it cannot see are the ones that make a page
genuinely unusable. A focus order that is technically present but nonsensical passes every
scanner ever written.

Each item below names the success criterion it tests, so a result can be traced to the
standard rather than to someone's judgement.

## How to run it

Against a deployed URL -- the preview deployment for a release candidate, or production.
Not the development server: `pnpm dev` ships a client runtime the production site does not,
and ADR-015 made that difference large enough to matter.

Chrome or Edge on desktop is enough for all seven. Record what was found, not just the
verdict: "pass" with no detail is indistinguishable from not having looked.

---

## 1. Keyboard traversal, with no trap

**Criteria:** 2.1.1 Keyboard, 2.1.2 No Keyboard Trap, 2.4.3 Focus Order

Click once in the address bar, then press <kbd>Tab</kbd> repeatedly through the entire page
and keep going until focus returns to the browser chrome. Then <kbd>Shift</kbd>+<kbd>Tab</kbd>
all the way back.

**Passes when:** every link and control can be reached; focus never becomes stuck anywhere;
the order follows the visual order of the page rather than jumping about; and nothing receives
focus that should not, such as a decorative element.

## 2. Visible focus on every interactive element

**Criteria:** 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured (new in WCAG 2.2)

Repeat the tab traversal and watch each focused element.

**Passes when:** you can always tell, without guessing, which element has focus; the indicator
is visible against the background it sits on; and the focused element is never hidden behind
the header or cut off at the edge of the viewport.

## 3. 200% zoom, and reflow at 320 pixels

**Criteria:** 1.4.4 Resize Text, 1.4.10 Reflow

Zoom to 200% with <kbd>Ctrl</kbd>+<kbd>+</kbd> and read every page. Then open the device
toolbar in developer tools (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>M</kbd>) and set the width
to 320 pixels.

**Passes when:** no content is lost or cut off; nothing overlaps; there is no horizontal
scrolling at 320 pixels; and no text is clipped by a fixed-height container.

## 4. Non-text contrast

**Criterion:** 1.4.11 Non-text Contrast

Text contrast is covered by axe. This is about everything else: the focus indicator, the
footer's divider rule, link underlines, and any border that distinguishes one region from
another.

Use the colour picker in developer tools, or the contrast checker in the Styles pane, on each.

**Passes when:** anything a visitor needs to perceive in order to use the page reaches 3:1
against its background. Purely decorative elements are exempt -- the footer rule is already
annotated in the layout as decorative for this reason, and that judgement is worth
re-examining rather than assuming.

## 5. Reduced motion

**Criterion:** 2.3.3 Animation from Interactions

In developer tools, open the command menu (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>),
run "Emulate CSS prefers-reduced-motion: reduce", then use the site normally.

**Passes when:** nothing moves, slides or animates that did not before. This site has no
custom animation by design, so the realistic risk is a transition inherited from a utility
class rather than anything deliberate.

## 6. Landmark and heading structure

**Criteria:** 1.3.1 Info and Relationships, 2.4.6 Headings and Labels

On each page, check the regions and the heading outline. The accessibility pane in developer
tools shows both, or a screen reader's landmark list.

**Passes when:** each page has exactly one `main` and one `h1`; heading levels descend without
skipping (no `h2` followed by `h4`); headings describe the section beneath them; and the
navigation, header and footer are in their proper landmarks.

## 7. Skip link

**Criterion:** 2.4.1 Bypass Blocks

Load a page and press <kbd>Tab</kbd> exactly once.

**Passes when:** the skip link is the first thing focused; it becomes visible when focused
rather than staying hidden; activating it with <kbd>Enter</kbd> moves focus into the main
content so the next <kbd>Tab</kbd> lands past the navigation -- not merely scrolling the page
while focus stays behind.

---

## Results

Reviewed by: Diogo Pereira
Date: 8 October 2026
Version reviewed: production, `https://diogo-pereira.dev`, at commit 7994ebc

| #   | Item                           | Result | Notes                                                                                                                                                      |
| --- | ------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Keyboard traversal, no trap    | Pass   | Every link reachable forward and back. No trap.                                                                                                            |
| 2   | Visible focus                  | Pass   | A rectangle around the focused element on every control: `2px solid var(--color-accent)` with a 2px offset, declared once in the base layer.               |
| 3   | 200% zoom and 320px reflow     | Pass   | No content lost, no overlap, no horizontal scrolling at 320px.                                                                                             |
| 4   | Non-text contrast              | Pass   | Focus indicator at 7.56:1 against the page background, well past the 3:1 required. Two caveats below.                                                      |
| 5   | Reduced motion                 | Pass   | Nothing moves with `prefers-reduced-motion: reduce` emulated. The site declares no animation, so this guards future CSS rather than current behaviour.     |
| 6   | Landmark and heading structure | Pass   | One `main` and one `h1` per page, heading levels descending without skips.                                                                                 |
| 7   | Skip link                      | Pass   | Home page: Tab, Enter, Tab put focus on "Read the case study", the first link inside `main`. Focus moved rather than the page merely scrolling. See below. |

### Item 4, in detail

Measured rather than estimated, against `--color-paper` `#fcfcfa`:

| Token            | Hex       | Ratio   | Required           |
| ---------------- | --------- | ------- | ------------------ |
| `--color-accent` | `#0f5c5c` | 7.56:1  | 3:1 (1.4.11)       |
| `--color-ink`    | `#1a1a18` | 16.97:1 | 4.5:1 (1.4.3)      |
| `--color-muted`  | `#5c5c58` | 6.54:1  | 4.5:1 (1.4.3)      |
| `--color-border` | `#90908c` | 3.12:1  | 3:1 (1.4.11)       |
| `--color-rule`   | `#dededa` | 1.31:1  | exempt, decorative |

Two things a future reader should know rather than infer.

**`--color-border` passes by 0.12.** One step lighter on a palette would break 1.4.11 silently,
because nothing in the pipeline measures these ratios. The margin is real but thin.

**The footer rule is below 3:1 and exempt only because it is decorative.** The layout already
asserts this in a comment, and the reasoning holds — the footer is identified by its landmark
rather than by the line, so nothing is lost to a visitor who cannot see it. But this is the one
item in this review that is a judgement rather than a measurement, and another reviewer could
reasonably decide it the other way.

### Item 7, in detail

On a short page, activating a skip link produces no visible change, because there is nothing to
scroll. That is correct behaviour — and it is also exactly how a broken skip link looks, where
the page scrolls, it appears to work, and focus never moved. The check is therefore where focus
lands on the next Tab rather than what the page does. It landed inside `main`.

## Not covered by this review

Stated so the scope of the claim is clear. This was a sighted keyboard review in a desktop
browser. It did not involve a screen reader, a magnifier, voice control, or anyone who relies on
assistive technology daily. Seven items passing means seven items passed; it does not mean the
site has been used by the people it is meant to serve.

A review with an empty table is not a review. If an item fails, it is fixed and the item is
re-run; the record shows the final state and says what was found on the way, because "what was
wrong before release" is the part worth reading later.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Scrolling between blocks: one gesture = one block (required on every landing/template)

The owner wants full-page block scrolling, as in fullpage-style templates. Keep this approach; do not go back to free scroll + "snap after it stops" (that left extra scroll and was rejected).

- Every content block is exactly one screen high (`height: var(--vh)`), content starts below the collapsed header (`padding-top: calc(var(--hdr-s) + …)`), and nothing inside a block may overflow the screen at 768–1440 px heights.
- One wheel notch, one trackpad swipe (its inertia tail included) or one PageDown/PageUp/arrow/Space press moves exactly one block, and the block lands pixel-exact at the top of the screen. While the glide runs (~0.9 s) further wheel/keys are ignored.
- Implementation (see `redesign/lib/scroll.tsx`, `initMagnet`): a capture-phase `wheel` listener on `window` (`passive: false`) calls `preventDefault` + `stopPropagation` so neither Lenis nor the browser scrolls, then `lenis.scrollTo(nextStop, { lock: true, force: true })`.
  - Stops come from `main > *` (pinned blocks are measured through their `.pin-spacer`); bands shorter than 0.4 screen (running line) are not stops; the page end is always a stop.
  - The "busy" state is time-based (planned end + 150 ms) as well as `onComplete`, so an interrupted glide can never lock the wheel.
  - A new gesture = a pause of more than 220 ms or a clearly stronger push than the fading tail.
- Exceptions that must keep working: scrollable inner boxes (the price table) take the wheel until their own end; open dialogs/drawer (`lenis.isStopped`), form fields, Ctrl+wheel zoom and sideways swipes are left alone; a block taller than the screen scrolls freely to its edge.
- Fallback: anything else that leaves the page between blocks (scrollbar drag, Home/End, resize) settles on the nearest block in the direction of travel.
- Phones/touch and reduced motion use the static page: no stepping.
- Verify after any layout change: wheel through the whole page at 1920×940 and 1366×768, every stop must equal the block's top.

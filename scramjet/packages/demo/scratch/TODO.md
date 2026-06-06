# TODO

- [x] Append a patch `<script>` block at end of `1.html` (no modification to existing inline code).
- [x] Implement movie embed helper with **iframe-only** (no `<video>`).
- [x] Implement player switching for **vidlink** vs **vidking** using settings (`browser.videoPlayer`).
- [x] Ensure games + movies open inside **separate Quantum Browser windows** (one per game/movie).
- [x] Fix AI blank window by patching/overriding the request+stream rendering with robust parsing and error handling.
- [x] Add multiple OpenRouter models to the AI model list via patch UI (or override dropdown options).
- [ ] Manual test steps:
  - [ ] Launch AI Chat → send message → verify output streams.
  - [ ] Change OpenRouter model → send message.
  - [ ] Open Games → click a game → verify new Browser window iframe loads.
  - [ ] Open Movies section (if present) → click a movie → verify iframe loads.



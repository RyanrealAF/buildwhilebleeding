# Build While Bleeding — Brand Portfolio & Multi-Agent Handoff Guidance

This document captures the guidance from the **Brand Portfolio Multi-Agent Handoff Spec** for the `buildwhilebleeding.com` ecosystem.

---

## 1. Core Principles & Constraints
- **Target Host**: `buildwhilebleeding.com` (Cloudflare Pages Advanced Mode with `public/_worker.js`).
- **Owner**: `RyanrealAF`. Canonical artist name: `RyanrealAF`. Canonical handle: `@buildwhilebleeding`. (Never "Ryan Real AF").
- **Zero Budget & No Native npm Dependencies**: WebAssembly, pure JS, and Cloudflare Pages native features only. All scripts must run in Termux and GitHub Actions `ubuntu-latest`.
- **Pre-rendered & Real Export Assets**: Platform-valid export files (PNG/JPG at standard sizes like 1500×500, 2560×1440, 1200×630, 3000×3000), not runtime SVG-only downloads.
- **Log Prefix**: `[BWB]` in build scripts and tooling.
- **Standard File Header**:
  ```js
  /**
   * Build While Bleeding — <Module Name>
   * buildwhilebleeding.com
   * <One line: what this module does>
   */
  ```

---

## 2. Design Tokens
- `--asphalt`: `#11100E`
- `--bone`: `#E7E0D4`
- `--rust`: `#C2332B`
- `--bronze`: `#C5A36A`
- `--chrome`: `#B9BDC2`
- Contrast rules: text/background ≥ 4.5:1 (≥ 3:1 for large/bold text). Red `#C2332B` on asphalt is ~3.4:1 and must be restricted to large display typography and non-text visual marks.

---

## 3. Vocal & Content Doctrine
- **Tone**: All vocals are strong, sharp-edged, rhythmic, dominant, and hard-attack rap or chanted gang vocals.
- **Banned Vocabulary**: Zero soft, reflective, low, breathy, ethereal, whispered, or quiet delivery anywhere across descriptions, tags, and lyric notes.
  - Regex check: `/\b(soft(ly)?|breathy|ethereal|whisper(ed|ing)?|quiet(ly)?|gentle|gently|airy|hushed|delicate|dreamy)\b/i`
- **Bracket Tagging Format**:
  - Section tags: `^\[(Intro|Verse \d+|Pre-Hook|Hook|Bridge|Final Hook|Outro): [A-Z][^\]]+\]$`
  - Production cues: `^\[[A-Z][^\]:]+\]$` (e.g. `[Beat drops out]`)
- **Vocal Description**:
  ```text
  Dark West Coast drill, 140 BPM, half-time feel. Sliding 808 sub-bass, clipped kick, sparse hi-hat rolls with triplet stutters, eerie minor-key piano stabs, cold ambient pads, light vinyl crackle. Male lead: hard-attack, dry, close-mic, rhythmic and percussive, forceful and dominant, no melody. Hook: chant-like gang vocals, layered, shouted, sharp-edged, full volume. Beat drops out before punchlines and in the bridge, then slams back. Gritty street-documentary mix, reverb on pads only, vocals dry and up front.
  ```

---

## 4. Multi-Repository Routing Alignment (Current State in `buildwhilebleeding.com`)
The umbrella site reverse-proxies each territory via `public/_worker.js`:
- `/hardwire/` → `https://the-hardwire-method.pages.dev`
- `/the-leak-report/` & `/theleakreport/` → `https://the-leak-report.pages.dev`
- `/cartography/` → `https://cartography.pages.dev`
- `/mosaic/` & `/mosaic-theory/` → `https://the-mosaic-theory.pages.dev`
- `/library/seuss/` → `https://the-seuss-library.pages.dev` (or static mirror)
- Enforces HTTP 308 trailing-slash redirects for safe relative asset resolution (`./assets/...`).
- Universal no-op service worker interceptor for `/sw.js` prevents cross-project cache collisions.

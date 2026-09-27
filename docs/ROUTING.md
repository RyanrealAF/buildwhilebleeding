# Routing Plan

Build While Bleeding is the umbrella site. The project repositories remain independent.

| Public path | Project | Upstream Destination | Ownership |
|---|---|---|---|
| `/` | BuildWhileBleeding | `buildwhilebleeding.pages.dev` | `RyanrealAF/buildwhilebleeding` |
| `/hardwire/*` | Hardwire | `https://the-hardwire-method.pages.dev` | `RyanrealAF/Hardwire` |
| `/the-leak-report/*` | The Leak Report | `https://the-leak-report.pages.dev` | `RyanrealAF/Theleakreport` |
| `/theleakreport/*` | The Leak Report (alias) | `https://the-leak-report.pages.dev` | `RyanrealAF/Theleakreport` |
| `/cartography/*` | Cartography | `https://cartography.pages.dev` | `RyanrealAF/Cartography` |
| `/mosaic/*` | The Mosaic Theory | `https://the-mosaic-theory.pages.dev` | `RyanrealAF/The_Mosaic_Theory` |
| `/mosaic-theory/*` | The Mosaic Theory (alias) | `https://the-mosaic-theory.pages.dev` | `RyanrealAF/The_Mosaic_Theory` |
| `/library/seuss/*` | Seuss | `https://raw.githack.com/RyanrealAF/Seuss/main` (or dedicated Pages host) | `RyanrealAF/Seuss` |

Cloudflare Pages Advanced Mode (`public/_worker.js`) performs path-based reverse proxying to independently deployed project applications while keeping visitors under the `buildwhilebleeding.com` umbrella domain.

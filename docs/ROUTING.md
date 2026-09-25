# Routing Plan

Build While Bleeding is the umbrella site. The project repositories remain independent.

| Public path | Project | Ownership |
|---|---|---|
| / | BuildWhileBleeding | BuildWhileBleeding |
| /hardwire/* | Hardwire | Hardwire |
| /library/seuss/* | Seuss | Seuss |
| /the-leak-report/* | The Leak Report | Theleakreport |
| /cartography/* | Cartography | Cartography |

Cloudflare should perform path-based routing to independently deployed project applications.

Before production routing is enabled, verify direct navigation, deep-link refreshes, static assets, browser history, 404 behavior, HTTPS, and custom-domain behavior.

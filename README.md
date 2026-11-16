# Website previews

Static demo sites for local service businesses, served with GitHub Pages.

| Folder | Business |
|---|---|
| `cool-front/` | Cool Front HVAC |
| `davies/` | Davies Plumbing Services |
| `tropical-blue/` | Tropical Blue Pool & Spa Care |
| `double-a/` | Double A Electric |
| `triple-quality/` | Triple Quality Painting |
| `mobile-tv/` | Mobile TV & Appliance Repair |
| `pro-clean/` | Pro Clean Pressure Washing |
| `agc-auto/` | AGC Auto Mechanics |
| `lru/` | LRU Landscaping |
| `canoa/` | Canoa Tree Service |

Each site has a home page, a quote form pop-up, and one page per service area in `areas/`.
Quote requests are saved to the Base44 app "Website Leads" (QuoteRequest entity). If that call fails, the form opens a text message to the business instead.

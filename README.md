# Deal or No Deal?

[![Build the best real Black Friday deal finder](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/competitions/black-friday-deal-finder-01)
[![Rank](https://make.fun/badge/black-friday-deal-finder-01/aramexbit/deal-or-no-deal/rank.svg)](https://make.fun/competitions/black-friday-deal-finder-01)
[![Reward](https://make.fun/badge/black-friday-deal-finder-01/aramexbit/deal-or-no-deal/reward.svg)](https://make.fun/competitions/black-friday-deal-finder-01)

A static Black Friday and Cyber Monday deal finder with real deals, checked by hand on 27 November 2026. Every deal shows its store, a link to the product at that store, the sale price, the usual price, the time the price was checked, and an honesty badge that says whether it is really a deal. No network requests, no tracking — plain static files that open in any desktop or phone browser.

## What it does

- **32 real deals** across Electronics, Home & Kitchen, Fashion, and Toys & Games — each one found and price-checked on 27 Nov 2026 at the store or in a deals source that names the store. The check time and source are recorded per deal in `app/deals.js`.
- **Honesty badges**: green **New Low** (lowest price the source has ever seen), gold **Strong Price** (a genuinely large discount), red **Routine Discount** (a small or routine markdown). The badge is only a New Low when the source says so explicitly.
- **Search and filters that work**: free-text search, category, store, and minimum discount, plus sorting (highest discount, biggest dollar savings, lowest price, most recently checked) and a "New Low prices only" toggle.
- **Live countdown** to Cyber Monday, ticking every second.
- **Deal detail modal**: click any card for a price-path chart (only the price points the evidence actually supports — never a made-up 30-day record) and the full breakdown of why it earned its badge.
- **No empty cells**: the grid is always a full multiple of four cards, with a clean empty state and a Reset Filters action when a filter matches nothing.

## How the deals were checked

Prices were read on 27 Nov 2026 (WIB) from the store pages themselves or from deal sources that name the store and the price (DealNews, TechSpot, ProductBible and similar). Nothing here is invented: a deal only made the list if its price was seen on a page during the build session. The per-deal `source` field in `app/deals.js` says where each price was read.

## Run it

No install and no build step. Open `app/index.html` directly in a browser, or serve the folder with any static server, for example:

```sh
npx --yes serve app
```

Then open the printed address — the app is plain static files under `app/`, it makes no network request. `main.ts` hands the entry in (it copies `app/` and the four dossier `screenshots/` to the output directory and writes `dossier.json`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Screenshots

`screenshots/` holds renders of the app itself: the full deal grid (`desktop.jpg`), the grid filtered to New Low deals (`newlow.png`), a deal detail modal (`modal.png`), and the phone-size layout (`mobile.png`). Those four are the dossier screenshots `main.ts` copies into the entry. `desktop-top.png` is an extra local render of the first viewport and is not part of the dossier. Every screenshot is the app's own code running, not a mock-up.

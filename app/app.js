// Deal or No Deal? — app logic (vanilla JS, zero network requests).
//
// Renders the DEALS dataset into the card grid, wires search / category /
// store / discount filters, the four sort orders, the "New Low only" toggle,
// the deal-detail modal (price path + evidence), and the live countdown to
// Cyber Monday 2026.
//
// v2: each card now shows a photorealistic product photo made for this
// entry (app/images/<id>.webp, generated in this session — our own images,
// not store photos, and loaded from local files only). The inline SVG art
// below is kept as a fallback: if a photo ever fails to load, the card
// falls back to its SVG. Still no external images, fonts, or requests.
//
// v3: 14 photos re-shot on bright studio backgrounds (the v2 shots of dark
// products on dark backgrounds read as empty cards); every card now carries
// a visible source link; the modal puts the CTA right under the prices and
// repeats it in a sticky footer; the price path keeps only evidence-backed
// points and marks the lowest point for New Low deals. Prices, badges and
// evidence are UNCHANGED from v2 — only artwork and layout changed.

(function () {
  "use strict";

  // ---------- Inline product artwork (viewBox 0 0 150 130) ----------
  // Schematic line art in the site palette: gold #F5C542, red #C62828,
  // grays #9CA3AF / #2E323D. One key per deal; variants differ in colour
  // and silhouette so neighbouring cards do not look identical.
  var ART = {
    "headphones":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><path d="M38 88a37 37 0 0 1 74 0" fill="none" stroke="#F5C542" stroke-width="6" stroke-linecap="round"/><rect x="28" y="80" width="24" height="38" rx="10" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><rect x="98" y="80" width="24" height="38" rx="10" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><rect x="34" y="88" width="12" height="22" rx="6" fill="#C62828"/><rect x="104" y="88" width="12" height="22" rx="6" fill="#C62828"/></svg>',
    "headphones-silver":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><path d="M38 88a37 37 0 0 1 74 0" fill="none" stroke="#9CA3AF" stroke-width="6" stroke-linecap="round"/><rect x="28" y="80" width="24" height="38" rx="10" fill="#E5E7EB" stroke="#6B7280" stroke-width="2"/><rect x="98" y="80" width="24" height="38" rx="10" fill="#E5E7EB" stroke="#6B7280" stroke-width="2"/><rect x="34" y="88" width="12" height="22" rx="6" fill="#F5C542"/><rect x="104" y="88" width="12" height="22" rx="6" fill="#F5C542"/></svg>',
    "earbuds":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><rect x="45" y="72" width="60" height="42" rx="12" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><path d="M45 88h60" stroke="#9CA3AF" stroke-width="2"/><circle cx="62" cy="46" r="13" fill="#F5C542"/><path d="M62 59v14" stroke="#F5C542" stroke-width="8" stroke-linecap="round"/><circle cx="90" cy="46" r="13" fill="#E5E7EB"/><path d="M90 59v14" stroke="#E5E7EB" stroke-width="8" stroke-linecap="round"/><circle cx="75" cy="98" r="4" fill="#C62828"/></svg>',
    "laptop":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><rect x="30" y="22" width="90" height="62" rx="6" fill="#16181D" stroke="#9CA3AF" stroke-width="2"/><path d="M38 74V34l22 20-8 4 12 16" fill="none" stroke="#F5C542" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 92h114l-8 12H26l-8-12z" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><rect x="66" y="96" width="18" height="3" rx="1.5" fill="#9CA3AF"/></svg>',
    "laptop2":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><g transform="rotate(-7 75 55)"><rect x="30" y="22" width="90" height="62" rx="6" fill="#16181D" stroke="#F5C542" stroke-width="2"/><path d="M40 40h70M40 52h46" stroke="#C62828" stroke-width="4" stroke-linecap="round"/></g><path d="M18 92h114l-8 12H26l-8-12z" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><rect x="66" y="96" width="18" height="3" rx="1.5" fill="#9CA3AF"/></svg>',
    "tv":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><rect x="22" y="24" width="106" height="64" rx="4" fill="#16181D" stroke="#9CA3AF" stroke-width="2"/><path d="M32 78V52l18 12 14-18 12 14 10-8 12 26" fill="none" stroke="#F5C542" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M75 88v10M55 100h40" stroke="#9CA3AF" stroke-width="4" stroke-linecap="round"/></svg>',
    "tv2":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><rect x="22" y="24" width="106" height="64" rx="4" fill="#16181D" stroke="#C62828" stroke-width="2"/><circle cx="104" cy="40" r="9" fill="#F5C542"/><path d="M28 82l26-28 18 16 16-12 34 24" fill="none" stroke="#F5C542" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M75 88v10M55 100h40" stroke="#9CA3AF" stroke-width="4" stroke-linecap="round"/></svg>',
    "ssd":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><rect x="32" y="48" width="86" height="34" rx="5" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><path d="M32 58h-8M32 66h-8M32 74h-8" stroke="#F5C542" stroke-width="3" stroke-linecap="round"/><rect x="44" y="56" width="30" height="18" rx="2" fill="#16181D" stroke="#F5C542" stroke-width="1.5"/><text x="59" y="69" fill="#F5C542" font-size="10" font-weight="700" text-anchor="middle">1TB</text><text x="96" y="68" fill="#9CA3AF" font-size="9" text-anchor="middle">NVMe</text></svg>',
    "airfryer":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><rect x="45" y="24" width="60" height="78" rx="10" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><rect x="52" y="58" width="46" height="34" rx="6" fill="#16181D" stroke="#F5C542" stroke-width="2"/><rect x="66" y="70" width="18" height="4" rx="2" fill="#F5C542"/><circle cx="75" cy="42" r="9" fill="#16181D" stroke="#F5C542" stroke-width="2"/><path d="M75 42v-5M75 42l4 3" stroke="#F5C542" stroke-width="2" stroke-linecap="round"/></svg>',
    "vacuum-stick":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><path d="M98 26L64 82" stroke="#9CA3AF" stroke-width="8" stroke-linecap="round"/><rect x="86" y="10" width="28" height="22" rx="7" fill="#C62828" transform="rotate(24 100 21)"/><rect x="70" y="52" width="20" height="16" rx="4" fill="#2E323D" stroke="#F5C542" stroke-width="2" transform="rotate(24 80 60)"/><path d="M36 98h72l8 12H28l8-12z" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><circle cx="72" cy="98" r="5" fill="#F5C542"/></svg>',
    "vacuum-stick2":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><path d="M52 26l34 56" stroke="#F5C542" stroke-width="8" stroke-linecap="round"/><rect x="42" y="6" width="16" height="32" rx="8" fill="#2E323D" stroke="#9CA3AF" stroke-width="2" transform="rotate(-24 50 22)"/><rect x="60" y="52" width="20" height="16" rx="4" fill="#2E323D" stroke="#C62828" stroke-width="2" transform="rotate(-24 70 60)"/><path d="M36 98h72l8 12H28l8-12z" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><circle cx="78" cy="98" r="5" fill="#C62828"/></svg>',
    "vacuum-robot":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><ellipse cx="75" cy="68" rx="44" ry="36" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><ellipse cx="75" cy="62" rx="30" ry="22" fill="#16181D" stroke="#F5C542" stroke-width="2"/><circle cx="75" cy="62" r="7" fill="#C62828"/><path d="M52 84h46" stroke="#9CA3AF" stroke-width="3" stroke-linecap="round"/></svg>',
    "vacuum-robot2":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><ellipse cx="75" cy="68" rx="44" ry="36" fill="#16181D" stroke="#C62828" stroke-width="2"/><ellipse cx="75" cy="62" rx="30" ry="22" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><circle cx="64" cy="56" r="4" fill="#F5C542"/><circle cx="86" cy="56" r="4" fill="#F5C542"/><path d="M66 72q9 7 18 0" fill="none" stroke="#F5C542" stroke-width="3" stroke-linecap="round"/></svg>',
    "mixer":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><path d="M38 100h74v8a4 4 0 0 1-4 4H42a4 4 0 0 1-4-4v-8z" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><path d="M48 78h54l-6 22H54l-6-22z" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="2"/><path d="M96 40h10v38H96z" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><path d="M40 30h66a8 8 0 0 1 0 16H58l-4 10H40a8 8 0 0 1 0-16z" fill="#C62828"/><circle cx="52" cy="38" r="4" fill="#F5C542"/></svg>',
    "blender":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><path d="M56 26h38l-6 56H62l-6-56z" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><path d="M60 44h30M61 58h28" stroke="#F5C542" stroke-width="3" stroke-linecap="round"/><path d="M52 22h46v8H52z" fill="#C62828"/><path d="M48 84h54l4 20H44l4-20z" fill="#16181D" stroke="#9CA3AF" stroke-width="2"/><circle cx="75" cy="94" r="5" fill="#F5C542"/></svg>',
    "pot":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><path d="M40 58h70l-6 42a8 8 0 0 1-8 6H54a8 8 0 0 1-8-6l-6-42z" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><path d="M36 58a20 12 0 0 1 78 0z" fill="#16181D" stroke="#F5C542" stroke-width="2"/><circle cx="75" cy="46" r="5" fill="#F5C542"/><path d="M40 66h-10M110 66h10" stroke="#9CA3AF" stroke-width="5" stroke-linecap="round"/></svg>',
    "sneaker":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><path d="M34 90V64q0-12 14-10l16 4q18 4 34 14l20 10q8 4 8 8H34z" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="2"/><path d="M62 62l10 7M76 66l10 7M90 71l10 7" stroke="#6B7280" stroke-width="3" stroke-linecap="round"/><path d="M42 80q40-6 76 4" fill="none" stroke="#F5C542" stroke-width="4" stroke-linecap="round"/><path d="M28 90h100v8a4 4 0 0 1-4 4H32a4 4 0 0 1-4-4v-8z" fill="#C62828"/></svg>',
    "sneaker2":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><path d="M116 90V64q0-12-14-10l-16 4q-18 4-34 14l-20 10q-8 4-8 8h92z" fill="#2E323D" stroke="#F5C542" stroke-width="2"/><path d="M88 62l-10 7M74 66l-10 7M60 71l-10 7" stroke="#9CA3AF" stroke-width="3" stroke-linecap="round"/><path d="M108 80q-40-6-76 4" fill="none" stroke="#F5C542" stroke-width="4" stroke-linecap="round"/><path d="M122 90H22v8a4 4 0 0 0 4 4h92a4 4 0 0 0 4-4v-8z" fill="#F5C542"/></svg>',
    "jeans":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><path d="M52 24h46l4 76a4 4 0 0 1-4 4h-12l-6-52-6 52H62a4 4 0 0 1-4-4l-6-76z" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><path d="M52 24h46v10H52z" fill="#16181D" stroke="#F5C542" stroke-width="2"/><path d="M74 34v18" stroke="#9CA3AF" stroke-width="2"/><circle cx="75" cy="30" r="2.5" fill="#F5C542"/></svg>',
    "hoodie":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><path d="M58 26a17 17 0 0 1 34 0l6 10-8 6-4-8a9 9 0 0 0-18 0l-4 8-8-6 6-10z" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><path d="M46 44l-12 14 10 10 6-8v42a6 6 0 0 0 6 6h38a6 6 0 0 0 6-6V60l6 8 10-10-12-14-6 4H52l-6-4z" fill="#C62828" stroke="#9CA3AF" stroke-width="2"/><path d="M58 78h34l-4 16H62l-4-16z" fill="#16181D" stroke="#F5C542" stroke-width="2"/></svg>',
    "jacket":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><path d="M50 34l-14 12 10 12 6-6v48a6 6 0 0 0 6 6h34a6 6 0 0 0 6-6V52l6 6 10-12-14-12-6 4H56l-6-4z" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><path d="M50 56h50M50 72h50M50 88h50" stroke="#F5C542" stroke-width="2.5"/><path d="M75 34v72" stroke="#9CA3AF" stroke-width="2"/><circle cx="75" cy="30" r="4" fill="#C62828"/></svg>',
    "backpack":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><rect x="46" y="30" width="58" height="74" rx="16" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><path d="M62 30a13 13 0 0 1 26 0" fill="none" stroke="#F5C542" stroke-width="4"/><rect x="56" y="66" width="38" height="26" rx="8" fill="#16181D" stroke="#F5C542" stroke-width="2"/><path d="M46 52h-8M104 52h8" stroke="#9CA3AF" stroke-width="4" stroke-linecap="round"/></svg>',
    "sunglasses":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><circle cx="52" cy="66" r="22" fill="#16181D" stroke="#F5C542" stroke-width="3"/><circle cx="98" cy="66" r="22" fill="#16181D" stroke="#F5C542" stroke-width="3"/><path d="M74 62q1-8 2 0" fill="none" stroke="#F5C542" stroke-width="3"/><path d="M30 60L18 52M120 60l12-8" stroke="#F5C542" stroke-width="3" stroke-linecap="round"/><path d="M40 58l10-8M110 58l-10-8" stroke="#E5E7EB" stroke-width="3" stroke-linecap="round"/></svg>',
    "boots":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><path d="M58 26h22l4 44 26 10q8 3 8 12v10H58V26z" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><path d="M58 102h60v8H58z" fill="#C62828"/><path d="M66 40h8M66 52h8M66 64h8" stroke="#F5C542" stroke-width="3" stroke-linecap="round"/></svg>',
    "console":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><rect x="24" y="40" width="20" height="52" rx="8" fill="#2E323D" stroke="#3B82F6" stroke-width="2"/><rect x="106" y="40" width="20" height="52" rx="8" fill="#2E323D" stroke="#EF4444" stroke-width="2"/><rect x="44" y="36" width="62" height="60" rx="6" fill="#16181D" stroke="#9CA3AF" stroke-width="2"/><circle cx="75" cy="66" r="14" fill="#C62828"/><path d="M75 58v16M67 66h16" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="34" cy="56" r="3" fill="#3B82F6"/><circle cx="116" cy="56" r="3" fill="#EF4444"/></svg>',
    "game":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><rect x="42" y="24" width="66" height="84" rx="6" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><rect x="42" y="24" width="66" height="18" rx="6" fill="#C62828"/><text x="75" y="38" fill="#fff" font-size="11" font-weight="800" text-anchor="middle">SWITCH 2</text><circle cx="75" cy="70" r="20" fill="#16181D" stroke="#F5C542" stroke-width="2"/><circle cx="75" cy="70" r="7" fill="#F5C542"/><path d="M50 96h50" stroke="#9CA3AF" stroke-width="3" stroke-linecap="round"/></svg>',
    "lego-car":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><path d="M28 84l14-16 22-4 10-12h16l8 10 24 6v16H28z" fill="#2E323D" stroke="#F5C542" stroke-width="2"/><circle cx="52" cy="86" r="11" fill="#16181D" stroke="#9CA3AF" stroke-width="2"/><circle cx="52" cy="86" r="4" fill="#F5C542"/><circle cx="98" cy="86" r="11" fill="#16181D" stroke="#9CA3AF" stroke-width="2"/><circle cx="98" cy="86" r="4" fill="#F5C542"/><path d="M26 62h10M112 56h12" stroke="#C62828" stroke-width="4" stroke-linecap="round"/></svg>',
    "lego-building":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><path d="M38 104V56a37 24 0 0 1 74 0v48H38z" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><path d="M62 104V76a13 13 0 0 1 26 0v28H62z" fill="#16181D" stroke="#F5C542" stroke-width="2"/><path d="M48 62h10M92 62h10M48 76h8M94 76h8" stroke="#F5C542" stroke-width="3" stroke-linecap="round"/><circle cx="75" cy="42" r="5" fill="#C62828"/></svg>',
    "lego-car2":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><path d="M24 88l10-22 30-8 12-14 22 2 10 12 18 8v22H24z" fill="#16181D" stroke="#C62828" stroke-width="2"/><path d="M64 58l12-12 14 2 6 10H64z" fill="#F5C542"/><circle cx="50" cy="88" r="11" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><circle cx="50" cy="88" r="4" fill="#F5C542"/><circle cx="100" cy="88" r="11" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><circle cx="100" cy="88" r="4" fill="#F5C542"/></svg>',
    "rc-car":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><path d="M30 84l12-14 24-4 10-10h14l8 8 22 6v14H30z" fill="#C62828" stroke="#9CA3AF" stroke-width="2"/><path d="M70 56l8-8 10 2 4 6H70z" fill="#F5C542"/><circle cx="54" cy="86" r="10" fill="#16181D" stroke="#9CA3AF" stroke-width="2"/><circle cx="54" cy="86" r="3.5" fill="#F5C542"/><circle cx="98" cy="86" r="10" fill="#16181D" stroke="#9CA3AF" stroke-width="2"/><circle cx="98" cy="86" r="3.5" fill="#F5C542"/><path d="M118 44l6-14M124 34q6-2 8 4" fill="none" stroke="#F5C542" stroke-width="2.5" stroke-linecap="round"/></svg>',
    "robot-dog":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><rect x="40" y="58" width="64" height="28" rx="12" fill="#2E323D" stroke="#9CA3AF" stroke-width="2"/><rect x="94" y="42" width="28" height="26" rx="8" fill="#16181D" stroke="#F5C542" stroke-width="2"/><path d="M96 48l-6-10M114 42l4-9" stroke="#9CA3AF" stroke-width="3" stroke-linecap="round"/><circle cx="110" cy="54" r="3" fill="#F5C542"/><path d="M50 86v18M66 86v18M88 86v18M102 86v18" stroke="#9CA3AF" stroke-width="5" stroke-linecap="round"/><path d="M40 64l-12-8" stroke="#F5C542" stroke-width="4" stroke-linecap="round"/><circle cx="72" cy="72" r="5" fill="#C62828"/></svg>',
    "boardgame":
      '<svg viewBox="0 0 150 130" aria-hidden="true"><g stroke="#9CA3AF" stroke-width="2"><path d="M75 22l20 12v24l-20 12-20-12V34l20-12z" fill="#2E323D"/><path d="M50 62l16 10v20l-16 10-16-10V72l16-10z" fill="#C62828"/><path d="M100 62l16 10v20l-16 10-16-10V72l16-10z" fill="#16181D"/></g><text x="75" y="54" fill="#F5C542" font-size="13" font-weight="800" text-anchor="middle">8</text><text x="50" y="88" fill="#fff" font-size="11" font-weight="700" text-anchor="middle">5</text><text x="100" y="88" fill="#F5C542" font-size="11" font-weight="700" text-anchor="middle">6</text></svg>'
  };

  // ---------- Helpers ----------
  var STORE_COLORS = {
    "Amazon": "#ff9900",
    "Best Buy": "#2f6fed",
    "Walmart": "#0071ce",
    "Nike": "#e5e7eb",
    "Adidas": "#ffffff",
    "Nordstrom Rack": "#9ca3af"
  };
  var BADGES = {
    "new": { label: "\u2713 New Low", cls: "new", meaning: "Lowest price the source has ever seen for this product." },
    "strong": { label: "\u2605 Strong Price", cls: "strong", meaning: "A genuinely large discount \u2014 a strong price, but not the lowest ever recorded." },
    "routine": { label: "Routine Discount", cls: "routine", meaning: "A small or routine markdown \u2014 a real saving, but nothing special." }
  };
  var SORT_LABELS = {
    "discount": "Highest Discount",
    "savings": "Biggest Dollar Savings",
    "price": "Lowest Price",
    "recent": "Most Recently Checked"
  };

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function money(n) {
    return n % 1 === 0 ? "$" + n : "$" + n.toFixed(2);
  }
  function pct(d) {
    return Math.round((d.was - d.sale) / d.was * 100);
  }
  function save(d) {
    return Math.round((d.was - d.sale) * 100) / 100;
  }

  // ---------- State ----------
  var state = { q: "", category: "", store: "", minDiscount: 0, sort: "discount", newLowOnly: false };

  var grid = document.getElementById("grid");
  var emptyBox = document.getElementById("empty");
  var statusEl = document.getElementById("status");
  var searchEl = document.getElementById("search");
  var clearBtn = document.getElementById("clearSearch");
  var categoryEl = document.getElementById("category");
  var storeEl = document.getElementById("store");
  var discountEl = document.getElementById("discount");
  var sortEl = document.getElementById("sort");
  var toggleEl = document.getElementById("newLowOnly");
  var modal = document.getElementById("modal");
  var modalBody = document.getElementById("modalBody");
  var modalClose = document.getElementById("modalClose");
  var lastFocus = null;

  // ---------- Store dropdown (built from the data, so it never lies) ----------
  (function populateStores() {
    var seen = {};
    DEALS.forEach(function (d) { seen[d.store] = true; });
    Object.keys(seen).sort().forEach(function (s) {
      var o = document.createElement("option");
      o.value = s;
      o.textContent = s;
      storeEl.appendChild(o);
    });
  })();

  // ---------- Filtering + sorting ----------
  function visibleDeals() {
    var q = state.q.trim().toLowerCase();
    var list = DEALS.filter(function (d) {
      if (q && (d.name + " " + d.store + " " + d.category).toLowerCase().indexOf(q) === -1) return false;
      if (state.category && d.category !== state.category) return false;
      if (state.store && d.store !== state.store) return false;
      if (pct(d) < state.minDiscount) return false;
      if (state.newLowOnly && d.badge !== "new") return false;
      return true;
    });
    list.sort(function (a, b) {
      if (state.sort === "savings") return save(b) - save(a) || pct(b) - pct(a);
      if (state.sort === "price") return a.sale - b.sale || pct(b) - pct(a);
      if (state.sort === "recent") return b.checkedMin - a.checkedMin || pct(b) - pct(a);
      return pct(b) - pct(a) || save(b) - save(a); // discount
    });
    return list;
  }

  // ---------- Product photos (v2) ----------
  // Photorealistic photo per deal, generated in this session and stored
  // under app/images/<id>.webp. If a local file ever fails to load, the
  // img hides itself and the inline SVG fallback (kept from v1) shows.
  // Photos load eagerly (no lazy) so a full-page screenshot never catches
  // an empty stage, and decoding="async" keeps them off first paint.
  function photoHtml(d, cls) {
    return '<img class="' + cls + '" src="images/' + esc(d.id) + '.webp" alt="" decoding="async" onerror="this.style.display=\'none\';var f=this.parentNode.querySelector(\'.art-fallback\');if(f)f.style.display=\'block\'">'
      + '<span class="art-fallback" style="display:none">' + (ART[d.art] || "") + "</span>";
  }

  // ---------- Card rendering ----------
  function cardHtml(d) {
    var b = BADGES[d.badge];
    var color = STORE_COLORS[d.store] || "#9ca3af";
    return '<article class="card" tabindex="0" role="button" data-id="' + esc(d.id) + '" aria-label="' + esc(d.name) + ", " + money(d.sale) + '">'
      + '<div class="visual"><span class="discount">-' + pct(d) + '%</span>' + photoHtml(d, "photo") + "</div>"
      + '<div class="store-row"><span class="store-dot" style="background:' + color + '"></span><span>' + esc(d.store) + "</span></div>"
      + "<h2>" + esc(d.name) + "</h2>"
      + '<div class="price-row"><span class="sale">' + money(d.sale) + '</span><span class="badge ' + b.cls + '">' + b.label + "</span></div>"
      + '<div class="usual">Usual ' + money(d.was) + "</div>"
      + '<div class="save">Save ' + money(save(d)) + "</div>"
      + '<div class="checked"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#9CA3AF" stroke-width="2"/><path d="M12 7v5l3 2" stroke="#9CA3AF" stroke-width="2" fill="none" stroke-linecap="round"/></svg><span>Checked ' + esc(d.checked) + "</span></div>"
      // v3: card-level trust signal — the source link is visible in the grid,
      // so the proof is there without opening the modal. "View on <store>"
      // only when the URL goes straight to the store; otherwise the link
      // honestly says it goes to the deals page where the price was seen.
      + '<div class="source-link"><a href="' + esc(d.url) + '" target="_blank" rel="noopener">' + (d.link === "store" ? "View on " + esc(d.store) : "See deal source") + " \u2197</a></div>"
      + "</article>";
  }

  function render() {
    var list = visibleDeals();
    grid.innerHTML = list.map(cardHtml).join("");
    emptyBox.hidden = list.length !== 0;
    grid.hidden = list.length === 0;
    statusEl.textContent = "Showing " + list.length + " of " + DEALS.length + " deals \u2022 Sorted by: " + SORT_LABELS[state.sort]
      + (state.newLowOnly ? " \u2022 New Low only" : "");
  }

  // ---------- Price-path sparkline (only the points the evidence supports) ----------
  // v3: axis label + a "Lowest" marker on the final point for New Low
  // deals. The points stay exactly the evidence-supported ones (usually
  // just [usual, checked sale]) — no invented daily history.
  function sparkline(history, badge) {
    var w = 500, h = 110, padL = 8, padR = 58, padT = 16, padB = 22;
    var prices = history.map(function (p) { return p[0]; });
    var lo = Math.min.apply(null, prices), hi = Math.max.apply(null, prices);
    var span = (hi - lo) || 1;
    lo = lo - span * 0.12; hi = hi + span * 0.12; span = hi - lo;
    function x(i) { return padL + (history.length === 1 ? (w - padL - padR) / 2 : i * (w - padL - padR) / (history.length - 1)); }
    function y(v) { return padT + (1 - (v - lo) / span) * (h - padT - padB); }
    var pts = history.map(function (p, i) { return x(i).toFixed(1) + "," + y(p[0]).toFixed(1); }).join(" ");
    var dots = history.map(function (p, i) {
      var last = i === history.length - 1;
      var s = '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(p[0]).toFixed(1) + '" r="4.5" fill="' + (last ? "#F5C542" : "#9CA3AF") + '"/>'
        + '<text x="' + (x(i) + 8).toFixed(1) + '" y="' + (y(p[0]) - 8).toFixed(1) + '" fill="#E5E7EB" font-size="12" font-weight="700">' + money(p[0]) + "</text>"
        + '<text x="' + x(i).toFixed(1) + '" y="' + (h - 6) + '" fill="#9CA3AF" font-size="11" text-anchor="middle">' + esc(p[1]) + "</text>";
      if (last && badge === "new") {
        s += '<text x="' + x(i).toFixed(1) + '" y="' + (y(p[0]) - 24).toFixed(1) + '" fill="#4ADE80" font-size="11" font-weight="700" text-anchor="middle">\u2605 Lowest</text>';
      }
      return s;
    }).join("");
    return '<svg viewBox="0 0 ' + w + " " + h + '" style="width:100%;height:auto;display:block" role="img" aria-label="Price path chart">'
      + '<text x="' + padL + '" y="11" fill="#9CA3AF" font-size="10">Price</text>'
      + '<polyline points="' + pts + '" fill="none" stroke="#F5C542" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>'
      + dots + "</svg>";
  }

  // ---------- Modal ----------
  function openModal(d) {
    var b = BADGES[d.badge];
    var ctaLabel = d.link === "store" ? "Go to Store Deal" : "See the Deal Listing";
    var ctaNote = d.link === "store"
      ? "Opens the product page at " + d.store + "."
      : "Opens the deals page where this price was seen \u2014 its Buy button leads to the product at " + d.store + ".";
    // v3 modal order (Gemini improvement prompt): title → store/badge →
    // prices → CTA (visible without scrolling) → photo → price path →
    // badge meaning → evidence → note → source meta → sticky CTA footer.
    // The price path still shows only evidence-supported points.
    modalBody.innerHTML =
      "<h2 id=\"modalTitle\">" + esc(d.name) + "</h2>"
      + '<p class="modal-store">' + esc(d.store) + " \u2022 " + esc(d.category) + ' \u2022 <span class="badge ' + b.cls + '">' + b.label + "</span></p>"
      + '<div class="modal-prices"><span class="sale">' + money(d.sale) + '</span><span class="usual">Usual ' + money(d.was) + '</span><span class="save">Save ' + money(save(d)) + " (" + pct(d) + "% off)</span></div>"
      + '<a class="modal-cta" href="' + esc(d.url) + '" target="_blank" rel="noopener">' + ctaLabel + " \u2192</a>"
      + '<p style="font-size:11px;color:#9CA3AF;margin:8px 0 14px">' + esc(ctaNote) + " Prices can change or sell out \u2014 check the store before you buy.</p>"
      + '<div class="modal-visual">' + photoHtml(d, "modal-photo") + "</div>"
      + sparkline(d.history, d.badge)
      + '<p style="font-size:11px;color:#9CA3AF;margin:6px 0 14px">Price path from the evidence on file \u2014 not a daily 30-day record. Most deals only have the usual price and the checked sale price on record.</p>'
      + '<p style="font-size:13px;color:#D1D5DB;line-height:1.55;margin:0 0 14px">' + esc(b.meaning) + "</p>"
      + '<div class="modal-evidence"><strong>Why this badge?</strong><br>' + esc(d.evidence) + "</div>"
      + (d.note ? '<p style="font-size:13px;color:#FCD34D;line-height:1.55;margin:0 0 14px">Note: ' + esc(d.note) + "</p>" : "")
      + '<p class="modal-meta">Price checked ' + esc(d.checked) + " (WIB).<br>Price source: <a href=\"" + esc(d.sourceUrl) + '" target="_blank" rel="noopener">' + esc(d.source) + "</a><br>Deal link: <a href=\"" + esc(d.url) + '" target="_blank" rel="noopener">' + esc(d.url) + "</a></p>"
      + '<div class="modal-sticky-cta"><a class="modal-cta" href="' + esc(d.url) + '" target="_blank" rel="noopener">' + ctaLabel + " \u2192</a></div>";
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modalClose.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  grid.addEventListener("click", function (e) {
    // v3: clicks on the card's source link must navigate, not open the modal.
    if (e.target.closest("a")) return;
    var card = e.target.closest(".card");
    if (!card) return;
    var d = DEALS.filter(function (x) { return x.id === card.getAttribute("data-id"); })[0];
    if (d) openModal(d);
  });
  grid.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    // v3: Enter/Space on the source link follows the link, not the modal.
    if (e.target.closest("a")) return;
    var card = e.target.closest(".card");
    if (!card) return;
    e.preventDefault();
    var d = DEALS.filter(function (x) { return x.id === card.getAttribute("data-id"); })[0];
    if (d) openModal(d);
  });
  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) closeModal(); });

  // ---------- Controls ----------
  function readControls() {
    state.q = searchEl.value;
    state.category = categoryEl.value;
    state.store = storeEl.value;
    state.minDiscount = parseInt(discountEl.value, 10) || 0;
    state.sort = sortEl.value;
    clearBtn.hidden = searchEl.value.length === 0;
  }
  searchEl.addEventListener("input", function () { readControls(); render(); });
  clearBtn.addEventListener("click", function () { searchEl.value = ""; readControls(); render(); searchEl.focus(); });
  categoryEl.addEventListener("change", function () { readControls(); render(); });
  storeEl.addEventListener("change", function () { readControls(); render(); });
  discountEl.addEventListener("change", function () { readControls(); render(); });
  sortEl.addEventListener("change", function () { readControls(); render(); });
  document.getElementById("apply").addEventListener("click", function () { readControls(); render(); });
  toggleEl.addEventListener("click", function () {
    state.newLowOnly = !state.newLowOnly;
    toggleEl.setAttribute("aria-checked", state.newLowOnly ? "true" : "false");
    render();
  });
  document.getElementById("reset").addEventListener("click", function () {
    searchEl.value = ""; categoryEl.value = ""; storeEl.value = ""; discountEl.value = "0"; sortEl.value = "discount";
    state.newLowOnly = false;
    toggleEl.setAttribute("aria-checked", "false");
    readControls(); render();
  });

  // ---------- Countdown to Cyber Monday 2026 ----------
  var target = new Date(2026, 10, 30, 0, 0, 0); // 30 Nov 2026, local time
  var countdownEl = document.getElementById("countdown");
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var diff = target.getTime() - Date.now();
    if (diff < 0) diff = 0;
    var s = Math.floor(diff / 1000);
    var days = Math.floor(s / 86400); s -= days * 86400;
    var hours = Math.floor(s / 3600); s -= hours * 3600;
    var mins = Math.floor(s / 60); var secs = s - mins * 60;
    countdownEl.textContent = pad(days) + ":" + pad(hours) + ":" + pad(mins) + ":" + pad(secs);
  }
  tick();
  setInterval(tick, 1000);

  render();
})();

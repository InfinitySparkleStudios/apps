/* ===== BRAND – the only file ISS changes for each boarder (plus icons/ and manifest.webmanifest) =====
   Prices, hours, rules, bank details, payment link and capacity are NOT here:
   the boarder changes those on their admin page (Business settings). */
window.BRAND = {
  // ISS Personalized Apps – Boarding App. Each boarder's own app is this page opened as …/boarding/?b=<their app name>;
  // their name, logo, colours, prices and bank details come from THEIR Google Sheet back office.
  // Without ?b the page shows the demo (a made-up business) with the "Get my own app" button.
  hub: true,
  name: "Happy Tails",
  shortName: "Happy Tails",
  tagline: "Home boarding & day care · demo app",
  description: "Your own dog boarding booking app – bookings, payments, daily photos.",
  footer: "Demo app by Infinity Sparkle Studios · Personalized Apps",
  logo: null,
  refPrefix: "HAPPY",
  ledgerName: "Ledger",
  whatsapp: "27790400809",
  phoneDisplay: "079 040 0809",
  colors: {
    light: { bg: "#F4F7FA", ink: "#16212B", muted: "#55636F", line: "#D9E2EA", brand: "#1E5B8C", brandInk: "#FFFFFF", accent: "#F2B705", accentSoft: "#FCF0C8", field: "#FAFCFD", surface: "#FFFFFF" },
    dark:  { bg: "#0E151B", ink: "#E8EEF3", muted: "#A7B4BF", line: "#2A3946", brand: "#7FB2DA", brandInk: "#0E151B", accent: "#F5C842", accentSoft: "#3A3214", field: "#1B2833", surface: "#16212B" }
  },
  google: { url: "" },
  supabase: { url: "", key: "" },     // never Paws' database: boarders use their own Google back office
  activeUntil: "",
  bank: null
};

/* Colours. The boarder can change the main and accent colour themselves (Business settings);
   the light/dark versions and readable text colours are worked out here. */
window.applyBrandColors = function (brand, accent) {
  const c = JSON.parse(JSON.stringify(window.BRAND.colors));
  const hex = x => /^#[0-9a-f]{6}$/i.test(String(x || "")) ? String(x) : null;
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const toHex = a => "#" + a.map(x => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");
  const mix = (h, w, t) => toHex(rgb(h).map((x, i) => x + (rgb(w)[i] - x) * t));
  const lum = h => { const [r, g, b] = rgb(h).map(x => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const ink = bgc => contrast(bgc, "#FFFFFF") >= contrast(bgc, "#1A1405") ? "#FFFFFF" : "#1A1405";
  if (hex(brand) && hex(brand).toLowerCase() !== String(c.light.brand).toLowerCase()) {
    // a new main colour: tint the page background, lines and text to match it
    const b0 = hex(brand);
    Object.assign(c.light, { bg: mix(b0, "#FFFFFF", .95), surface: "#FFFFFF", field: mix(b0, "#FFFFFF", .975), line: mix(b0, "#FFFFFF", .82), ink: mix(b0, "#000000", .82) });
    let mu = mix(b0, "#5A5A5A", .55); while (contrast(mu, c.light.bg) < 4.5) mu = mix(mu, "#000000", .1); c.light.muted = mu;
    Object.assign(c.dark, { bg: mix(b0, "#000000", .9), surface: mix(b0, "#000000", .84), field: mix(b0, "#000000", .8), line: mix(b0, "#000000", .66), ink: mix(b0, "#FFFFFF", .9) });
    let md = mix(b0, "#FFFFFF", .55); while (contrast(md, c.dark.bg) < 4.5) md = mix(md, "#FFFFFF", .1); c.dark.muted = md;
  }
  if (hex(brand)) {
    let b = hex(brand); while (contrast(b, c.light.bg) < 4.5 && lum(b) > .02) b = mix(b, "#000000", .12);   // stays readable on the page
    c.light.brand = b; c.light.brandInk = ink(b);
    let d = b; let n = 0; while (contrast(d, c.dark.bg) < 4.5 && n++ < 12) d = mix(d, "#FFFFFF", .15);       // lighter for dark mode
    c.dark.brand = d; c.dark.brandInk = ink(d);
  }
  if (hex(accent)) {
    const a = hex(accent);
    c.light.accent = a; c.light.accentSoft = mix(a, c.light.bg, .8);
    let d = a; let n = 0; while (contrast(d, c.dark.bg) < 4.5 && n++ < 12) d = mix(d, "#FFFFFF", .15);
    c.dark.accent = d; c.dark.accentSoft = mix(a, c.dark.bg, .75);
  }
  const v = o => `--bg:${o.bg};--surface:${o.surface};--ink:${o.ink};--muted:${o.muted};--line:${o.line};--brand:${o.brand};--brand-ink:${o.brandInk};--honey:${o.accent};--honey-soft:${o.accentSoft};--field:${o.field};`;
  let s = document.getElementById("brandColors");
  if (!s) { s = document.createElement("style"); s.id = "brandColors"; document.head.appendChild(s); }
  s.textContent = `:root{${v(c.light)}}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){color-scheme:dark;${v(c.dark)}}}:root[data-theme="dark"]{color-scheme:dark;${v(c.dark)}}`;
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = c.light.brand;
};
/* Self-service boarders: their app is this same app opened as …/?b=<their app name>.
   The phone remembers it, so the installed app (which opens without ?b) stays on their business.
   Without a name the page is the demo. */
window.APP_SLUG = (function () {
  let b = null; try { const q = new URLSearchParams(location.search); if (q.has("demo")) return ""; b = q.get("b"); } catch (e) {}   // the demo never opens a remembered business
  try {
    if (b !== null) { b = String(b).toLowerCase().replace(/[^a-z0-9]/g, ""); if (!b) { localStorage.removeItem("app-b"); return ""; } localStorage.setItem("app-b", b); return b; }
    return localStorage.getItem("app-b") || "";
  } catch (e) { return b || ""; }
})();
window.APP_KEY = k => (window.APP_SLUG ? window.APP_SLUG + ":" : "") + k;   // keeps each business's saved data apart on a phone
if (window.APP_SLUG) {          // a boarder's app: never show the demo's name or details
  Object.assign(window.BRAND, { name: "", shortName: "", tagline: "", description: "", footer: "", logo: null, bank: null, whatsapp: "", phoneDisplay: "", refPrefix: "",
    ledgerName: "Ledger", supabase: { url: "", key: "" }, google: { url: "" } });
}
/* Apply straight away (with the boarder's last saved colours, if any) so the page never flashes the wrong brand */
(function () {
  let saved = null; try { saved = JSON.parse(localStorage.getItem(window.APP_KEY("brand-look")) || "null"); } catch (e) {}
  window.applyBrandColors(saved && saved.brand, saved && saved.accent);
})();

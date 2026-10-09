// Bump CACHE whenever any file changes so installed copies pick up the update.
const CACHE = "plc-learn-v5";
const FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./content/backup.js", "./content/review.js", "./content/install.js",
  "./figures.js",
  "./figures2.js",
  "./parts.js",
  "./figures3.js",
  "./figures4.js",
  "./figures5.js",
  "./figures6.js",
  "./figures7.js",
  "./sim.js",
  "./plants.js",
  "./widgets.js",
  "./widgets2.js",
  "./widgets3.js",
  "./widgets4.js",
  "./content/m0_foundations.js",
  "./content/m1_tia.js",
  "./content/m2_ladder.js",
  "./content/m3_structure.js",
  "./content/m4_data.js",
  "./content/m5_hmi.js",
  "./content/m6_networks.js",
  "./content/m7_advanced.js",
  "./content/m8_professional.js",
  "./content/m9_field.js",
  "./content/m10_programming.js",
  "./content/m11_practice.js",
  "./content/m12_beyond.js",
  "./content/m13_toolkit.js",
  "./content/m14_projects.js",
  "./content/glossary.js",
  "./app.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first, so a visit always shows the newest version. Each good response
// refreshes the saved copy, which is used only when offline (the whole course works offline).
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: "no-cache" })
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || caches.match("./index.html")))
  );
});

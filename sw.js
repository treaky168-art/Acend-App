const CACHE = "ascend-2026.10.18.05";
const CORE = ["./", "./index.html", "./app.js", "./celebrate.js", "./ascend.css", "./soft.css", "./fonts/outfit-latin.woff2", "./fx.js", "./books.js", "./recipes.js", "./lqip.js", "./foods.js", "./art/task-water.webp", "./art/task-wake.webp", "./art/task-run.webp", "./art/task-str.webp", "./art/task-med.webp", "./art/task-read.webp", "./art/task-study.webp", "./art/task-chess.webp", "./art/task-cold.webp", "./art/task-screen.webp", "./art/task-unplug.webp", "./art/task-walk.webp", "./art/task-stretch.webp", "./art/task-nosugar.webp", "./art/task-grateful.webp", "./art/task-sun.webp", "./art/task-tidy.webp", "./art/tex-goldvein.webp", "./art/tex-onyx.webp", "./art/h-weight.jpg", "./art/h-sleep.jpg", "./art/h-caf.jpg", "./art/h-cal.jpg", "./art/h-bac.jpg", "./art/cover.jpg", "./art/timer.jpg", "./art/focus.jpg", "./art/deep.jpg", "./art/meditate.jpg", "./art/breathe.jpg", "./art/train.jpg", "./art/goals.jpg", "./art/books.jpg", "./art/todo.jpg", "./art/shifts.jpg", "./art/deadlines.jpg", "./art/food-breakfast.jpg", "./art/food-lunch.jpg", "./art/food-dinner.jpg", "./art/food-prep.jpg", "./art/food-snack.jpg", "./art/food-mine.jpg", "./art/light/books.jpg", "./art/light/breathe.jpg", "./art/light/deadlines.jpg", "./art/light/deep.jpg", "./art/light/focus.jpg", "./art/light/food-breakfast.jpg", "./art/light/food-dinner.jpg", "./art/light/food-lunch.jpg", "./art/light/food-mine.jpg", "./art/light/food-prep.jpg", "./art/light/food-snack.jpg", "./art/light/goals.jpg", "./art/light/h-caf.jpg", "./art/light/h-cal.jpg", "./art/light/h-bac.jpg", "./art/light/h-sleep.jpg", "./art/light/h-weight.jpg", "./art/light/meditate.jpg", "./art/light/shifts.jpg", "./art/light/task-chess.jpg", "./art/light/task-cold.jpg", "./art/light/task-screen.jpg", "./art/light/task-unplug.jpg", "./art/light/task-walk.jpg", "./art/light/task-stretch.jpg", "./art/light/task-nosugar.jpg", "./art/light/task-grateful.jpg", "./art/light/task-sun.jpg", "./art/light/task-tidy.jpg", "./art/light/task-med.jpg", "./art/light/task-read.jpg", "./art/light/task-run.jpg", "./art/light/task-str.jpg", "./art/light/task-study.jpg", "./art/light/task-wake.jpg", "./art/light/task-water.jpg", "./art/light/timer.jpg", "./art/light/todo.jpg", "./art/light/train.jpg", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((k) => Promise.all(k.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Network first for the app itself, so a redeploy lands on the next launch.
// Cache first only for icons, which never change between builds.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (/\.(png|jpg|webp|ico|webmanifest)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
    return;
  }

  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("./index.html")))
  );
});

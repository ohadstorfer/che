/* Posta — service worker for PWA + Web Push (iOS 16.4+ / Android / desktop). */

const CACHE = "che-shell-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// The app's own files — the script bundle, images, fonts — carry a content
// hash in their names, so one never changes under its URL. Served from the
// cache after the first fetch, a cold start of the installed app stops
// downloading them again. Pages themselves (and everything off-origin, like
// the API) always go to the network, so a deploy still lands on next launch.
const isStatic = (url) =>
  url.origin === self.location.origin &&
  (url.pathname.startsWith("/_expo/static/") || url.pathname.startsWith("/assets/"));

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || req.headers.has("range")) return;
  if (!isStatic(new URL(req.url))) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.status === 200) cache.put(req, res.clone()).catch(() => {});
      return res;
    })()
  );
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_e) {
    payload = { title: "Posta", body: event.data ? event.data.text() : "" };
  }
  const title = typeof payload.title === "string" ? payload.title : "";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icon-192.png",
    badge: payload.badge || "/icon-192.png",
    data: payload.data || { url: "/" },
    tag: payload.tag || "che-reminder",
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of all) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })()
  );
});

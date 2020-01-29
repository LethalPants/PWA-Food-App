const staticCacheName = "site-static-v2";
const dynamicCacheName = "site-dynamic-v1";

const assets = [
  "/",
  "/index.html",
  "/pages/fallback.html",
  "/js/app.js",
  "/js/ui.js",
  "/js/materialize.min.js",
  "/css/styles.css",
  "/css/materialize.min.css",
  "/img/dish.png",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://fonts.gstatic.com/s/materialicons/v48/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2"
];

const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};

self.addEventListener("install", evt => {
  //   console.log("service worker installed", evt);
  evt.waitUntil(
    caches.open(staticCacheName).then(cache => {
      console.log("caching shell assets");
      cache.addAll(assets);
    })
  );
});

self.addEventListener("activate", evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== staticCacheName && key !== dynamicCacheName)
          .map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener("fetch", evt => {
  evt.respondWith(
    caches
      .match(evt.request)
      .then(cacheRes => {
        return (
          cacheRes ||
          fetch(evt.request).then(res => {
            return caches.open(dynamicCacheName).then(cache => {
              cache.put(evt.request.url, res.clone());
              limitCacheSize(dynamicCacheName, 15);
              return res;
            });
          })
        );
      })
      .catch(() => {
        if (
          evt.request.url.indexOf(".html") > -1 ||
          evt.request.url.indexOf(".htm") > -1
        ) {
          caches.match("/pages/fallback.html");
        }
      })
  );
});

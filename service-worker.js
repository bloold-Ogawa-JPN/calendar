const CACHE_NAME = "calendar-v1";

// キャッシュする資材リスト（自分自身は絶対に含めない）
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "https://jsdelivr.net"
];

// インストールイベント：資材をキャッシュに保存
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // 新しいサービスワーカーをすぐに有効化
});

// アクティベートイベント：古いバージョンのキャッシュを削除
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // 起動中の全タブを即座に制御下に置く
});

// フェッチイベント：キャッシュがあれば返し、なければネットワークから取得
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});

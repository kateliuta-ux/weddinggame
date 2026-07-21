// network-first (гра ЗАВЖДИ свіжа); кеш — лише офлайн-запас. Авто-оновлення: чистимо старі кеші, слухаємо skip.
const CACHE = 'wedgame-v2';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async()=>{
  const keys = await caches.keys();
  await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));   // прибрати старі версії
  await clients.claim();
})()));
self.addEventListener('message', e => { if(e.data==='skip') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if(e.request.method !== 'GET' || url.origin !== location.origin) return;   // API/Firestore — не кешуємо
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return r;
    }).catch(() => caches.match(e.request))
  );
});

// Cofre Didáctico · San Martín — service worker (PWA offline)
// v2: estrategia "network-first" para que las imágenes/páginas actualizadas
// se vean apenas hay internet (antes quedaban cacheadas para siempre).
const CACHE = 'sanmartin-v2';
const ASSETS = ['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
  './img/historia-1-yapeyu.png','./img/historia-2-viaje.png','./img/historia-3-granaderos.png',
  './img/historia-4-andes.png','./img/historia-5-peru.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, {cache:'reload'}))).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Network-first: siempre intenta traer lo último de internet y actualiza la
// caché; si no hay conexión, usa lo guardado. Así, si reemplazás una imagen,
// se ve la nueva en cuanto haya internet.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const req = e.request;
  e.respondWith(
    fetch(req).then(resp => {
      if (resp && resp.status === 200 && resp.type === 'basic') {
        const cp = resp.clone();
        caches.open(CACHE).then(c => c.put(req, cp)).catch(() => {});
      }
      return resp;
    }).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});

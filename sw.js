const CACHE = 'sanmartin-v1';
const ASSETS = ['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
  './img/historia-1-yapeyu.png','./img/historia-2-viaje.png','./img/historia-3-granaderos.png',
  './img/historia-4-andes.png','./img/historia-5-peru.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, {cache:'reload'}))).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const req = e.request;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(resp => { const cp = resp.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return resp; }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(resp => { const cp = resp.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return resp; }).catch(()=>r)));
});

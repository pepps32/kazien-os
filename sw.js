const CACHE='kaizen-os-v04';
const CORE=['/','/index.html','/manifest.webmanifest','/kaizen-os.config.json','/sync-engine.js','/assets/kaizen-panda-mark.webp','/assets/kaizen-promittere-dark.webp','/assets/kaizen-panda-street.webp','/assets/icon-192.png','/assets/icon-512.png','/assets/icon-1024.png','/assets/apple-touch-icon.png'];
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))]));});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{});return resp;}).catch(()=>caches.match('/index.html'))));});

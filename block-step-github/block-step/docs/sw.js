const ROOT=new URL('./',self.location.href).pathname;
const CACHE='block-step-pages-v1-'+ROOT;
const BASE=['','favicon.svg','manifest.webmanifest','icon-192.png','icon-512.png'].map(p=>ROOT+p);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(BASE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('block-step-pages-')&&k.endsWith(ROOT)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',event=>{if(event.data?.type!=='CACHE_ASSETS')return;event.waitUntil((async()=>{try{const urls=event.data.urls.filter(u=>{const url=new URL(u,self.location.origin);return url.origin===self.location.origin&&/\.(js|css|woff2?)(\?|$)/.test(url.pathname)});const cache=await caches.open(CACHE);await Promise.all(urls.map(async u=>{const r=await fetch(u);if(!r.ok||r.redirected)throw Error('asset unavailable');await cache.put(u,r)}));event.ports[0]?.postMessage({ready:urls.length>0});}catch{event.ports[0]?.postMessage({ready:false});}})())});
self.addEventListener('fetch',event=>{const req=event.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin)return;
 if(req.mode==='navigate'){event.respondWith(fetch(req).then(async r=>{if(r.ok&&!r.redirected&&url.pathname===ROOT){const cache=await caches.open(CACHE);cache.put(ROOT,r.clone())}return r}).catch(async()=>{const r=await caches.match(ROOT);return r||Response.error()}));return;}
 if(!/\.(js|css|svg|png|webmanifest|woff2?)(\?|$)/.test(url.pathname))return;
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(async r=>{if(r.ok&&!r.redirected){const cache=await caches.open(CACHE);cache.put(req,r.clone())}return r})));
});

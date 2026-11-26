const VERSION="slimsyfit-freeapp-v1";
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(["/","/manifest.webmanifest"])));
  self.skipWaiting();
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(x=>x.startsWith("slimsyfit-freeapp-")&&x!==VERSION).map(x=>caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET"||new URL(request.url).origin!==self.location.origin)return;
  if(request.mode==="navigate"){
    event.respondWith(fetch(request).then(response=>{
      if(response.ok){const cloned=response.clone();caches.open(VERSION).then(c=>c.put(request,cloned))}
      return response;
    }).catch(()=>caches.match(request).then(cached=>cached||caches.match("/"))));
    return;
  }
  if(/\.(?:js|css|svg|png|jpe?g|gif|webp|ico)(?:\?.*)?$/i.test(new URL(request.url).pathname)){
    event.respondWith(caches.match(request).then(hit=>hit||fetch(request).then(response=>{
      if(response.ok&&response.type!=="opaque"&&!/\.(?:gif)$/i.test(new URL(request.url).pathname)){
        const cloned=response.clone();caches.open(VERSION).then(cache=>cache.put(request,cloned));
      }
      return response;
    })));
  }
});
// 하루카나 오프라인 저장: 한 번 열어 두면 인터넷이 없어도 열린다 (여행 중 표현집용)
// 인터넷이 되면 늘 새 버전을 받아 저장하고(network-first), 안 되면 저장해 둔 것을 쓴다
const CACHE="harukana-v1";
const CORE=["./","./index.html","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!=="GET"||new URL(r.url).origin!==self.location.origin)return; // 다른 주소(AI 서버 등)는 손대지 않는다
  // 단어 소리 파일(audio/): 한 번 들은 것은 저장해 두고 그다음부터는 저장한 것을 쓴다 (인터넷 없이도 들림)
  // 소리 태그가 보내는 일부 요청(Range)은 저장할 수 없어서, 파일 전체를 받아 저장하고 돌려준다
  if(new URL(r.url).pathname.includes("/audio/")){
    e.respondWith(caches.open(CACHE).then(c=>c.match(r.url).then(m=>m||fetch(r.url).then(res=>{if(res.ok&&res.status===200)c.put(r.url,res.clone());return res}))));
    return;
  }
  e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})
    .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match("./index.html"))));
});

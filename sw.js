
const CACHE_NAME = 'tarot-verdadeiro-v4';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0',
  'https://aistudiocdn.com/react-markdown@^10.1.0',
  'https://aistudiocdn.com/@google/genai@^1.30.0'
];

self.addEventListener('install', (event) => {
  // Força o SW a ativar imediatamente
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Tenta cachear arquivos essenciais
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => console.log('Falha não crítica ao cachear: ' + url));
          })
        );
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se encontrou no cache, retorna
        if (response) {
          return response;
        }
        
        // Se não, busca na rede
        return fetch(event.request).then(
          (response) => {
            // Verifica se a resposta é válida
            if(!response || response.status !== 200) {
              return response;
            }

            // CRÍTICO: Permitir cache de recursos 'cors' (CDNs externos) e 'basic' (mesmo domínio)
            // O código anterior bloqueava 'cors', impedindo o React/Tailwind de funcionar offline
            const type = response.type;
            if (type !== 'basic' && type !== 'cors' && type !== 'default') {
               return response;
            }

            // Clona a resposta para salvar no cache
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Apenas cacheia requisições HTTP/HTTPS (ignora chrome-extension:// etc)
                if (event.request.url.startsWith('http')) {
                   cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    Promise.all([
      // Toma o controle de todas as abas abertas imediatamente
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

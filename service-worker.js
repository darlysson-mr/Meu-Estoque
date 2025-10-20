// Nome do cache (mude o número se atualizar os arquivos depois)
const CACHE_NAME = 'stock-control-v1';

// Lista de todos os arquivos essenciais para o app funcionar offline
const urlsToCache = [
    'index.html',
    'manifest.json',
    'favicon.png',
    // Bibliotecas externas usadas pelo app
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js',
    'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@latest/dist/coco-ssd.min.js',
    'https://unpkg.com/html5-qrcode',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
    'https://unpkg.com/lucide@latest'
];

// 📦 Evento de instalação — salva os arquivos no cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('✅ Cache aberto e arquivos adicionados!');
                return cache.addAll(urlsToCache);
            })
    );
});

// 🧹 Evento de ativação — remove caches antigos
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('🧹 Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 🌐 Evento de busca — intercepta requisições e responde do cache quando possível
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Se o arquivo estiver no cache, retorna ele
            if (response) {
                return response;
            }

            // Caso contrário, faz a requisição normal e salva no cache futuramente
            return fetch(event.request).then((networkResponse) => {
                // Apenas armazena respostas válidas
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                // Clona a resposta e salva no cache
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            });
        })
    );
});

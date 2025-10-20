// Nome do cache (aumente o número se mudar a lista de arquivos)
const CACHE_NAME = 'stock-control-v1';

// Lista de todos os arquivos essenciais para o app funcionar
const urlsToCache = [
    'index.html',
    'manifest.json',
    'favicon.png.png',
    // Arquivos CSS/JS do seu código (são as referências CDN)
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js',
    'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@latest/dist/coco-ssd.min.js',
    'https://unpkg.com/html5-qrcode',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
    'https://unpkg.com/lucide@latest'
];

// Evento de Instalação: Salva todos os arquivos na lista urlsToCache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto com sucesso!');
                return cache.addAll(urlsToCache);
            })
    );
});

// Evento de Ativação: Limpa caches antigos
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Evento de Fetch: Intercepta requisições de rede
self.addEventListener('fetch', event => {
    // Tenta encontrar a requisição no cache
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se estiver no cache, retorna a versão em cache
                if (response) {
                    return response;
                }
                
                // Se não estiver no cache, faz a requisição normal
                return fetch(event.request).then(
                    function(response) {
                        // Verifica se a resposta é válida
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clona a resposta para o cache
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

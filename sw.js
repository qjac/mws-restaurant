self.importScripts('/js/idb.js');
self.importScripts('/js/dbhelper.js');

// most of this code taken directly from the videos about the wittr app
// supplemented with: https://developers.google.com/web/fundamentals/primers/service-workers/
const cacheName = 'mws-cache-v1';

// event listeners
self.addEventListener('install', function (event) {
    const urlsToCache = [
        '/',
        '/index.html',
        '/restaurant.html',
        '/css/styles.css',
        '/js/',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/restaurant_info.js',
        'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
        'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js'
    ];

    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function (event) {
    const requestUrl = new URL(event.request.url);
    if (requestUrl.port !== '1337') {
        // hijack requests!
        event.respondWith(
            caches.match(event.request).then(function (response) {
                if (response) {
                    return response;
                }

                // https://developers.google.com/web/fundamentals/primers/service-workers/
                // IMPORTANT: Clone the request. A request is a stream and
                // can only be consumed once. Since we are consuming this
                // once by cache and once by the browser for fetch, we need
                // to clone the response.
                const fetchRequest = event.request.clone();
                return fetch(fetchRequest).then(function (response) {
                // check if the response is valid, if not return response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    // if so, add to cache and return response
                    // IMPORTANT: Clone the response. A response is a stream
                    // and because we want the browser to consume the response
                    // as well as the cache consuming the response, we need
                    // to clone it so we have two streams.
                    var responseToCache = response.clone();

                    caches.open(cacheName).then(function (cache) {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                });
            })
        );
    }
});

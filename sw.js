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
        '/js/idb.js',
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

// source: https://developers.google.com/web/updates/2015/12/background-sync
// source: https://www.twilio.com/blog/2017/02/send-messages-when-youre-back-online-with-service-workers-and-background-sync.html

self.addEventListener('sync', function (event) {
    if (event.tag === 'apiSync') {
        event.waitUntil(
            dbPromise.then(function (db) {
                const tx = db.transaction('pending');
                const pendingStore = tx.objectStore('pending');
                const data = pendingStore.getAll();
                return data;
            }).then(function (data) {
                return Promise.all(

                    data.map(dataItem => {
                        const url = dataItem.url;
                        const method = dataItem.method;
                        const body = JSON.stringify(dataItem.body);

                        fetch(url, {
                            body,
                            method
                        }).then(res => res.json())
                            .then(response => {
                                dbPromise.then(function (db) {
                                    const tx = db.transaction('pending', 'readwrite');
                                    const pendingStore = tx.objectStore('pending');
                                    pendingStore.delete(dataItem.id);
                                });
                            })
                            .catch(error => console.error('Error:', error));
                    })
                );
            })
        );
    }
});

// notes
// register service worker
// navigator.serviceWorker.register('/sw.js');

// returns a promise. set callbacks for success and failure
// navigator.serviceWorker
//   .register('/sw.js')
//   .then(function(reg) {
//     console.log('yay');
//   })
//   .catch(function(err) {
//     console.log('boo');
//   });

// to offer as progressive enhancement wrap in if statement to check if browser is using it
// if (navigator.serviceWorker) {
//   navigator.serviceWorker
//     .register('/sw.js')
//     .then(function(reg) {
//       console.log('yay');
//     })
//     .catch(function(err) {
//       console.log('boo');
//     });
//   // end register service worker
// } // end if (navigator.Serviceworker)

// from https://developers.google.com/web/fundamentals/primers/service-workers/registration
// wait for initial page load before spinning up the service worker thread
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', function() {
//     navigator.serviceWorker.register('/service-worker.js');
//   });
// }

// place in main and restaurant.html
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', function() {
//     navigator.serviceWorker
//       .register('/sw.js')
//       .then(function(reg) {
//         console.log('yay');
//       }) //end register success
//       .catch(function(err) {
//         console.log('boo');
//       }); // end register service worker
//   }); // end on load
// } // end if (navigator.Serviceworker)

// most of this code taken directly from the videos about the wittr app
// supplemented with: https://developers.google.com/web/fundamentals/primers/service-workers/
const cacheName = 'mws-cache-v1';
// event listeners
self.addEventListener('install', function(event) {
  const urlsToCache = [
    '/',
    '/index.html',
    '/restaurant.html',
    '/css/styles.css',
    '/js/',
    '/js/dbhelper.js',
    '/js/main.js',
    '/js/restaurant_info.js',
    '/data/restaurants.json',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js'
  ];

  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// caches.match for taking stuff from cache
// event.respondWith
// don't need 404 handling in fetch handler
// respond with an entry from cache if there is one. it n ot, fetch from network

self.addEventListener('fetch', function(event) {
  // console.log(event.request);
  // console.log('fetching!');

  // hijack requests!
  event.respondWith(
    // new Response('<strong>hello </strong>world!', {
    // can set headers in response
    // headers: { 'Content-Type': 'text/html' }
    // })

    // pair with fetch to grab a response
    // fetch(event.request)
    //   .then(function(response) {
    //     // if statement to control what gets which response under certain conditions
    //     if (response.status === 404) {
    //       return fetch('img/2.jpg');
    //     }
    //     return response;
    //   })
    //   .catch(function() {
    //     return new Response('totally failed');
    //   })
    caches.match(event.request).then(function(response) {
      if (response) {
        return response;
      }

      // https://developers.google.com/web/fundamentals/primers/service-workers/
      // IMPORTANT: Clone the request. A request is a stream and
      // can only be consumed once. Since we are consuming this
      // once by cache and once by the browser for fetch, we need
      // to clone the response.
      const fetchRequest = event.request.clone();
      // return console.log('cache NO match!');
      return fetch(fetchRequest).then(function(response) {
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

        caches.open(cacheName).then(function(cache) {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

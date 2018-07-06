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

// event listeners
// self.addEventListener('fetch', function() {
//   console.log(event.request);
// });

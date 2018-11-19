import idb from 'idb';

(function() {
  'use strict';

  //check for support
  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
  }

  console.log(idb);

  //from the docs at https://github.com/jakearchibald/idb
const dbPromise = idb.open('restaurant-info', 1, upgradeDB => {
  // Note: we don't use 'break' in this switch statement,
  // the fall-through behaviour is what we want.
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
  }
});

})();

const dbPromise = idb.open('restaurant-db', 1, upgradeDB => {
    // Note: we don't use 'break' in this switch statement,
    // the fall-through behaviour is what we want.
    switch (upgradeDB.oldVersion) {
    case 0:
        const restaurantStore = upgradeDB.createObjectStore('restaurants');
    case 1:
        const reviewStore = upgradeDB.createObjectStore('reviews');
    }
});

/**
 * Common database helper functions.
 */
class DBHelper {
    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    static get DATABASE_URL () {
        const port = 1337; // Change this to your server port
        return `http://localhost:${port}/restaurants`;
    }

    static get DATABASE_URL_REVIEWS () {
        const port = 1337; // Change this to your server port
        return `http://localhost:${port}/reviews`;
    }

    /**
     * Fetch all restaurants.
     */

    // I went all over for this one.
    // The idea to do this work here (instead of in sw.js) came from a comment in the forums that I can't find again and attribute properly.
    // I used doug brown's helper video, the udacity idb course, and about 8 million stack overflow questions
    // using restaurants.length to check existence came from another student comment
    // QUESTION? Is there another way to check if object store already exists?
    // I feel like there should be a more direct way to check if object store exists instead of
    // returning the data and then checking that, but I couldn't find anything useful to implement.

    static fetchRestaurants (callback) {
    // look in idb first
        dbPromise.then(function (db) {
            const tx = db.transaction('restaurants');
            const restaurantStore = tx.objectStore('restaurants');
            return restaurantStore.getAll();
        }).then(function (restaurants) {
            if (restaurants.length !== 0) {
                // if restaurants in idb, return them
                callback(null, restaurants);
            } else {
                // if not in idb, fetch them from API
                fetch(DBHelper.DATABASE_URL)
                    .then(response => response.json())
                    .then(restaurants => {
                        // add to idb
                        dbPromise.then(function (db) {
                            const tx = db.transaction('restaurants', 'readwrite');
                            const restaurantStore = tx.objectStore('restaurants');

                            for (let restaurant of restaurants) {
                                restaurantStore.put(restaurant, restaurant.id);
                            }

                            return tx.complete;
                        }).catch(function (error) {
                            // failed! not added to idb
                            console.log(error);
                        }).finally(function (error) {
                            // return fetched restaurants
                            callback(null, restaurants);
                        });
                    })
                    .catch(error => callback(error, null));
            }
        });
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById (id, callback) {
        // fetch all restaurants with proper error handling.
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const restaurant = restaurants.find(r => r.id == id);
                if (restaurant) {
                // Got the restaurant
                    callback(null, restaurant);
                } else {
                // Restaurant does not exist in the database
                    callback('Restaurant does not exist', null);
                }
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine (cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(r => r.cuisine_type == cuisine);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood (neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood (cuisine, neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants;
                if (cuisine != 'all') {
                    // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') {
                    // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                callback(null, results);
            }
        });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods (callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
                // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines (callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
                // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
                callback(null, uniqueCuisines);
            }
        });
    }

    /**
     * Restaurant page URL.
     */
    static urlForRestaurant (restaurant) {
        return `./restaurant.html?id=${restaurant.id}`;
    }

    /**
     * Restaurant img srcset URL.
     */
    static imageSrcsetForRestaurant (restaurant) {
        const imgSm = '400';
        const imgMd = '600';
        const imgLg = '800';
        // recreate a string like this:
        // http://variant-1.jpg 500w, http://variant-2.jpg 750w, http://variant-3.jpg 1000w, http://variant-4.jpg 1500w
        return `/img/img-opt/${restaurant.id}-${imgSm}.jpg 400w, /img/img-opt/${restaurant.id}-${imgMd}.jpg 600w, /img/img-opt/${restaurant.id}-${imgLg}.jpg 800w`;
    }

    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant (restaurant) {
        return `/img/img-opt/${restaurant.id}-full.jpg`;
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant (restaurant, map) {
        // https://leafletjs.com/reference-1.3.0.html#marker
        const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng ], {
            title: restaurant.name,
            alt: restaurant.name,
            url: DBHelper.urlForRestaurant(restaurant)
        });
        marker.addTo(newMap);
        return marker;
    }

    /**
     * Fetch all reviews.
     */
    // static fetchReviews (callback) {
    // // look in idb first
    //     dbPromise.then(function (db) {
    //         const tx = db.transaction('reviews');
    //         const reviewStore = tx.objectStore('reviews');
    //         return reviewStore.getAll();
    //     }).then(function (reviews) {
    //         if (reviews.length !== 0) {
    //             // if in idb, return them
    //             callback(null, reviews);
    //         } else {
    //             // if not in idb, fetch them from API
    //             fetch(`${DBHelper.DATABASE_URL_REVIEWS}/${review.restaurant_id}`)
    //                 .then(response => response.json())
    //                 .then(reviews => {
    //                     // add to idb
    //                     dbPromise.then(function (db) {
    //                         const tx = db.transaction('reviews', 'readwrite');
    //                         const reviewStore = tx.objectStore('reviews');

    //                         for (let review of reviews) {
    //                             reviewStore.put(review, review.id);
    //                         }

    //                         return tx.complete;
    //                     }).catch(function (error) {
    //                         // failed! not added to idb
    //                         console.log(error);
    //                     }).finally(function (error) {
    //                         // return fetched
    //                         callback(null, reviews);
    //                     });
    //                 })
    //                 .catch(error => callback(error, null));
    //         }
    //     });
    // }

    // /**
    //  * Fetch a restaurant by its ID.
    //  */
    // static fetchReviewById (id, callback) {
    //     // fetch all with proper error handling.
    //     DBHelper.fetchReviews((error, reviews) => {
    //         if (error) {
    //             callback(error, null);
    //         } else {
    //             const review = reviews.find(r => r.id == id);
    //             if (review) {
    //             // Got the review
    //                 callback(null, review);
    //             } else {
    //             // does not exist in the database
    //                 callback('Review does not exist', null);
    //             }
    //         }
    //     });
    // }
}

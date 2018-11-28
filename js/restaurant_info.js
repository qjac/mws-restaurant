let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', event => {
    initMap();
});

// register service worker after window load.
// QUESTION: Better to wait until DOMContentLoaded?
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js'); // end register service worker
    }); // end on load
} // end if (navigator.Serviceworker)

/**
 * Initialize leaflet map
 */
initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) {
            // Got an error!
            console.error(error);
        } else {
            self.newMap = L.map('map', {
                center: [restaurant.latlng.lat, restaurant.latlng.lng ],
                zoom: 16,
                scrollWheelZoom: false
            });
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
                mapboxToken: 'pk.eyJ1IjoicWphYyIsImEiOiJjamlkY2t1b3gwYTlxM3dsZ3A4MTNoc3ByIn0.rQwxpMIBh21Ym0DjHPDnSg',
                maxZoom: 18,
                attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                id: 'mapbox.streets'
            }).addTo(newMap);
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
        }
    });
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);

    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = callback => {
    if (self.restaurant) {
    // restaurant already fetched!
        callback(null, self.restaurant);
        return;
    }
    const id = getParameterByName('id');
    if (!id) {
    // no id found in URL
        error = 'No restaurant id in URL';
        callback(error, null);
    } else {
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
            self.restaurant = restaurant;
            if (!restaurant) {
                console.error(error);
                return;
            }
            fillRestaurantHTML();
            callback(null, restaurant);
        });
    }
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    // add aria-current="page" to li to meet
    // https://www.w3.org/TR/wai-aria-practices-1.1/examples/breadcrumb/index.html
    li.setAttribute('aria-current', 'page');
    breadcrumb.appendChild(li);
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const fave = document.getElementById('is-favorite');
    (restaurant.is_favorite) ? fave.checked = true : fave.checked = false;
    fave.addEventListener('change', function (id, newState) {
        if (this.checked) {
            restaurant.is_favorite = true;
        } else {
            restaurant.is_favorite = false;
        }
        newState = restaurant.is_favorite;

        DBHelper.updateFavorite(restaurant.id, newState);
    });

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img';
    image.sizes = '(max-width: 900px) 83vw, (max-width: 1300px) 50vw, (max-width: 1700px) 33vw, 25vw';
    image.srcset = DBHelper.imageSrcsetForRestaurant(restaurant);
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    image.alt = restaurant.alt;

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }

    DBHelper.fetchReviews(restaurant.id)
        .then(reviews => fillReviewsHTML(reviews));
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
    const container = document.getElementById('reviews-container');

    if (reviews.length < 1 || !reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }

    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = review => {
    const li = document.createElement('li');
    const name = document.createElement('p');
    name.innerHTML = review.name;
    li.appendChild(name);

    const date = document.createElement('p');

    date.innerHTML = new Date(review.updatedAt).toDateString();
    li.appendChild(date);

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
};

handleSubmit = (newReview) => {
    event.preventDefault();

    const restaurantId = getParameterByName('id');
    const name = document.getElementById('add-author').value;
    // source: https://stackoverflow.com/questions/9618504/how-to-get-the-selected-radio-button-s-value
    const rating = document.querySelector('input[name="add-rating"]:checked').value;
    const comment = document.getElementById('add-comment').value;

    const review = {
        'restaurant_id': restaurantId,
        'name': name,
        'rating': rating,
        'comments': comment
    };

    console.log(review);
};

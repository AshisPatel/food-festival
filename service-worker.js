// Files that we would like to Cache
// Not caching images, as caches have limits to what can be stored in the browser. 
// Thus we prioritize the javascript and HTML, CSS, and Jscript so the website can still function 
const FILES_TO_CACHE = [
    "./index.html",
    "./events.html",
    "./tickets.html",
    "./schedule.html",
    "./assets/css/style.css",
    "./assets/css/bootstrap.css",
    "./assets/css/tickets.css",
    "./dist/app.bundle.js",
    "./dist/events.bundle.js",
    "./dist/tickets.bundle.js",
    "./dist/schedule.bundle.js"
];

const APP_PREFIX = "FoodFest-";
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION; 

// INSTALLATION STEP OF SERVICE WORKER

// Self must be used because the service worker is created before the window object has been created. Thus we must reference the service worker itself. 
self.addEventListener('install', function(e){
    // waitUntil prevents the browser from terminating the service worker until it's finished executing all of its code
    e.waitUntil(
        // caches.open opens the specific cache with the cache_name, and then we add all the files to that cache
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE); 
        })
    )
})

// ACTIVATION STEP OF SERVICE WORKER

self.addEventListener('activate', function(e){
    e.waitUntil(
        // We are grabbing all the cache names that are hosted at <username>.github.io (our github pages) utilizing .keys()
        // This is the variable -> keyList, and we filter through this array and only keep the caches that are relevant to our app. 
        caches.keys().then(function (keyList){
            let cacheKeeplist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX)
            });
            // add current cache to the keep list as well
            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(
                // iterates through the keyList (all caches at our github pages) and checks to see if the cache name exists in our keep list
                // if it does not, indexOf returns -1, and we delete it from our caches. 
                keyList.map(function(key,i) {
                    if (cacheKeeplist.indexOf(key) === -1) {
                        console.log('deleting cache : ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            )
        })
    )
})

// Functionality to tell service worker how to retrieve information from the cache
// activates on any fetch request
self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
        // checks to see if the resource that is being requested is already stored in the caches. 
        // if it is, we will respond with the cache request
        caches.match(e.request).then(function(request) {
            if (request) {
                console.log('responding with cache : ' + e.request.url)
                return request
            } else {
                // if the request is not in the cache, the service worker will make the request like normal
                console.log('file is not cached, fetching : ' + e.request.url)
                return fetch(e.request)
            }
        })
    )
})
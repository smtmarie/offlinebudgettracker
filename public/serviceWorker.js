import { response } from "express";

const CACHE_NAME = 'static-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1';

const FILES_to_CACHE = [

    '/',
    '/index.html',
    '/indexedDB.js',
    '/index.js',
    '/styles.css',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'

];

self.addEventListener('install', event => {

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_to_CACHE);
        })
    );

    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        cache.keys().then(keyList => {

            return Promise.all(
                keyList.map(key => {

                if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {

                    return caches.delete(key);
                };

                })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener('fetch', event => {

    if(event.request.url.includes('/api/')) {

        event.respondWith(

        caches.open(DATA_CACHE_NAME).then(cache => {

            return fetch (event.request)

            .then(response => {

                if (response.status === 200) {
                    cache.put(event.request.url, response.clone());
                }
                return response;
            })
            .catch(err => {
                return cache.match(event.request);
            });

        }).catch(err => {

            console.log(err);

        })

        );

        return;
    }

    event.respondWith(

        caches.match(event.request).then(function (response) {

            return response || fetch(event.request);
        })
    )
});
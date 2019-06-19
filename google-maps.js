var infowindow;

/**
 * @param querySelector
 * @param mapOptions
 * @param objectsToDraw
 */
async function createMap(querySelector, mapOptions, objectsToDraw) {
    if (typeof google === 'undefined' || !google) {
        setTimeout(function () {
            createMap(querySelector, mapOptions, objectsToDraw);
        }, 250);
        return;
    }

    if (!mapOptions || !mapOptions.center) {
        mapOptions = {
            center: {lat: 52.215645, lng: 5.963948},
            zoom:   10,
        };
    }

    let mapElement = document.querySelector(querySelector);

    if (!mapElement) {
        throw new MapsElementDoesNotExistError('Map element does not exist!');
    }

    let map = await new google.maps.Map(mapElement, mapOptions);

    infowindow = new google.maps.InfoWindow();

    await drawObjects(map, objectsToDraw, mapOptions);
}

/**
 * @param key
 * @param querySelector
 * @param mapOptions
 * @param objectsToDraw
 */
async function initGoogleMaps(key, querySelector, mapOptions, objectsToDraw) {
    // Load in custom error class
    let script = document.createElement('script');
    script.src = 'MapsElementDoesNotExistError.js';
    document.body.appendChild(script);

    if (!mapOptions.disable_clustering) {
        // Load in MarkerClusterer
        script     = document.createElement('script');
        script.src = 'MarkerClusterer.js';
        document.body.appendChild(script);
    }

    // Load in google maps
    script     = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + key;
    document.body.appendChild(script);

    // Load in styling
    let link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'google-maps.css';
    document.head.appendChild(link);

    // Create the map
    await createMap(querySelector, mapOptions, objectsToDraw);
}

/**
 * @param map
 * @param objectsToDraw
 * @param mapOptions
 * @returns {Promise<void>}
 */
async function drawObjects(map, objectsToDraw, mapOptions) {
    if (!Array.isArray(objectsToDraw)) {
        throw new Error('The objectsToDraw variable needs to be an array!');
    }

    let markers = [];

    for (let i = 0; i < objectsToDraw.length; i++) {
        await drawObject(objectsToDraw[i], function (object) {
            let marker = new google.maps.Marker(
                {
                    map:       map,
                    position:  object,
                    clickable: true,
                    ...object,
                },
            );

            if (!marker.addEventListener) {
                marker.addEventListener = marker.addListener;
            }

            marker.addEventListener('click', function () {
                infowindow.setContent(marker.title);
                infowindow.open(map, marker);
            });

            marker.setMap(map);

            markers.push(marker);

            if (markers.length === objectsToDraw.length && !mapOptions.disable_clustering) {
                new MarkerClusterer(map, markers, mapOptions.cluster_options || {});
            }
        });
    }
}

/**
 * @param object
 * @param callback
 * @returns {*}
 */
async function drawObject(object, callback) {
    if (!object.lat || !object.lng) {
        if (object.address) {
            let geocoder = new google.maps.Geocoder();

            return await geocoder.geocode(
                {'address': object.address},
                (results, status) => {
                    if (status === 'OK') {
                        let location = results[0].geometry.location;

                        callback(
                            {
                                lat: location.lat(),
                                lng: location.lng(),
                                ...object,
                            },
                        );
                    } else {
                        console.log('Geocode was not successful for the following reason: ' + status);
                    }
                },
            );
        }
    }

    return callback(object);
}

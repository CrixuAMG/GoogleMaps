var infowindow;

/**
 * @param querySelector
 * @param mapsOptions
 * @param objectsToDraw
 */
async function createMap(querySelector, mapsOptions, objectsToDraw) {
    if (typeof google === 'undefined' || !google) {
        setTimeout(function () {
            createMap(querySelector, mapsOptions, objectsToDraw);
        }, 250);
        return;
    }

    if (!mapsOptions || !mapsOptions.center) {
        mapsOptions = {
            center: {lat: 52.215645, lng: 5.963948},
            zoom:   10,
        };
    }

    let mapElement = document.querySelector(querySelector);

    if (!mapElement) {
        throw new MapsElementDoesNotExistError('Map element does not exist!');
    }

    let map = await new google.maps.Map(mapElement, mapsOptions);

    infowindow = new google.maps.InfoWindow();

    await drawObjects(map, objectsToDraw);
}

/**
 * @param key
 * @param querySelector
 * @param mapsOptions
 * @param objectsToDraw
 */
async function initGoogleMaps(key, querySelector, mapsOptions, objectsToDraw) {
    // Load in custom error class
    let script = document.createElement('script');
    script.src = 'MapsElementDoesNotExistError.js';
    document.body.appendChild(script);

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
    await createMap(querySelector, mapsOptions, objectsToDraw);
}

/**
 * @param map
 * @param objectsToDraw
 * @returns {Promise<void>}
 */
async function drawObjects(map, objectsToDraw) {
    if (!Array.isArray(objectsToDraw)) {
        throw new Error('The objectsToDraw variable needs to be an array!');
    }

    for (let i = 0; i < objectsToDraw.length; i++) {
        drawObject(objectsToDraw[i], function (object) {
            console.log(
                {
                    map:       map,
                    position:  object,
                    clickable: true,
                    ...object,
                },
            );

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

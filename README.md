# GoogleMaps

```
<script src="google-maps.js"></script>
<script>
    window.onload = function () {
        let iconBase = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/';

        initGoogleMaps(
            'YOUR_API_KEY',
            '#map', // The queryselector for the element you wish to put the map in
            {
                // The center of the map
                center: {lat: 52.215645, lng: 5.963948},
                zoom:   10,
            },
            // The array of objects you wish to put on the map, any options supported by the Marker class is supported here
            [
                {
                    lat:            52.215645,
                    lng:            5.963948,
                    title:          'Apeldoorn centrum',
                    icon:           iconBase + 'library_maps.png',
                    map_icon_label: '<span class="map-icon map-icon-point-of-interest"></span>',
                    optimized:      true,
                },
            ],
        );
    };
</script>
```

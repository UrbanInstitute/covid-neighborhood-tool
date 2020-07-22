var US_ZOOM = 3.5;
// var US_CENTER = [-95.5795, 37.8283]
var US_CENTER = [-77.036560,38.897957];

var pymChild = new pym.Child({renderCallback: initMap });

function IS_MOBILE(){
	return d3.select("#isMobile").style("display") == "block"
}
function IS_PHONE(){
	return d3.select("#isPhone").style("display") == "block"
}


function initMap(){
	// initLegend()
	mapboxgl.accessToken = 'pk.eyJ1IjoidXJiYW5pbnN0aXR1dGUiLCJhIjoiTEJUbmNDcyJ9.mbuZTy4hI_PWXw3C3UFbDQ';

	var map = new mapboxgl.Map({
		attributionControl: false,
		container: 'map',
		style: 'mapbox://styles/urbaninstitute/ckcnh9jwm2llo1hp4yvfvy76i',
		center: US_CENTER,
		zoom: US_ZOOM,
		maxZoom: 12,
		minZoom: US_ZOOM
	});

    // map.fitBounds([[-133.2421875, 16.972741], [-47.63671875, 52.696361]]);
    var tractID = null; // track which tract is mousedover

    map.on('load', function() {

        // make the tract outlines in the tract-hover-strokes layer transparent
        // will modify this so that the tract the user has hovered over is outlined
        map.setPaintProperty(
            'tract-hover-strokes',
            'line-opacity',
            [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                1,
                0
            ]
        );

        // hover behavior adapted from: https://docs.mapbox.com/help/tutorials/create-interactive-hover-effects-with-mapbox-gl-js/
        map.on('mousemove', 'housing-data-indexid', function(e) { // detect mousemove on the fill layer instead of stroke layer so correct tract is highlighted

            console.log(e.features[0].properties);
            // console.log(e.features);

            map.getCanvas().style.cursor = 'pointer';
            // Set variables equal to the current feature's magnitude, location, and time
            // var quakeMagnitude = e.features[0].properties.mag;
            // var quakeLocation = e.features[0].properties.place;
            // var quakeDate = new Date(e.features[0].properties.time);

            // Check whether features exist
            if (e.features.length > 0) {

                // If tractID for the hovered feature is not null,
                // use removeFeatureState to reset to the default behavior
                if (tractID) {
                    map.removeFeatureState({
                        source: 'composite',
                        sourceLayer: 'housing_data_indexid',
                        id: tractID
                    });
                }

                tractID = e.features[0].id;

                // When the mouse moves over the tract-hover-strokes layer, update the
                // feature state for the feature under the mouse
                map.setFeatureState({
                    source: 'composite',
                    sourceLayer: 'housing_data_indexid',
                    id: tractID
                },
                {
                    hover: true
                });

            }

        });
    });

	map.addControl(new mapboxgl.NavigationControl({"showCompass": false}), "bottom-right");

    if (pymChild) {
        pymChild.sendHeight();
    }
}


var US_ZOOM = 3.5;
var US_CENTER = [-95.5795, 37.8283]

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

    map.on('load', function() {
      // the rest of the code will go in here
    });

	map.addControl(new mapboxgl.NavigationControl({"showCompass": false}), "bottom-right");

    if (pymChild) {
        pymChild.sendHeight();
    }
}


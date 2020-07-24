var US_ZOOM = 3.5;
var US_CENTER = [-95.5795, 37.8283];

var pymChild = new pym.Child({renderCallback: getCoords });

function IS_MOBILE(){
	return d3.select("#isMobile").style("display") == "block"
}
function IS_PHONE(){
	return d3.select("#isPhone").style("display") == "block"
}

// function init() {
//     getCoords()
//         .then(initMap)
//         .catch(function handleError(error) { console.log(error); });
// }

function getCoords() {
    var request = new XMLHttpRequest();
    request.open("GET", "https://get.geojs.io/v1/ip/geo.json");
    request.send();
    request.onload = function() {
        // console.log(request);
        if(request.status === 200) {
            var response = JSON.parse(request.response);
            var lat = +response.latitude;
            var long = +response.longitude;
            var city = response.city;
            var state = response.region;
            var country = response.country;
            var accuracy = response.accuracy;

            // what if user is from outside the US? need some default coords
            console.log(response);

            initMap(lat, long);
        }
        else {
            console.log("error");
        }
    }

    initLegend();
    initSearch("county");

    if (pymChild) {
        pymChild.sendHeight();
    }
}

function initMap(user_lat, user_lng){
	// initLegend()

	mapboxgl.accessToken = 'pk.eyJ1IjoidXJiYW5pbnN0aXR1dGUiLCJhIjoiTEJUbmNDcyJ9.mbuZTy4hI_PWXw3C3UFbDQ';

	var map = new mapboxgl.Map({
		attributionControl: false,
		container: 'map',
		style: 'mapbox://styles/urbaninstitute/ckcnh9jwm2llo1hp4yvfvy76i',
		center: [user_lng, user_lat],
		zoom: 9,
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
        // also a good resource: https://blog.mapbox.com/going-live-with-electoral-maps-a-guide-to-feature-state-b520e91a22d
        map.on('mousemove', 'housing-data-indexid', function(e) { // detect mousemove on the fill layer instead of stroke layer so correct tract is highlighted

            // console.log(e.features[0].properties);
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
}

function initSearch(geo) {
    var placeholderText = (geo === "county") ? "Search for your county" : "Search for your continuum of care";
    // var searchData = (geo === "county") ? countyData : cocData;

    $( "#geoSearch" ).autocomplete({
        // source: searchData,
        // select: function( event, ui ) {

        //     if(!IS_PHONE()){
        //         d3.select("#clickedBaselineType").datum("county")

        //         // var coordinates = e.features[0].geometry.coordinates[0]
        //         bd = getCountyBoundsData()[countyData[ui.item.value]["properties"]["county_fips"]]
        //         zoomIn("county", countyData[ui.item.value]["properties"]["county_fips"], bd.bounds)
        //     }
        //     d3.select("#searchicon").attr("src", "img/closeIcon.png").classed("close", true)

        //     // map.getSource('hoverBaselinePolygonSource').setData(hoverData);


        //     setActiveBaseline(countyData[ui.item.value]["properties"], "", "county", true)
        //     $(this).val(ui.item.label)
        //     // $(this).text(ui.item.label)
        //     return false;
        // },
        create: function(event, ui){
            $(this)
                .val("Search for your county")
                .on("focus", function(){
                    $(this)
                        .val("")
                        .addClass("active")

                })
        }
    });
}

function initLegend() {
    // clear existing svg so the legend doesn't get duplicated when the window is resized
    $(".legendContainer svg").remove();

    var legendMargins = {top: 0, right: 18, bottom: 35, left: 15};
    var legendBlockHeight = 20;
    var legendWidth = d3.select(".legendContainer").node().getBoundingClientRect().width - legendMargins.left - legendMargins.right;

    // scales
    var xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, legendWidth]);

    var colorScale = d3.scaleOrdinal()
        .domain([0, 1, 2, 3, 4, 5])
        .range(["#cfe8f3", "#73bfe2", "#46abdb", "#1696d2", "#12719e", "#0a4c6a"]);

    // make legend
    var legendSvg = d3.select(".legendContainer")
        .append("svg")
        .attr("width", legendWidth + legendMargins.left + legendMargins.right)
        .attr("height", legendBlockHeight + legendMargins.top +legendMargins.bottom)
        .append("g")
        .attr("transform", "translate(" + legendMargins.left + ", " + legendMargins.top + ")");

    legendSvg.selectAll(".legendBlock")
        .data([0, 50, 60, 70, 80, 90])
        .enter()
        .append("rect")
        .attr("class", "legendBlock")
        .attr("width", function(d) { return d === 0 ? xScale(50) : xScale(10); })
        .attr("height", legendBlockHeight)
        .attr("x", function(d) { return xScale(d); })
        .attr("y", 0)
        .style("fill", function(d, i) { return colorScale(i); });

    legendSvg.selectAll(".legendLabel")
        .data([0, 50, 60, 70, 80, 90, 100])
        .enter()
        .append("text")
        .attr("class", "legendLabel")
        .attr("x", function(d) { return xScale(d); })
        .attr("y", legendBlockHeight * 1.7)
        .text(function(d) { return d; });

    legendSvg.append("text")
        .attr("class", "legendLabel")
        .attr("x", 0)
        .attr("y", legendBlockHeight * 2.6)
        .text("LOW");

    legendSvg.append("text")
        .attr("class", "legendLabel")
        .attr("x", legendWidth)
        .attr("y", legendBlockHeight * 2.6)
        .text("HIGH");
}

// event handlers for the two buttons
// when user clicks on counties, update search to populate with counties
// when user clicks on CoC, update search to populate with continuums of care
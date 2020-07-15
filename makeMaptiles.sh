# make maptiles from data geojson
tippecanoe -f -z12 -Z3 -o housing_data_indicators.mbtiles --coalesce-densest-as-needed data/housing_data_indicators.geojson
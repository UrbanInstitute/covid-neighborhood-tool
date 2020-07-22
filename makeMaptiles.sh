#!/bin/sh

### Shell script to prepare Mapbox tiles from data

### First, add an "id" as a top level property for each feature
### Second, convert the geojson with the ids into a mbtiles set that can be uploaded to Mapbox (https://studio.mapbox.com/tilesets/)


### Library requirements:
### ndjson-cli
### tippecanoe


# download geojson from S3
# curl -O https://ui-lodes-job-change-public.s3.amazonaws.com/sum_job_loss_cbsa.geojson

# remove all line breaks from the geojson so we can use ndjson-split and add id as a top level property
cat data/housing_data_index-subset.geojson | tr '\n' ' ' > data/housing_data_index_no_linebreaks.geojson

# turn the geojson into a newline-delimited json
ndjson-split 'd.features' < data/housing_data_index_no_linebreaks.geojson > data/housing_data_index.ndjson

# add id to each feature from its properties
ndjson-map 'd.id = +d.properties.GEOID, d' \
  < data/housing_data_index.ndjson \
  > data/housing_data_index-id.ndjson

# convert back to geojson
ndjson-reduce \
  < data/housing_data_index-id.ndjson \
  | ndjson-map '{type: "FeatureCollection", features: d}' \
  > data/housing_data_index-id.json

# make maptiles from geojson
tippecanoe -f -z12 -Z3 -o data/housing_data_indicators-id.mbtiles --coalesce-densest-as-needed data/housing_data_index-id.json
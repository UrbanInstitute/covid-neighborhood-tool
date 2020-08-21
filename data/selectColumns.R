# script to generate final datasets 

library(tidyverse)
library(sf)
library(urbnmapr)

### final tract-level geojson that will get turned into mapbox tiles
# geojson available here: https://ui-covid-housing-risk-indicators.s3.amazonaws.com/housing_index_state_adj_feature.geojson
tracts_dat <- st_read("source/housing_index_state_adj_feature.geojson")

# get mapping of state names to state abbreviations from urbnmapr
states <- get_urbn_map(map = "states") %>%
  select(state_fips, state_abbv, state_name) %>%
  distinct()

# subset to the columns we need and convert the percentiles to integers to make 
# file size smaller
tracts_subset <- tracts_dat %>%
  select(GEOID,
         total_index_quantile,
         housing_index_quantile,
         covid_index_quantile,
         equity_index_quantile,
         num_ELI,
         grayed_out,
         geometry) %>%
  mutate(total_index_quantile = as.integer(total_index_quantile * 100),
         housing_index_quantile = as.integer(housing_index_quantile * 100),
         covid_index_quantile = as.integer(covid_index_quantile * 100),
         equity_index_quantile = as.integer(equity_index_quantile * 100)
  ) %>%
  mutate(total_index_quantile = ifelse(grayed_out == 1, -99, total_index_quantile)) %>%
  mutate(num_ELI = as.integer(num_ELI),
         grayed_out = as.integer(grayed_out))

st_write(tracts_subset, "housing_data_index-subset.geojson", delete_dsn = T)

# also create a mapping of tracts to their county names, county fips, state names and state fips
# for display in the tool. this will be a separate file rather than included in the geojson
# to keep the geojson file size as small as possible
geos <- as.data.frame(tracts_dat) %>%
  select(GEOID, county_name, county_fips, state_name, state_fips) %>%
  left_join(states) %>%
  mutate(county_name = str_replace(county_name, " city", " City"))

write_csv(geos, "geos.csv")

# fix capitalization of "city" in county names (i.e., "Buena Vista city" -> "Buena Vista City")
counties_dat <- st_read("counties.geojson")

counties_final <- counties_dat %>%
  mutate(namelsad = str_replace(namelsad, " city", " City"))

st_write(counties_final, "counties-final.geojson", delete_dsn = T)

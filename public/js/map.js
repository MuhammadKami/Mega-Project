mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  center: [64.88,27.488], // starting position [lng, lat]. Note that lat must be set between -90 and 90
  zoom: 5, // starting zoom
});

// console.log(coordinates)

// const marker = new mapboxgl.Marker().setLngLat(coordinates).addTo(map);

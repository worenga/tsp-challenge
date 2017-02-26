function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  // https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}



export function getFallBackDistance(placeFrom,placeTo) {
  //In case google maps was not able to give us any route, or in case line of sight is used,
  //we simply fall back to latLng distance

  return getDistanceFromLatLonInKm(placeFrom.geometry.location.lat(),
                                   placeFrom.geometry.location.lng(),
                                   placeTo.geometry.location.lat(),
                                   placeTo.geometry.location.lng());
}

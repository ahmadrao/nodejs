function rad(x) {
  return x * Math.PI / 180;
};

function getDistance(lat_1, lon_1 , lat_2 , lon_2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(lat_2 - lat_1);
  var dLong = rad(lon_2 - lon_1);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(lat_1)) * Math.cos(rad(lat_2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return Math.round(d);
}

module.exports = {
  getDistance
}

import { GeocodeResponse } from "@googlemaps/google-maps-services-js";
import { addressesWIthCoordinates } from "../consts/addressWIthCoordinates";

export function onReturn(res: GeocodeResponse | null, addressId: number) {
  if (!res) throw new Error("response returned null");

  const southWest = res.data.results[0].geometry.viewport.southwest;
  const northEast = res.data.results[0].geometry.viewport.northeast;

  const southLat = southWest.lat;
  const northLat = northEast.lat;
  const westLng = southWest.lng;
  const eastLng = northEast.lng;

  const averageLat = (southLat + northLat) / 2;
  const averageLng = (westLng + eastLng) / 2;

  console.log(`latitude: ${averageLat}, longitude: ${averageLng}`);
  addressesWIthCoordinates[addressId].coordinates = {
    lat: averageLat,
    lng: averageLng,
  };

  addressesWIthCoordinates[addressId].isGoogle = true;

  return `latitude: ${averageLat}, longitude: ${averageLng}`;
}

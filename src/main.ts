import axios, { AxiosResponse } from "axios";
import { Address, WazeAddress } from "./types";

import { addresses } from "./addresses";
import { Client, GeocodeResponse } from "@googlemaps/google-maps-services-js";

import { geocodeAddressWithWaze } from './waze-geocoder';

// Example usage
export async function findCoordinates() {

  const Geocoder = new Client({});

  for (const address of addresses) {
    try {
      const coordinates = await geocodeWithFallback(address, Geocoder);
      if (coordinates) {
      } else {
        console.error("Geocoding failed with both services.");
        throw new Error();
      }
    } catch (error) {
      console.error(`Geocoding error for ${address.full_address}: ${error}`);
      throw new Error();
    }
  }
  const data = JSON.stringify(addresses);
  // i want to count the number of google addresses
  const googleCount = addresses.filter((address) => address.isGoogle).length;
  console.log("🚀 ~ file: main.ts:28 ~ findCoordinates ~ googleCount:", googleCount)
  console.log("🚀 ~ file: main.ts:26 ~ findCoordinates ~ data:", data)
  console.log("Geocoding complete!");
}

function onReturn(res: GeocodeResponse | null, addressId: number) {
  if (!res) throw new Error("response returned null");

  const southWest = res.data.results[0].geometry.viewport.southwest
  const northEast = res.data.results[0].geometry.viewport.northeast

  const southLat = southWest.lat;
  const northLat = northEast.lat;
  const westLng = southWest.lng;
  const eastLng = northEast.lng;

  const averageLat = (southLat + northLat) / 2;
  const averageLng = (westLng + eastLng) / 2;

  console.log(`latitude: ${averageLat}, longitude: ${averageLng}`);
  addresses[addressId].coordinates = {
    lat: averageLat,
    lng: averageLng,
  };

  addresses[addressId].isGoogle = true;

  return `latitude: ${averageLat}, longitude: ${averageLng}`;
}

// Function to process Waze geocoding response
function onReturnWaze(coordinates: { lat: number; lon: number; } | null, addressId: number): string {
  if (!coordinates) throw new Error('Waze response does not contain valid coordinates');
  addresses[addressId].coordinates = {
    lat: coordinates.lat,
    lng: coordinates.lon,
  };
  return `latitude: ${coordinates.lat}, longitude: ${coordinates.lon}`;
}

// Function to geocode an address using the Waze API
async function geocodeWithWaze(address: Address) {
  // Throttle requests to Waze API
  const throttleDelayMs = 1000; // Adjust as needed (1 request per second)

  // Create a function to delay execution
  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  const coordinates = await geocodeAddressWithWaze(address.full_address);
  if (!coordinates) return null;
  const result = onReturnWaze(coordinates, address.id);
  await delay(throttleDelayMs);
  return result;
}

// Function to geocode an address using the Google Geocoding API
async function geocodeWithGoogle(
  address: Address,
  geocoder: Client
) {
  try {
    const results = await geocoder.geocode({
      params: {
        key: process.env.apikey ?? "REDACTED_KEY",
        address: address.full_address,
        region: "il",
      }
    });
    return onReturn(results, address.id);
  } catch (error) {
    console.error(`Geocoding error for ${address.full_address}: ${error}`);
  }

  // Return null if Google geocoding fails
  return null;
}

// Function to perform geocoding with fallback to Google if Waze fails
async function geocodeWithFallback(
  address: Address,
  geocoder: Client
) {
  const wazeResult = await geocodeWithWaze(address);

  if (wazeResult) {
    return wazeResult;
  } else {
    // Fallback to Google Geocoding
    return await geocodeWithGoogle(address, geocoder);
  }
}

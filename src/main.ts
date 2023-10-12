import axios, { AxiosResponse } from "axios";
import { Address, WazeAddress } from "./types";

import { addresses } from "./addresses";
import { Client, GeocodeResponse } from "@googlemaps/google-maps-services-js";

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
function onReturnWaze(response: WazeAddress | null, addressId: number): string {
  if (response) {
    const coordinates = response.latLng;
    if (coordinates) {
      const averageLat = coordinates.lat;
      const averageLng = coordinates.lng;

      console.log(`latitude: ${averageLat}, longitude: ${averageLng}`);

      // Update the coordinates in your addresses array or storage
      addresses[addressId].coordinates = {
        lat: averageLat,
        lng: averageLng,
      };

      return `latitude: ${averageLat}, longitude: ${averageLng}`;
    }
  }

  throw new Error("Waze response does not contain valid coordinates");
}

// Function to geocode an address using the Waze API
async function geocodeWithWaze(address: Address) {
  // Throttle requests to Waze API
  const throttleDelayMs = 1000; // Adjust as needed (1 request per second)

  // Create a function to delay execution
  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const wazeURL = `https://www.waze.com/live-map/api/autocomplete?q=${encodeURI(address.full_address
    )}&v=33.38327644404132,34.2795153896776%3B29.395314745725695,35.055000047183896&lang=he-IL&exp=`


  try {
    const response: AxiosResponse<WazeAddress[]> = await axios.get(wazeURL);
    if (response.status === 200) {
      const data = response.data;
      if (data && data.length > 0) {
        // Extract coordinates from Waze response
        const result = onReturnWaze(data[0], address.id);
        // Delay the next request
        await delay(throttleDelayMs);

        return result;
      }
    }
  } catch (error) {
    console.error("Waze geocoding error:", error);
  }

  // Return null if Waze geocoding fails
  return null;
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

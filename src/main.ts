import { Address } from "./common/types/types";

import { Client } from "@googlemaps/google-maps-services-js";
import { addresses } from "./common/consts/full_address_miklatim";

import { geocodeAddressWithWaze } from "./waze-geocoder";
import { geocodeWithGoogle } from "./common/functions";

// Example usage
export async function findCoordinates() {
  console.log("starting geocoding");

  const Geocoder = new Client({});

  for (const address of addresses) {
    try {
      const coordinates = await geocodeWithFallback(address, Geocoder);
      if (coordinates) {
        console.log("coordinates:", coordinates);
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
  console.log("Geocoding data:", data);
  console.log("Geocoding complete!");
}

// Function to process Waze geocoding response
function onReturnWaze(
  coordinates: { lat: number; lon: number } | null,
  addressId: number
): string {
  if (!coordinates)
    throw new Error("Waze response does not contain valid coordinates");
  addresses[addressId].coordinates = {
    lat: coordinates.lat,
    lng: coordinates.lon,
  };
  return `latitude: ${coordinates.lat}, longitude: ${coordinates.lon}`;
}

// Function to geocode an address using the Waze API
async function geocodeWithWaze(address: Address) {
  // Throttle requests to Waze API
  const throttleDelayMs = 350; // Adjust as needed (1 request per second)

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

// Function to perform geocoding with fallback to Google if Waze fails
async function geocodeWithFallback(address: Address, geocoder: Client) {
  const wazeResult = await geocodeWithWaze(address);

  if (wazeResult) {
    return wazeResult;
  } else {
    // Fallback to Google Geocoding
    return await geocodeWithGoogle(address, geocoder);
  }
}

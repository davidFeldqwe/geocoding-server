import { Address } from "../types";
import { Client } from "@googlemaps/google-maps-services-js";
import { onReturn } from "./on-return.function";

// Function to geocode an address using the Google Geocoding API
export async function geocodeWithGoogle(address: Address, geocoder: Client) {
  try {
    const results = await geocoder.geocode({
      params: {
        key: process.env.apikey ?? "REDACTED_KEY", //todo remove this
        address: address.full_address,
        region: "il",
      },
    });
    return onReturn(results, address.id);
  } catch (error) {
    console.error(`Geocoding error for ${address.full_address}: ${error}`);
  }

  // Return null if Google geocoding fails
  return null;
}

import axios from 'axios';

const IL_CENTER_COORDS = { lat: 31.0461, lon: 34.8516 };
const IL_COMPILED_VIEWBOX = '33.38327644404132,34.2795153896776%3B29.395314745725695,35.055000047183896';

const axiosClient = axios.create({
  baseURL: 'https://www.waze.com',
  validateStatus: () => true,
});

async function geocodeAddressWithMozi(query: string) {
  const response = await axiosClient.get(
    'il-SearchServer/mozi',
    {
      params: {
        format: 'PROTO_JSON_FULL',
        ...IL_CENTER_COORDS,
        max_distance_kms: 50000,
        q: query,
      },
    },
  );
  if (response.status === 404) return null; // waze unable to find a place for given query
  const firstVenueUsingWazeNewProvider = response.data.find((entry) => entry.provider === 'wazeAddressNew');
  if (!firstVenueUsingWazeNewProvider) return null; // none of the returned entries from waze satisfies our constraint
  const location = firstVenueUsingWazeNewProvider.venue.location;
  return {
    lat: location.y,
    lon: location.x,
  };
}

async function geocodeAddressWithLivemap(query: string) {
  const response = await axiosClient.get(
    'live-map/api/autocomplete',
    {
      params: {
        q: query,
        v: IL_COMPILED_VIEWBOX,
        lang: 'he-IL',
        exp: '',
      },
    }
  );
  if (!response.data) return null;
  return response.data[0].latLng as { lat: number; lon: number };
}

export async function geocodeAddressWithWaze(query: string) {
  const requestPromises = [
    geocodeAddressWithMozi(query),
    geocodeAddressWithLivemap(query),
  ];
  const coordsResolutions = await Promise.all(requestPromises);
  return coordsResolutions.find(Boolean);
}

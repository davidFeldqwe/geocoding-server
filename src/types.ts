export type Adresses = Address[];

export type Address = {
  "full_address": string;
  id: number;
  coordinates?: {
    lat: number;
    lng: number;
  }
  isGoogle?: boolean;
}


export interface WazeAddress {
  name: string;
  cleanName: string;
  address: string;
  venueId: string;
  latLng: {
    lat: number;
    lng: number;
  };
}
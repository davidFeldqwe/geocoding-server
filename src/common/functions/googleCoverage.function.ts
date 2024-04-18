import axios from "axios";

export async function getTotalResults(searchQuery: string): Promise<number> {
  let totalResults = 0;
  let nextPageToken = "";

  do {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/textsearch/json",
      {
        params: {
          input: searchQuery,
          inputtype: "textquery",
          fields: "place_id",
          key: process.env.apikey,
          pagetoken: nextPageToken,
        },
      }
    );

    totalResults += response.data.candidates.length;
    nextPageToken = response.data.next_page_token;
  } while (nextPageToken);

  return totalResults;
}

import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'
import { addressesWIthCoordinates } from "./addressWIthCoordinates"

const app = new Elysia()
  .use(cors())
  .get("/", () => {
    addressesWIthCoordinates.forEach(obj => {
      if (obj.isGoogle) {
        console.log("googleAPI");
      } else {
        console.log("wazeAPI");
      }
    });

  }).listen(8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);







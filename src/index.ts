import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { findCoordinates } from "./main";

const app = new Elysia()
  .use(cors())
  .get("/", () => {
    findCoordinates();
  })
  .listen(8081);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

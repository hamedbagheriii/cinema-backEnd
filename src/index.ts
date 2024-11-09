import swagger from "@elysiajs/swagger";
import { Elysia, error, t } from "elysia";
import { userPanel } from "./auth/auth";
import { movie } from "./movie/movie";
import { ticket } from "./tickets/ticket";
import { cinema } from "./cinema/cinema";


const app = new Elysia()
  .use(swagger())
  .use(userPanel)
  .use(movie)
  .use(ticket)
  .use(cinema)

.listen(3100);

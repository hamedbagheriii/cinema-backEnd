import swagger from "@elysiajs/swagger";
import { Elysia, error, t } from "elysia";
import { userPanel } from "./auth/auth";


const app = new Elysia()
  .use(swagger())
  .use(userPanel)

.listen(3100);

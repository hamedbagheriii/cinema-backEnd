import swagger from "@elysiajs/swagger";
import { Elysia, error, t } from "elysia";

const app = new Elysia()
  .use(swagger())

  // ! کلی
  .onBeforeHandle(({ body , path , error}) => {
    const typedBody = body as { name : string }; 

    if (typedBody?.name.length === 0 && path !== "/") {
      return error(400, "name is required");
    }
  })

  .post(
    "/data",
    () => {
      return {
        message: "Hello data",
      };
    },
    {   
      // ! در یک روت
      // beforeHandle : ({ body , path , error}) => {
      //   if (path !== "/" && body.name.length === 0) {
      //     return error(400, "name is required");
      //   }
      // },  
      body: t.Object({
        name: t.String(),
      }),
    }
  )
  .post(
    "/popo",
    () => {
      return {
        message: "Hello popo",
      };
    },
    {
      body: t.Object({
        name: t.String(),
      }),
    }
  )

  .listen(3100);

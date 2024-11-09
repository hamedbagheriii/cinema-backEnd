import Elysia, { t } from 'elysia';
import { Prisma } from '../auth/auth';

export const cinema = new Elysia().group('/cinema', (app) => {
  return (
    app

      // ! add cinema
      .post(
        '/add',
        async ({ body: { cinemaName, address, city, province } }) => {
          const cinema = await Prisma.cinema.create({
            data: {
              cinemaName,
              address,
              city,
              province,
            },
          });

          return {
            data: cinema,
            message: 'افزودن سالن با موفقیت انجام شد !',
            success: true,
          };
        },
        {
          body: t.Object({
            cinemaName: t.String(),
            address: t.String(),
            city: t.String(),
            province: t.String(),
          }),
        }
      )

      // ! get cinemas
      .get(
        '/:id?',
        async ({ params: { id } }) => {
          let cinemas;
          if (id) {
            cinemas = await Prisma.cinema.findUnique({
              where: {
                id,
              },
              include: {
                halls: true,
                movies: true,
              },
            });
          } else {
            cinemas = await Prisma.cinema.findMany({
              include: {
                halls: true,
                movies: true,
              },
            });
          }

          return {
            data: cinemas,
            message: 'دریافت سینماها با موفقیت انجام شد !',
            success: true,
          };
        },
        {
          params: t.Object({
            id: t.Optional(t.Number()),
          }),
        }
      )

      // ! ==================== Halls ====================

      // ! add halls
      .post(
        '/halls/add',
        async ({ body: { hallName, maximumRows, cinemaID } }) => {
          const hall = await Prisma.hall.create({
            data: {
              hallName,
              maximumRows,
              cinemaID,
            },
          });

          return {
            data: hall,
            message: 'افزودن سالن با موفقیت انجام شد !',
            success: true,
          };
        },
        {
          body: t.Object({
            hallName: t.String(),
            maximumRows: t.Number(),
            cinemaID: t.Number(),
          }),
        }
      )

      // ! get halls
      .get(
        '/halls/:id?',
        async ({ params: { id } }) => {
          let halls;
          if (id) {
            halls = await Prisma.hall.findUnique({
              where: {
                id,
              },
              include: {
                dates: true,
                cinemaData: true,
              },
            });
          } else {
            halls = await Prisma.hall.findMany({
                include : {
                    cinemaData : true,
                    dates : true
                }
            });
          }

          return {
            data: halls,
            message: 'دریافت سالن ها با موفقیت انجام شد !',
            success: true,
          };
        },
        {
          params: t.Object({
            id: t.Optional(t.Number()),
          }),
        }
      )
  );
});

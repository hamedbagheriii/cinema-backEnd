import Elysia, { t } from 'elysia';
import { Prisma } from '../auth/auth';

export const movie = new Elysia().group('/movie', (app) => {
  return (
    app

      // ! افزودن فیلم
      .post(
        '/add',
        async ({
          body: { movieName, decription, time, price, createdAt, reservedSeats },
        }) => {
          const movie = await Prisma.movies.create({
            data: {
              decription,
              movieName,
              time,
              createdAt,
              reservedSeats,
              price,
            },
          });

          return {
            message: 'فیلم با موفقیت ایجاد شد .',
            data: movie,
            success: true,
          };
        },
        {
          beforeHandle: async ({ body: { movieName }, set }) => {
            const checkMovie = await Prisma.movies.findUnique({
              where: {
                movieName,
              },
            });
            if (checkMovie) {
              set.status = 401;
              return {
                message: 'فیلم با این نام وجود دارد !',
                success: false,
              };
            }
          },
          body: t.Object({
            movieName: t.String(),
            decription: t.String(),
            time: t.String(),
            price: t.String(),
            createdAt: t.String(),
            reservedSeats: t.Number(),
          }),
        }
      )

      // ! دریافت فیلم ها
      .get(
        '/:id?',
        async ({ params: { id } }) => {
          let movies;
          if (id) {
            movies = await Prisma.movies.findUnique({
              where: { id },
            });
          } else {
            movies = await Prisma.movies.findMany();
          }

          return {
            message: `فیلم ها با موفقیت دریافت شدند .`,
            data: { ...movies },
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

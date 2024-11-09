import Elysia, { t } from 'elysia';
import { Prisma } from '../auth/auth';
import { stToArrClass } from '../tickets/stToArr';

// ! dependencies
export const arrNumberClass = new stToArrClass();

export const movie = new Elysia().group('/movie', (app) => {
  return (
    app

      // ! افزودن فیلم
      .post(
        '/add',
        async ({ body: { movieName, decription, time, price, createdAt, cinemaID } }) => {
          const movie = await Prisma.movies.create({
            data: {
              decription,
              movieName,
              time,
              createdAt,
              price,
              cinemas: {
                connect: {
                  id: cinemaID,
                },
              },
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
            cinemaID: t.Number(),
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
              include: {
                cinemas: true,
              },
            });
          } else {
            movies = await Prisma.movies.findMany({
              include: {
                cinemas: true,
              },
            });
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

      // ! دریافت صندلی های رزرو شده
      .get(
        '/resarvedSeats/:movieID/:cinemaID/:hallID',
        async ({ params: { movieID, cinemaID, hallID }, query: { dateEvent } }) => {
          // ! دریافت تیکت های مربوط به فیلم
          const getAllTicket = await Prisma.sessionTicket.findMany({
            where: {
              movieId: movieID,
              movieData: {
                cinemas: {
                  every: {
                    id: cinemaID,
                    halls: {
                      every: {
                        id: hallID,
                        dates: {
                          every: {
                            date: dateEvent,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            include: {
              rows: true,
            },
          });

          // ! تبدیل صندلی های رزرو به آرایه
          let allSeats: any[] = [];
          getAllTicket.forEach((item: any) => {
            item.rows.forEach(async (row: any) => {
              allSeats.push({
                row: row.row,
                selectedSeats: await arrNumberClass.stToArr(row.selectedSeats),
              });
            });
          });

          return {
            data: allSeats,
            success: true,
            message: 'صندلی های رزرو با موفقیت دریافت شدند !',
          };
        },
        {
          params: t.Object({
            movieID: t.Number(),
            cinemaID: t.Number(),
            hallID: t.Number(),
          }),
          query: t.Object({
            dateEvent: t.Date(),
          }),
        }
      )
  );
});

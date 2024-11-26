import Elysia, { t } from 'elysia';
import { Prisma } from '../auth/auth';
import { imgAwcClass } from '../imageAWS/upIMG';

export const cinema = new Elysia().group('/cinema', (app) => {
  return (
    app

      // ! add cinema
      .post(
        '/add',
        async ({ body: { cinemaName, address, city, province, image }, set }) => {
          //  upload image to s3 =>
          const movieIMG = await imgAwcClass.uploadImage(image, 'cinemaIMG');
          if (!movieIMG.success) {
            set.status = 400;
            return {
              ...movieIMG,
            };
          }

          const cinema = await Prisma.cinema.create({
            data: {
              cinemaName,
              address,
              city,
              province,
              image: {
                create: {
                  name: cinemaName,
                  url: movieIMG.fileUrl || '',
                },
              },
            },
            include: {
              movies: true,
              image: true,
            },
          });

          return {
            data: cinema,
            message: 'افزودن سینما با موفقیت انجام شد !',
            success: true,
          };
        },
        {
          beforeHandle: async ({ body: { image }, set }) => {
            // check image =>
            if (!image) {
              set.status = 400;
              return {
                success: false,
                message: 'عکس انتخاب نشده است !',
              };
            }
          },
          body: t.Object({
            cinemaName: t.String(),
            address: t.String(),
            city: t.String(),
            province: t.String(),
            image: t.File(),
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
                movies: {
                  include : {
                    movie : {
                      include : {
                        image : true
                      }
                    }
                  }
                },
                image: true,
                dates: true,
              },
            });
          } else {
            cinemas = await Prisma.cinema.findMany({
              include: {
                halls: true,
                movies: true,
                image: true,
                dates: true,
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

      // ! add movies to cinema
      .post(
        '/UPMovies/:id',
        async ({ params: { id }, body: { movies } }) => {
            const res = await Prisma.moviecinema.createMany({
              data :  movies.map((movie: number) => ({ movieId: movie, cinemaID: id }))
            })
           

          return {
            res,
            message: 'افزودن فیلم به سینما با موفقیت انجام شد !',
            success: true,
          };
        },
        {
          params: t.Object({
            id: t.Number(),
          }),
          body: t.Object({
            movies: t.Array(t.Number()),
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
                cinemaData: true,
              },
            });
          } else {
            halls = await Prisma.hall.findMany({
              include: {
                cinemaData: true,
              },
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

      // ! ==================== Dates ====================

      // // ! add dates
      // .post(
      //   '/dates/add',
      //   async ({ body: { date, cinemaID } }) => {
      //     const dateRecord = await Prisma.date.create({
      //       data: {
      //         date,
      //         cinemaID,
      //       },
      //     });

      //     return {
      //       data: dateRecord,
      //       message: 'افزودن تاریخ با موفقیت انجام شد !',
      //       success: true,
      //     };
      //   },
      //   {
      //     body: t.Object({
      //       date: t.Date(),
      //       cinemaID: t.Number(),
      //     }),
      //   }
      // )

      // // ! get dates
      // .get(
      //   '/dates',
      //   async ({ query: { cinemaID } }) => {
      //     const dates = await Prisma.date.findMany({
      //       where: {
      //         cinemaID,
      //       },
      //       include: {
      //         dateTimes: true,
      //         cinemaData: true,
      //       },
      //     });

      //     return {
      //       data: dates,
      //       message: 'دریافت تاریخ ها با موفقیت انجام شد !',
      //       success: true,
      //     };
      //   },
      //   {
      //     query: t.Object({
      //       cinemaID: t.Number(),
      //     }),
      //   }
      // )

      // ! ==================== Date Times ====================

      // // ! add Time
      // .post(
      //   '/dateTime/add',
      //   async ({ body: { Time, date } }) => {
      //     const newTime = await Prisma.dateTime.create({
      //       data: {
      //         Time,
      //         date,
      //       },
      //     });

      //     return {
      //       data: newTime,
      //       message: 'تایم مورد نظر اضافه شد !',
      //       success: true,
      //     };
      //   },
      //   {
      //     beforeHandle: async ({ body: { Time, date } }) => {
      //       const checkDate = await Prisma.date.findUnique({
      //         where: {
      //           date,
      //         },
      //       });

      //       if (!checkDate) {
      //         return {
      //           message: 'روز مورد نظر یافت نشد !',
      //           success: false,
      //         };
      //       }
      //     },
      //     body: t.Object({
      //       Time: t.String(),
      //       date: t.Date(),
      //     }),
      //   }
      // )

      // // ! get Times
      // .get(
      //   '/dateTime/:id?',
      //   async ({ params: { id } }) => {
      //     let dateTimes;
      //     if (id) {
      //       dateTimes = await Prisma.dateTime.findMany({
      //         where: { id },
      //       });
      //     }
      //     dateTimes = await Prisma.dateTime.findMany();

      //     return {
      //       data: dateTimes,
      //       message: 'تایم مورد نظر اضافه شد !',
      //       success: true,
      //     };
      //   },
      //   {
      //     params: t.Object({
      //       id: t.Optional(t.Number()),
      //     }),
      //   }
      // )
  );
});

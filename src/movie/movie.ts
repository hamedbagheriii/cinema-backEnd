import Elysia, { t } from 'elysia';
import { auth, Prisma } from '../auth/auth';
import { stToArrClass } from '../utils/stToArr';
import { imgAwcClass } from '../imageAWS/upIMG';
import { hasAccessClass } from '../auth/hasAccess';

// ! dependencies
export const arrNumberClass = new stToArrClass();

export const movie = new Elysia().group('/movie', (app) => {
  return (
    app

      .state('checkToken', null as null | any)

      // ! get Movies
      .get(
        '/:id?',
        async ({ params: { id } }) => {
          let movies;
          if (id) {
            movies = await Prisma.movies.findUnique({
              where: { id },
              include: {
                cinemaData: {
                  include: {
                    cinema: {
                      include: {
                        halls: true,
                        image: true,
                      },
                    },
                  },
                },
                image: true,
              },
            });
          } else {
            movies = await Prisma.movies.findMany({
              include: {
                cinemaData: {
                  include: {
                    cinema: {
                      include: {
                        halls: true,
                        image: true,
                      },
                    },
                  },
                },
                image: true,
              },
            });
          }

          return {
            message: `فیلم ها با موفقیت دریافت شدند .`,
            data: movies,
            success: true,
          };
        },
        {
          params: t.Object({
            id: t.Optional(t.Number()),
          }),
        }
      )

      // !  get resarved seats
      .get(
        '/resarvedSeats/:movieID/:cinemaID/:hallID/:dateEvent/:Time',
        async ({ params: { movieID, cinemaID, hallID, dateEvent, Time } }) => {
          // ! دریافت تیکت های مربوط به فیلم
          const getAllTicket = await Prisma.sessionticket.findMany({
            where: {
              movieId: movieID,
              cinemaID,
              hallID,
              date: dateEvent,
              Time,
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
            dateEvent: t.Date(),
            Time: t.String(),
          }),
        }
      )

      // ! get image for slider
      .get('/slider', async () => {
        const sliderIMG = await Prisma.images.findMany({
          where: {
            movieId: null,
            cinemaID: null,
          },
        });
        return {
          data: sliderIMG,
          message: 'عکس با موفقیت دریافت شد !',
          success: true,
        };
      })

      // ! ==================== need access ====================

      // ! check Token validate
      .guard({
        headers: t.Object({
          authorization: t.String(),
        }),
      })
      .onBeforeHandle(async ({ headers: { authorization }, store, set }) => {
        const checkToken = await auth.checkToken((authorization as string) || '');
        if (checkToken !== null) {
          store.checkToken = checkToken;
        } else {
          return {
            message: 'توکن اشتباه است !',
            success: false,
          };
        }

        // main access control for role api =>
        const checkUserRole = hasAccessClass.hasAccess(
          'get-movie',
          checkToken.userData.roles,
          set
        );
        if ((await checkUserRole) !== true) return checkUserRole;
      })

      // ! add Movie
      .post(
        '/add',
        async ({
          body: { movieName, decription, time, price, createdAt, image },
          set,
        }) => {
          //  upload image to s3 =>
          const movieIMG = await imgAwcClass.uploadImage(image, 'movieIMG');
          if (!movieIMG.success) {
            set.status = 400;
            return {
              ...movieIMG,
            };
          }

          const movie = await Prisma.movies.create({
            data: {
              decription,
              movieName,
              time,
              createdAt,
              price: Number(price),
              image: {
                create: {
                  name: movieName,
                  url: movieIMG.fileUrl || '',
                },
              },
            },
            include: {
              image: true,
            },
          });

          return {
            message: 'فیلم با موفقیت ایجاد شد .',
            data: movie,
            success: true,
          };
        },
        {
          beforeHandle: async ({
            body: { movieName, image },
            set,
            store: { checkToken },
          }) => {
            const checkUserRole = hasAccessClass.hasAccess(
              'add-movie',
              checkToken.userData.roles,
              set
            );
            if ((await checkUserRole) !== true) return checkUserRole;

            // check image =>
            if (!image) {
              set.status = 400;
              return {
                success: false,
                message: 'عکس انتخاب نشده است !',
              };
            }

            // check movie =>
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
            image: t.File(),
          }),
        }
      )

      // ! ==================== slider ====================

      // ! add image for slider
      .post(
        '/slider/add',
        async ({ body: { movieName, image }, set }) => {
          //  upload image to s3 =>
          const movieIMG = await imgAwcClass.uploadImage(image, 'movieIMG');
          if (!movieIMG.success) {
            set.status = 400;
            return {
              ...movieIMG,
            };
          }

          const sliderIMG = await Prisma.images.create({
            data: {
              name: movieName,
              url: movieIMG.fileUrl || '',
            },
          });

          return {
            data: sliderIMG,
            message: 'عکس با موفقیت اضافه شد !',
            success: true,
          };
        },
        {
          beforeHandle: async ({
            body: { movieName, image },
            set,
            store: { checkToken },
          }) => {
            const checkUserRole = hasAccessClass.hasAccess(
              'add-slider',
              checkToken.userData.roles,
              set
            );
            if ((await checkUserRole) !== true) return checkUserRole;

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
            movieName: t.String(),
            image: t.File(),
          }),
        }
      )
  );
});

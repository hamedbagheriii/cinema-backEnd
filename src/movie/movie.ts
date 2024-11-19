import Elysia, { t } from 'elysia';
import { Prisma } from '../auth/auth';
import { stToArrClass } from '../utils/stToArr';
import { imgAwcClass } from '../imageAWS/upIMG';

// ! dependencies
export const arrNumberClass = new stToArrClass();

export const movie = new Elysia().group('/movie', (app) => {
  return (
    app

      // ! add Movie
      .post(
        '/add',
        async ({ body: { movieName, decription, time, price, createdAt, cinemaID , image } , set }) => {
          //  upload image to s3 =>
          const movieIMG = await imgAwcClass.uploadImage(image , 'movieIMG');
          if (!movieIMG.success) {
            set.status = 400;
            return {
              ...movieIMG
            };
          }

          const movie = await Prisma.movies.create({
            data: {
              decription,
              movieName,
              time,
              createdAt,
              price,
              cinemaID: cinemaID || null,
              image : {
                create : {
                  name : movieName,
                  url : movieIMG.fileUrl || '',
                }
              },
            },
            include : {
              image : true
            }
          });

          return {
            message: 'فیلم با موفقیت ایجاد شد .',
            data: movie,
            success: true,
          };
        },
        {
          beforeHandle: async ({ body: { movieName , image }, set }) => {
            // check image =>
            if (!image) {
              set.status = 400;
              return {
                success : false,
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
            price: t.Number(),
            createdAt: t.String(),
            cinemaID: t.Optional(t.Number()),
            image : t.File()
          }),
        }
      )

      // ! get Movies
      .get(
        '/:id?',
        async ({ params: { id } }) => {
          let movies;
          if (id) {
            movies = await Prisma.movies.findUnique({
              where: { id },
              include: {
                cinemaData: true,
              },
            });
          } else {
            movies = await Prisma.movies.findMany({
              include: {
                cinemaData: true,
                image : true
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

      // !  get resarved seats
      .get(
        '/resarvedSeats/:movieID/:cinemaID/:hallID',
        async ({ params: { movieID, cinemaID, hallID }, query: { dateEvent } }) => {
          // ! دریافت تیکت های مربوط به فیلم
          const getAllTicket = await Prisma.sessionTicket.findMany({
            where: {
              movieId: movieID,
              cinemaID,
              hallID,
              date: dateEvent,
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

import Elysia, { t } from 'elysia';
import { auth, Prisma } from '../auth/auth';
import { arrNumberClass } from '../movie/movie';

export const ticket = new Elysia().group('/ticket', (app) => {
  return (
    app
      .state('checkToken', null as null | any)

      // ! چک کردن توکن کاربر
      .onBeforeHandle(async ({ headers: { authorization }, store, set }) => {
        const checkToken = await auth.checkToken((authorization as string) || '');
        if (checkToken !== null) {
          store.checkToken = checkToken;
        } else {
          store.checkToken = null;
          set.status = 404;
          return { message: 'توکن اشتباه است !', success: false };
        }
      })

      // ! وجود توکن اجباری
      .guard({
        headers: t.Object({
          authorization: t.String(),
        }),
      })

      // ! افزودن تیکت
      .post(
        '/add',
        async ({ body: { ticket, email, movieId, rows, useTicket , cinemaID , hallID , dateEvent } }) => {
          const addTicket = await Prisma.sessionTicket.create({
            data: {
              ticket,
              email,
              movieId,
              useTicket,
              rows: {
                create: rows.map((item: any) => {
                  return {
                    row: item.row,
                    selectedSeats: item.selectedSeats.toString(),
                  };
                }),
              },
              cinemaID,
              hallID,
              date : dateEvent,
            },
            include: {
              rows: true,
            },
          });

          return { addTicket };
        },
        {
          body: t.Object({
            ticket: t.Number(),
            email: t.String(),
            movieId: t.Number(),
            rows: t.Array(
              t.Object({ selectedSeats: t.Array(t.Number()), row: t.Number() })
            ),
            useTicket: t.Boolean(),
            cinemaID: t.Number(),
            hallID: t.Number(),
            dateEvent: t.Date(),
          }),
        }
      )

      // ! دریافت تیکت ها
      .get('/', async ({ store: { checkToken } }) => {
        const tickets = await Prisma.sessionTicket.findMany({
          where: {
            email: checkToken.email,
          },
          include: {
            movieData: true,
            rows: true,
            cinemaData: true,
            hallData: true,
            dateEvent: true,
          },
        });

        // ! تبدیل صندلی های رزرو به آرایه
        tickets.forEach((item: any) => {
          item.rows.forEach(async (row: any) => {
            row.selectedSeats = await arrNumberClass.stToArr(row.selectedSeats);
          });
        });

        return {
          data: tickets,
          success: true,
          message: 'تیکت ها با موفقیت دریافت شدند !',
        };
      })
  );
});

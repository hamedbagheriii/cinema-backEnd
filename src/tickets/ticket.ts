import Elysia, { t } from 'elysia';
import { auth, Prisma } from '../auth/auth';

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

      // ! افزودن صندلی رزرو
      .post(
        '/add',
        async ({ body: { ticket, email, movieId, rows, useTicket } }) => {
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
          }),
        }
      )

      // ! دریافت صندلی های رزرو شده
      .get(
        '/getAll/:movieID',
        async ({ params: { movieID } }) => {
          // ! get all tickets
          const getAllTicket = await Prisma.sessionTicket.findMany({
            where: {
              movieId: movieID,
            },
            include: {
              rows: true,
            },
          });

          // ! seats to array of string
          let array_String_Seats: any[] = [];
          getAllTicket.forEach((item: any) => {
            item.rows.forEach((row: any) => {
              array_String_Seats.push({
                row : row.row,
                selectedSeats : [...row.selectedSeats.split(',')],
              });
            });
          });

          // ! seats to array of number
          let result: any[] = [];
          array_String_Seats.forEach((item: any) => {
            let array_Number_Seats : any[] = [];
            item.selectedSeats.map((seat: any) => array_Number_Seats.push(Number(seat)));

            result.push({
              seats : array_Number_Seats,
              row : item.row,
            });
          });

  

          return {
            data: result,
            success: true,
            message: 'صندلی های رزرو با موفقیت دریافت شدند !',
          };
        },
        {
          params: t.Object({
            movieID: t.Number(),
          }),
        }
      )
  );
});

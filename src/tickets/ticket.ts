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

      .post('/add', async ({ body: { ticket, userId, movieId, rowID , selectedSeats , useTicket} }) => {
        const addRow = await Prisma.row.create({
            data : {
                rowID ,
                selectedSeats,
            }
        }).then(async (res : any)=>{
            const addTicket = await Prisma.sessionTicket.create({
                data : {
                    ticket,
                    userId,
                    movieId,
                    useTicket,
                    rowID : 5, 
                }
            })

            return {res , addTicket}
        })
      }, {
        body: t.Object({
          ticket: t.Number(),
          userId: t.String(),
          movieId: t.Number(),
          rowID: t.Number(),
          useTicket : t.Boolean(),
          selectedSeats : t.String()
        }),
      })
  );
});

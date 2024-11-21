import Elysia, { t } from 'elysia';
import { auth, Prisma } from '../auth/auth';
import { arrNumberClass } from '../movie/movie';
import { wallets } from '../wallet/wallet';

export const ticket = new Elysia().group('/ticket', (app) => {
  return (
    app
      .state('checkToken', null as null | any)

      // ! check Token validate
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

      // ! Token is mandatory
      .guard({
        headers: t.Object({
          authorization: t.String(),
        }),
      })

      // ! add tickets
      .post(
        '/add',
        async ({
          body: {
            ticket,
            email,
            movieId,
            rows,
            useTicket,
            cinemaID,
            hallID,
            dateEvent,
            Time,
            price
          },
          store : {checkToken}
        }) => {
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
              date: dateEvent,
              Time,
              price,
            },
            include: {
              rows: true,
            },
          });

          // ! decrement user wallet amount
          const walletDec =  await Prisma.wallet.update({
            where : {
              email : checkToken.userData.email
            },
            data : {
              Amount : {
                decrement : price
              }
            }
          })
          

          return { addTicket, success: true, message: 'تیکت با موفقیت افزوده شد !' };
        },
        {
          beforeHandle : async ({store : {checkToken} , body : {price , dateEvent , cinemaID} , set})=>{
            const WalletData : any = await Prisma.wallet.findUnique({
              where : {
                email : checkToken.userData.email
              }
            });
            const date = await Prisma.date.findUnique({
              where : {
                date : dateEvent
              }
            });

            if(WalletData.Amount < price){
              set.status = 400;
              return {
                message : 'مبلغ موجودی کیف پول شما کافی نمیباشد .',
                success : false,
              }
            }
            console.log(date);
            
            if (!date) {
              const newDate = await Prisma.date.create({
                data : {
                  date : dateEvent,
                  cinemaID
                }
              })
            }
          },
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
            Time: t.String(),
            price : t.Number()
          }),
        }
      )

      // ! get tickets
      .get(
        '/:ticket?',
        async ({ store: { checkToken }, params: { ticket } }) => {
          let tickets;
          const include = {
            movieData: true,
            rows: true,
            cinemaData: true,
            hallData: true,
          };

          if (ticket) {
            tickets = await Prisma.sessionTicket.findMany({
              where: {
                email: checkToken.email,
                ticket: ticket,
              },
              include,
            });
          } else {
            tickets = await Prisma.sessionTicket.findMany({
              where: {
                email: checkToken.email,
              },
              include,
            });
          }

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
        },
        {
          params: t.Object({
            ticket: t.Optional(t.Number()),
          }),
        }
      )

      // ! update useTicket
      .get(
        '/up-useTicket/:ticket',
        async ({ params: { ticket }, store: { checkToken } }) => {
          const useTicket = await Prisma.sessionTicket.update({
            where: {
              ticket,
              email: checkToken.email,
            },
            data: {
              useTicket: true,
            },
          });

          return {
            message: 'تیکت با موفقیت استفاده شد .',
            success: true,
            useTicket,
          };
        },
        {
          beforeHandle: async ({ params: { ticket }, store: { checkToken } }) => {
            const isTicket = await Prisma.sessionTicket.findUnique({
              where: {
                ticket,
                email: checkToken.email,
              },
            });

            if (!isTicket) {
              return {
                success: false,
                message: 'تیکت معبتر نمی باشد !',
              };
            } else if (isTicket.useTicket) {
              return {
                success: false,
                message: 'تیکت مورد نظر استفاده شده است !',
              };
            }
          },
          params: t.Object({
            ticket: t.Number(),
          }),
        }
      )
  );
});

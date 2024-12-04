import Elysia, { t } from 'elysia';
import { auth, Prisma } from '../auth/auth';
import { arrNumberClass } from '../movie/movie';
import { wallets } from '../wallet/wallet';
import { hasAccessClass } from '../auth/hasAccess';
import moment from 'moment';

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
            price,
          },
          store: { checkToken },
        }) => {
          const addTicket = await Prisma.sessionticket.create({
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
          const walletDec = await Prisma.wallet.update({
            where: {
              email: checkToken.userData.email,
            },
            data: {
              Amount: {
                decrement: price,
              },
            },
          });

          return { addTicket, success: true, message: 'تیکت با موفقیت افزوده شد !' };
        },
        {
          beforeHandle: async ({
            store: { checkToken },
            body: { price, dateEvent, cinemaID },
            set,
          }) => {
            const WalletData: any = await Prisma.wallet.findUnique({
              where: {
                email: checkToken.userData.email,
              },
            });
            const date = await Prisma.date.findUnique({
              where: {
                date: dateEvent,
              },
            });
            if (!date) {
              const newDate = await Prisma.date.create({
                data: {
                  date: dateEvent,
                  cinemaID,
                },
              });
            }

            if (WalletData.Amount < price) {
              set.status = 400;
              return {
                message: 'مبلغ موجودی کیف پول شما کافی نمیباشد .',
                success: false,
              };
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
            price: t.Number(),
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
            tickets = await Prisma.sessionticket.findMany({
              where: {
                email: checkToken.email,
                ticket: ticket,
              },
              include,
            });
          } else {
            tickets = await Prisma.sessionticket.findMany({
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
          const useTicket = await Prisma.sessionticket.update({
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
          beforeHandle: async ({ params: { ticket }, store: { checkToken }, set }) => {
            const isTicket = await Prisma.sessionticket.findUnique({
              where: {
                ticket,
                email: checkToken.email,
              },
            });

            if (!isTicket) {
              set.status = 404;
              return {
                success: false,
                message: 'تیکت معبتر نمی باشد !',
              };
            } else if (isTicket.useTicket) {
              set.status = 403;
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

      // ! ============================= admin dahsboard =============================

      // ! get Income for admin dashboard
      .get(
        '/getIncome',
        async () => {
          let income: any[] = await Prisma.sessionticket.findMany();

          // filter by dates
          let todayIncome = income.filter(
            (t) => t.date >= new Date(new Date().setDate(new Date().getDay()))
          );
          let monthlyIncome = income.filter(
            (t) => t.date >= new Date(new Date().setMonth(new Date().getMonth() - 1))
          );
          let yearlyIncome = income.filter(
            (t) =>
              t.date >= new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          );

          // tickets length
          const tickets_Length = [
            todayIncome.length || 0,
            monthlyIncome.length || 0,
            yearlyIncome.length || 0,
          ];

          // chart data
          let months = [
            { month: 1, income: 0 },
            { month: 2, income: 0 },
            { month: 3, income: 0 },
            { month: 4, income: 0 },
            { month: 5, income: 0 },
            { month: 6, income: 0 },
            { month: 7, income: 0 },
            { month: 8, income: 0 },
            { month: 9, income: 0 },
            { month: 10, income: 0 },
            { month: 11, income: 0 },
            { month: 12, income: 0 },
          ];
          const chartData = yearlyIncome.map((t) => {
            return { month: moment(t.date).month() + 1, price: t.price };
          });
          chartData.map((t: any) => {
            months[t.month - 1].income += t.price;
          });

          // math and show income
          if (income.length > 0) {
            todayIncome = await todayIncome
              .map((t) => t.price)
              .reduce((a, b) => {
                return a + b;
              });
            monthlyIncome = await monthlyIncome
              .map((t) => t.price)
              .reduce((a, b) => {
                return a + b;
              });
            yearlyIncome = await yearlyIncome
              .map((t) => t.price)
              .reduce((a, b) => {
                return a + b;
              });

            return {
              message: 'درآمد با موفقیت دریافت شد !',
              income: {
                todayIncome,
                monthlyIncome,
                yearlyIncome,
              },
              tickets: {
                today: tickets_Length[0],
                month: tickets_Length[1],
                year: tickets_Length[2],
              },
              chart: months,
              success: true,
            };
          }

          return {
            message: 'درآمد با موفقیت دریافت شد !',
            prices: 0,
            tickets: {
              today: tickets_Length[0],
              month: tickets_Length[1],
              year: tickets_Length[2],
            },
            chart: months,
            success: true,
          };
        },
        {
          beforeHandle: async ({ store: { checkToken }, set }) => {
            const checkUserRole = hasAccessClass.hasAccess(
              'get-income',
              checkToken.userData.roles,
              set
            );
            if ((await checkUserRole) !== true) return checkUserRole;
          },
        }
      )
  );
});

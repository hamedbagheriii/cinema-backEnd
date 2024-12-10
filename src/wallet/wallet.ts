import Elysia, { t } from 'elysia';
import { auth, Prisma } from '../auth/auth';
import { hasAccessClass } from '../auth/hasAccess';

export const wallets = new Elysia().group('/wallet', (app) => {
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

      // ! get User wallet
      .get('/user', async ({ store: { checkToken } }) => {
        const wallet = await Prisma.wallet.findUnique({
          where: {
            email: checkToken.userData.email,
          },
        });

        return {
          message: 'کیف پول با موفقیت دریافت شد !',
          wallet,
          success: true,
        };
      })

      // ! increment user wallet amount
      .put(
        '/user/increment',
        async ({ store: { checkToken }, body: { amount } }) => {
          const wallet = await Prisma.wallet.update({
            where: {
              email: checkToken.userData.email,
            },
            data: {
              Amount: {
                increment: amount,
              },
            },
          });

          return {
            message: 'موجودی کیف پول با موفقیت افزایش یافت  . ',
            wallet,
            success: true,
          };
        },
        {
          body: t.Object({
            amount: t.Number(),
          }),
        }
      )

      // ! ==================== need access ====================
      .onBeforeHandle(async ({ store: { checkToken }, set }) => {
        const checkUserRole = hasAccessClass.hasAccess(
          'get-wallets',
          checkToken.userData.roles,
          set
        );
        if ((await checkUserRole) !== true) return checkUserRole;
      })

      // ! get all wallet
      .get(
        '/all/:id?',
        async ({ params: { id } }) => {
          let wallets: any;
          if (id) {
            wallets = await Prisma.wallet.findUnique({
              where: {
                id,
              },
              include: {
                userData: true,
              },
            });

            wallets.userData.password = null;
          } else {
            wallets = await Prisma.wallet.findMany({
              include: {
                userData: true,
              },
            });

            wallets.map((t: any) => {
              t.userData.password = null;
            });
          }

          return {
            message: 'کیف پول ها با موفقیت دریافت شدند !',
            wallets,
            success: true,
          };
        },
        {
          params: t.Object({
            id: t.Optional(t.String()),
          }),
        }
      )

      // ! update wallet with admin
      .put('/user/update', async ({ body: { email, Amount }, set }) => {
        const wallet = await Prisma.wallet.update({
          where: {
            email,
          },
          data: {
            Amount,
          },
        });

        return {
          message: 'کیف پول با موفقیت ویرایش شد !',
          wallet,
          success: true,
        };
      },{
        beforeHandle: async ({ store: { checkToken }, set }) => {
          const checkUserRole = hasAccessClass.hasAccess(
            'edit-wallets',
            checkToken.userData.roles,
            set
          );
          if ((await checkUserRole) !== true) return checkUserRole;
        },
        body: t.Object({
          email: t.String(),
          Amount: t.Number(),
        }), 
      })
  );
});

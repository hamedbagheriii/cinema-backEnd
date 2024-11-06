import { PrismaClient, User } from '@prisma/client';
import Elysia, { error, t } from 'elysia';
import { authClass } from './isUser';

export const Prisma = new PrismaClient();
const auth = new authClass();

export const userPanel = new Elysia().group('/auth', (app) => {
  return (
    app
      .state('isUser', false)
      .state('userData', null as null | User)

      // ! چک کردن وجود کاربر و رمز عبور
      .onBeforeHandle(async ({ body, store }) => {
        const bodyType = body as { email: string; password: string };
        const isUserClass = await auth.isUser(bodyType.email || undefined);
        store.isUser = isUserClass ? true : false;

        if (
          isUserClass &&
          (await Bun.password.verify(bodyType.password, isUserClass.password))
        ) {
          store.userData = isUserClass || null;
        } else {
          store.userData = null;
        }
      })

      // ! ثبت نام کاربر
      .post(
        'sign-up',
        async ({
          body: { email, password, fristName, lastName },
          set,
          store: { isUser },
        }) => {
          if (isUser) {
            set.status = 401;
            return { message: 'کاربر قبلا ثبت نام کرده است !', success: false };
          } else {
            const user = await Prisma.user.create({
              data: {
                email,
                lastName,
                fristName,
                password: await Bun.password.hash(password),
              },
            });

            return {
              message: 'کاربر با موفقیت ثبت نام شد !',
              data: { ...user, password: null },
              success: true,
            };
          }
        },
        {
          body: t.Object({
            email: t.String(),
            password: t.String(),
            fristName: t.String(),
            lastName: t.String(),
          }),
        }
      )

      // ! ورود کاربر
      .post(
        'sign-in',
        async ({ store: { userData } }) => {
          return await Prisma.sessionToken
            .deleteMany({
              where: {
                userId: userData?.id,
              },
            })
            .then(async () => {
              const key = crypto.randomUUID();
              const token = key;

              await Prisma.sessionToken.create({
                data: {
                  token,
                  userId: userData?.id || '',
                },
              });

              return {
                message: 'کاربر با موفقیت وارد شد !',
                token,
                success: true,
              };
            });
        },
        {
          beforeHandle: async ({ store: { userData }, set }) => {
            if (userData == null) {
              set.status = 401;
              return {
                message: 'ایمیل یا رمز عبور اشتباه است !',
                success: false,
              };
            }
          },
          body: t.Object({
            email: t.String(),
            password: t.String(),
          }),
        }
      )

    // // ! یافتن کاربر
    // .get(
    //   'user',
    //   async ({ headers: { authorization }, set }) => {
    //     const checkToken = await Prisma.sessionToken.findMany({
    //       where: {
    //         token: authorization,
    //       },
    //       include: {
    //         userData: {
    //           include: {
    //             posts: true,
    //           },
    //         },
    //       },
    //     });
    //     if (!checkToken.length) {
    //       set.status = 401;
    //       return { message: 'توکن اشتباه است !', success: false };
    //     } else {
    //       return {
    //         message: 'کاربر با موفقیت یافت شد !',
    //         success: true,
    //         data: { ...checkToken[0].userData, password: null },
    //       };
    //     }
    //   },
    //   {
    //     headers: t.Object({
    //       authorization: t.String(),
    //     }),
    //   }
    // )

    // // ! خروج کاربر
    // .get(
    //   'logout',
    //   async ({ headers: { authorization } }) => {
    //     await Prisma.sessionToken.deleteMany({
    //       where: {
    //         toekn: authorization,
    //       },
    //     });

    //     return { message: 'کاربر با موفقیت خارج شد !', success: true };
    //   },
    //   {
    //     headers: t.Object({
    //       authorization: t.String(),
    //     }),
    //   }
    // )

    // // ! ویرایش کاربر
    // .put(
    //   'update',
    //   async ({
    //     body: { email, fristName, lastName },
    //     headers: { authorization },
    //     set,
    //   }) => {
    //     const checkToken = await Prisma.section.findMany({
    //       where: {
    //         token: authorization,
    //       },
    //       include: {
    //         userData: true,
    //       },
    //     });

    //     if (!checkToken.length) {
    //       set.status = 401;
    //       return { message: 'توکن اشتباه است !', success: false };
    //     } else {
    //       const user = await Prisma.user.update({
    //         where: {
    //           id: checkToken[0].userId,
    //         },
    //         data: {
    //           email,
    //           lastName,
    //           fristName,
    //         },
    //       });

    //       return {
    //         message: 'کاربر با موفقیت ویرایش شد !',
    //         data: { ...user, password: null },
    //         success: true,
    //       };
    //     }
    //   },
    //   {
    //     body: t.Object({
    //       email: t.String(),
    //       fristName: t.String(),
    //       lastName: t.String(),
    //     }),
    //     headers: t.Object({
    //       authorization: t.String(),
    //     }),
    //   }
    // )

    // // ! ویرایش رمز عبور کاربر
    // .put(
    //   'update/password',
    //   async ({ body: { u_password, o_password }, headers: { authorization }, set }) => {
    //     const checkToken = await Prisma.section.findMany({
    //       where: {
    //         token: authorization,
    //       },
    //       include: {
    //         userData: true,
    //       },
    //     });

    //     // ! بررسی رمز عبور قبلی
    //     const checkPassword = await Bun.password.verify(
    //       o_password,
    //       checkToken[0].userData.password
    //     );

    //     if (!checkToken.length || !checkPassword) {
    //       set.status = 401;
    //       return { message: 'توکن یا رمز عبور اشتباه است !', success: false };
    //     } else {
    //       const user = await Prisma.user.update({
    //         where: {
    //           id: checkToken[0].userId,
    //         },
    //         data: {
    //           password: await Bun.password.hash(u_password),
    //         },
    //       });

    //       return {
    //         message: 'رمز عبور کاربر با موفقیت ویرایش شد !',
    //         data: { ...user, password: null },
    //         success: true,
    //       };
    //     }
    //   },
    //   {
    //     body: t.Object({
    //       u_password: t.String(),
    //       o_password: t.String(),
    //     }),
    //     headers: t.Object({
    //       authorization: t.String(),
    //     }),
    //   }
    // )
  );
});

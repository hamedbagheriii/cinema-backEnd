import { PrismaClient, user } from '@prisma/client';
import Elysia, { error, t } from 'elysia';
import { authClass } from './isUser';

// ! dependencies
export const Prisma = new PrismaClient();
export const auth = new authClass();

// ! body validation
const body = t.Object({
  email: t.String(),
  password: t.String({
    minLength: 6,
    error: 'رمز عبور باید حداقل 6 کاراکتر داشته باشد !',
  }),
  fristName: t.String({
    minLength: 2,
    error: 'نام باید حداقل 2 کاراکتر داشته باشد !',
  }),
  lastName: t.String({
    minLength: 3,
    error: 'نام خانوادگی باید حداقل 3 کاراکتر داشته باشد !',
  }),
});

export const userPanel = new Elysia().group('/auth', (app) => {
  return (
    app
      .state('isUser', false)
      .state('userData', null as null | user)
      .state('checkToken', null as null | any)

      // ! check User validate
      .onBeforeHandle(async ({ body, store, path }) => {
        if (path === '/auth/sign-in' || path === '/auth/sign-up') {
          const bodyType = body as { email: string; password: string };
          const isUserClass = await auth.isUser(bodyType.email);
          store.isUser = isUserClass ? true : false;

          if (
            isUserClass &&
            (await Bun.password.verify(bodyType.password, isUserClass.password))
          ) {
            store.userData = isUserClass || null;
          } else {
            store.userData = null;
          }
        }
      })

      // ! check Token validate
      .onBeforeHandle(async ({ headers: { authorization }, store }) => {
        const checkToken = await auth.checkToken((authorization as string) || '');
        if (checkToken !== null) {
          store.checkToken = checkToken;
        } else {
          store.checkToken = null;
        }
      })

      // ! sign up
      .post(
        'sign-up',
        async ({ body: { email, password, fristName, lastName } }) => {
          const user = await Prisma.user.create({
            data: {
              email,
              lastName,
              fristName,
              password: await Bun.password.hash(password),
              wallet : {
                create : {}
              }
            }
          });

          return {
            message: 'کاربر با موفقیت ثبت نام شد !',
            data: { ...user, password: null },
            success: true,
          };
        },
        {
          beforeHandle: async ({ store: { isUser }, set }) => {
            if (isUser) {
              set.status = 401;
              return { message: 'کاربر قبلا ثبت نام کرده است !', success: false };
            }
          },
          body,
        }
      )

      // ! sign in
      .post(
        'sign-in',
        async ({ store: { userData } }) => {
          return await Prisma.sessiontoken
            .deleteMany({
              where: {
                userId: userData?.id,
              },
            })
            .then(async () => {
              const key = crypto.randomUUID();
              const token = key;

              await Prisma.sessiontoken.create({
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
          beforeHandle: async ({ store: { userData, isUser }, set }) => {
            if (!isUser) {
              set.status = 401;
              return {
                message: 'این حساب کاربری وجود ندارد !',
                success: false,
              };
            } else if (userData == null) {
              set.status = 401;
              return {
                message: 'ایمیل یا رمز عبور اشتباه است !',
                success: false,
              };
            }
          },
          body: t.Object({
            email: t.String(),
            password: t.String({
              minLength: 6,
              error: 'رمز عبور باید حداقل 6 کاراکتر داشته باشد !',
            }),
          }),
        }
      )

      // ! Token is mandatory
      .guard({
        headers: t.Object({
          authorization: t.String(),
        }),
      })
      .onBeforeHandle(async ({ store: { checkToken }, set }) => {
        if (checkToken == null) {
          set.status = 404;
          return { message: 'توکن اشتباه است !', success: false };
        }
      })

      // ! get User
      .get('user', async ({ store: { checkToken } }) => {
        return {
          message: 'کاربر با موفقیت یافت شد !',
          success: true,
          data: { ...checkToken.userData, password: null },
        };
      })

      // ! logout User
      .get('logout', async ({ store: { checkToken } }) => {
        await Prisma.sessiontoken.deleteMany({
          where: {
            token: checkToken.token,
          },
        });

        return { message: 'کاربر با موفقیت خارج شد !', success: true };
      })

      // ! update User
      .put(
        'update',
        async ({ body: { fristName, lastName }, store: { checkToken } }) => {
          // ! تغیر ایمیل کاربر امکان پذیر نیست زیرا یونیک است
          const user = await Prisma.user.update({
            where: {
              id: checkToken.userId,
            },
            data: {
              lastName,
              fristName,
            },
          });

          return {
            message: 'کاربر با موفقیت ویرایش شد !',
            data: { ...user, password: null },
            success: true,
          };
        },
        {
          body :  t.Object({
            fristName: t.String({
              minLength: 2,
              error: 'نام باید حداقل 2 کاراکتر داشته باشد !',
            }),
            lastName: t.String({
              minLength: 3,
              error: 'نام خانوادگی باید حداقل 3 کاراکتر داشته باشد !',
            }),
          })
        }
      )

      // ! update User and password
      .put(
        'update/password',
        async ({ body: { u_password , lastName, fristName }, store: { checkToken } }) => {
          const user = await Prisma.user.update({
            where: {
              id: checkToken.userId,
            },
            data: {
              password: await Bun.password.hash(u_password),
              fristName,
              lastName
            },
          });

          return {
            message: 'رمز عبور کاربر با موفقیت ویرایش شد !',
            data: { ...user, password: null },
            success: true,
          };
        },
        {
          beforeHandle: async ({ store: { checkToken }, body, set }) => {
            const checkPassword = await Bun.password.verify(
              body.o_password,
              checkToken.userData.password
            );

            if (!checkPassword) {
              set.status = 401;
              return { message: 'رمز عبور فعلی اشتباه است !', success: false };
            }
          },
          body: t.Object({
            u_password: t.String({
              minLength: 6,
              error: 'رمز عبور جدید حداقل 6 کاراکتر باید باشد !',
            }),
            o_password: t.String({
              minLength: 6,
              error: 'رمز عبور فعلی حداقل 6 کاراکتر باید باشد !',
            }),
            fristName: t.String({
              minLength: 2,
              error: 'نام باید حداقل 2 کاراکتر داشته باشد !',
            }),
            lastName: t.String({
              minLength: 3,
              error: 'نام خانوادگی باید حداقل 3 کاراکتر داشته باشد !',
            }),
          }),
        }
      )
  );
});

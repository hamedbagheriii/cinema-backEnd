import { PrismaClient, user } from '@prisma/client';
import Elysia, { error, t } from 'elysia';
import { authClass } from './isUser';
import { hasAccessClass } from './hasAccess';
import { checkClass } from '../utils/checkThereIs';

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
              wallet: {
                create: {},
              },
            },
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
          body: t.Object({
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

      // ! update User and password
      .put(
        'update/password',
        async ({ body: { u_password, lastName, fristName }, store: { checkToken } }) => {
          const user = await Prisma.user.update({
            where: {
              id: checkToken.userId,
            },
            data: {
              password: await Bun.password.hash(u_password),
              fristName,
              lastName,
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
          'get-users',
          checkToken.userData.roles,
          set
        );
        if ((await checkUserRole) !== true) return checkUserRole;
      })

      // ! get all users
      .get(
        'users/:id?',
        async ({ params: { id } }) => {
          let data: any;
          let include = {
            roles: {
              include: {
                roleData: true,
              },
            },
          };

          if (id) {
            data = await Prisma.user.findUnique({
              where: {
                id,
                roles: {
                  every: {
                    roleID: {
                      not: 1,
                    },
                  },
                },
              },
              include,
            });
            data.password = null;
          } else {
            data = await Prisma.user.findMany({
              include,
              where: {
                roles: {
                  every: {
                    roleID: {
                      not: 1,
                    },
                  },
                },
              },
            });

            data.map((t: any) => {
              t.password = null;
            });
          }

          return {
            message: 'کاربران با موفقیت یافت شدند !',
            success: true,
            data,
          };
        },
        {
          params: t.Object({
            id: t.Optional(t.String()),
          }),
        }
      )

      // ! update User with admin
      .put(
        'users/update',
        async ({ body: { fristName, lastName, email, roles } }) => {
          const userData: any = await Prisma.user.findUnique({
            where: {
              email,
            },
          });

          let data = {
            lastName,
            fristName,
          };
          let user;

          // ! edit roles
          user = await Prisma.rolesuser
            .deleteMany({
              where: {
                userData: {
                  email,
                },
              },
            })
            .then(async () => {
              const newRoles = await Prisma.rolesuser.createMany({
                data: roles.map((t: any) => {
                  return {
                    roleID: t,
                    userID: userData.id,
                  };
                }),
              });
            })
            .then(async () => {
              return await Prisma.user.update({
                where: {
                  email,
                },
                data,
              });
            });

          return {
            message: 'کاربر با موفقیت ویرایش شد !',
            data: { ...user, password: null },
            success: true,
          };
        },
        {
          beforeHandle: async ({
            body: { email, roles },
            set,
            store: { checkToken },
          }) => {
            const checkUserRole = hasAccessClass.hasAccess(
              'edit-users',
              checkToken.userData.roles,
              set
            );
            if ((await checkUserRole) !== true) return checkUserRole;

            // check user =>
            const checkUser = await Prisma.user.findUnique({
              where: {
                email,
              },
            });

            if (checkToken === null) {
              set.status = 401;
              return {
                message: 'کاربر با این ایمیل وجود ندارد !',
              };
            }

            // validate for there is role =>
            let allRoles: any[] = await Prisma.role.findMany();
            return checkClass.validate(allRoles, roles, set, 'نقش');
          },
          body: t.Object({
            fristName: t.String({
              minLength: 2,
              error: 'نام باید حداقل 2 کاراکتر داشته باشد !',
            }),
            lastName: t.String({
              minLength: 3,
              error: 'نام خانوادگی باید حداقل 3 کاراکتر داشته باشد !',
            }),
            email: t.String(),
            roles: t.Array(t.Optional(t.Number())),
          }),
        }
      )

      // ! delete User with admin
      .delete(
        'users/del/:id',
        async ({ params: { id }, body: { email } }) => {
          const delUser = await Prisma.sessionticket
            .deleteMany({
              where: {
                userData: {
                  id,
                },
              },
            })
            .then(async () => {
              const delWallet = await Prisma.wallet.deleteMany({
                where: {
                  email,
                },
              });
            })
            .then(async () => {
              const delToken = await Prisma.sessiontoken.deleteMany({
                where: {
                  userId: id,
                },
              });
            })
            .then(async () => {
              const delUserRole = await Prisma.rolesuser.deleteMany({
                where: {
                  userID: id,
                },
              });
            })
            .then(async () => {
              return await Prisma.user.delete({
                where: {
                  id,
                },
              });
            });

          return {
            message: 'کاربر با موفقیت حذف شد !',
            data: { ...delUser, password: null },
            success: true,
          };
        },
        {
          beforeHandle: async ({ params: { id }, set, store: { checkToken } }) => {
            const checkUserRole = hasAccessClass.hasAccess(
              'delete-users',
              checkToken.userData.roles,
              set
            );
            if ((await checkUserRole) !== true) return checkUserRole;

            // check user =>
            const checkUser = await Prisma.user.findUnique({
              where: {
                id,
              },
            });

            if (checkToken === null) {
              set.status = 401;
              return {
                message: 'کاربر با این آیدی وجود ندارد !',
              };
            }
          },
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            email: t.String(),
          }),
        }
      )

      // ! add user with admin
      .post(
        'users/add',
        async ({ body: { email, password, fristName, lastName, roles } }) => {
          let user;
          let data = {
            email,
            lastName,
            fristName,
            password: await Bun.password.hash(password),
            wallet: {
              create: {},
            },
          };

          if (roles.length > 0) {
            user = await Prisma.user.create({
              data: {
                ...data,
                roles: {
                  createMany: {
                    data: roles.map((t: any) => {
                      return {
                        roleID: t,
                      };
                    }),
                  },
                },
              },
            });
          } else {
            user = await Prisma.user.create({
              data,
            });
          }

          return {
            message: 'کاربر با موفقیت ثبت نام شد !',
            data: { ...user, password: null },
            success: true,
          };
        },
        {
          beforeHandle: async ({
            store: { checkToken },
            body: { roles, email },
            set,
          }) => {
            const checkUserRole = hasAccessClass.hasAccess(
              'add-users',
              checkToken.userData.roles,
              set
            );
            if ((await checkUserRole) !== true) return checkUserRole;
            const checkUser = await Prisma.user.findUnique({
              where: {
                email,
              },
            });

            if (checkUser) {
              set.status = 401;
              return { message: 'کاربر قبلا ثبت نام کرده است !', success: false };
            }

            // validate for there is role =>
            let allRoles: any[] = await Prisma.role.findMany();
            return checkClass.validate(allRoles, roles, set, 'نقش');
          },
          body: t.Object({
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
            roles: t.Array(t.Optional(t.Number())),
          }),
        }
      )
  );
});

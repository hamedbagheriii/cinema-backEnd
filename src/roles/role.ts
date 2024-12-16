import Elysia, { t } from 'elysia';
import { auth, Prisma } from '../auth/auth';
import { hasAccessClass } from '../auth/hasAccess';
import { checkClass } from '../utils/checkThereIs';
import perms from '../../roles.json';

export const role = new Elysia().group('/roles', (app) => {
  return (
    app
      .state('checkToken', null as null | any)

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
          'get-role',
          checkToken.userData.roles,
          set
        );
        if ((await checkUserRole) !== true) return checkUserRole;
      })

      // ! ==================== permissions ====================

      // ! add all perms for admin
      .get(
        '/perm/addAll',
        async (req: any) => {
          let allPerm: any[] = perms.perms;

          allPerm = allPerm.filter((t: any) => t.permName !== 'allAccess');

          const data = await Prisma.permission.createMany({
            data: allPerm.map((t: any) => {
              return {
                id: t.id,
                permName: t.permName,
                category: t.category,
              };
            }),
          });

          return {
            message: 'دسترسی ها با موفقیت اضافه شد !',
            perms: data,
            success: true,
          };
        },
        {
          beforeHandle: async ({ store: { checkToken }, set }) => {
            const checkUserRole = hasAccessClass.hasAccess(
              'allAccess',
              checkToken.userData.roles,
              set
            );
            if ((await checkUserRole) !== true) return checkUserRole;

            const checkPerms = await Prisma.permission.findMany();

            if (checkPerms.length === 27) {
              return {
                message: 'همه دسترسی ها قبلا اضافه شده است !',
                success: false,
              };
            }
          },
        }
      )

      // ! get all perm for show
      .get(
        '/perm',
        async () => {
          let allPerm: any[] = perms.perms;

          allPerm = allPerm.filter((t: any) => t.permName !== 'allAccess');

          return {
            message: 'دسترسی ها با موفقیت دریافت شد !',
            success: true,
            perms: allPerm,
          };
        },
        {
          beforeHandle: async ({ store: { checkToken }, set }) => {
            const checkUserRole = hasAccessClass.hasAccess(
              'get-perm',
              checkToken.userData.roles,
              set
            );
            if ((await checkUserRole) !== true) return checkUserRole;
          },
        }
      )

      // ! ==================== roles ====================

      // ! delete role =>
      .delete(
        '/delete/:id',
        async ({ params: { id } }) => {
          const deletePerms = await Prisma.rolepermissions
            .deleteMany({
              where: {
                roleID: id,
              },
            })
            .then(async () => {
              const delUserRole = await Prisma.rolesuser.deleteMany({
                where: {
                  roleID: id,
                },
              });
            })
            .then(async () => {
              const deleteRole = await Prisma.role.delete({
                where: {
                  id,
                },
              });
            });

          return {
            message: 'نقش با موفقیت حذف شد !',
            success: true,
          };
        },
        {
          beforeHandle: async ({ params: { id }, set, store: { checkToken } }) => {
            const checkUserRole = hasAccessClass.hasAccess(
              'delete-role',
              checkToken.userData.roles,
              set
            );
            if ((await checkUserRole) !== true) return checkUserRole;

            const checkRole = await Prisma.role.findUnique({
              where: {
                id,
              },
            });

            if (checkRole === null) {
              set.status = 404;
              return {
                message: 'نقش مورد نظر وجود ندارد !',
                success: false,
              };
            }
          },
          params: t.Object({
            id: t.Number(),
          }),
        }
      )

      // ! get all roles =>
      .get(
        '/:id?',
        async ({ params: { id } }) => {
          const include = {
            permissions: {
              include: {
                permissionData: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          };
          let allRole: any;

          if (id) {
            allRole = await Prisma.role.findUnique({
              where: {
                id,
              },
              include,
            });
          } else {
            allRole = await Prisma.role.findMany({
              include,
            });

            allRole = allRole.filter((t: any) => {
              return t.roleName !== 'SuperAdmin';
            });
          }

          return {
            message: 'نقش ها با موفقیت دریافت شد !',
            success: true,
            roles: allRole,
          };
        },
        {
          beforeHandle: async ({ store: { checkToken }, set }) => {
            const checkUserRole = hasAccessClass.hasAccess(
              'get-role',
              checkToken.userData.roles,
              set
            );
            if ((await checkUserRole) !== true) return checkUserRole;
          },
          params: t.Object({
            id: t.Optional(t.Number()),
          }),
        }
      )

      //! handle check there is role and there is permission =>
      .onBeforeHandle(async ({ body, set }) => {
        const { roleName, permissions } = body as {
          roleName: string;
          permissions: number[];
        };
        let isPerm: boolean = true;

        // handle check permission =>
        await Promise.all(
          permissions.map(async (permID) => {
            const checkPerm = await Prisma.permission.findUnique({
              where: {
                id: permID,
              },
            });

            if (checkPerm === null) isPerm = false;
          })
        );
        if (!isPerm) {
          set.status = 404;
          return {
            message: 'مجوز انتخاب شده وجود ندارد !',
            success: false,
          };
        }
      })
      .guard({
        body: t.Object({
          permissions: t.Array(t.Number()),
          roleName: t.String(),
          roleDec: t.String(),
        }),
      })

      // ! add new role =>
      .post(
        '/add',
        async ({ body: { roleName, permissions, roleDec } }) => {
          const newRole = await Prisma.role.create({
            data: {
              roleName,
              roleDec,
              permissions: {
                create: permissions.map((permID) => {
                  return {
                    permissionID: permID,
                  };
                }),
              },
            },
            include: {
              permissions: {
                include: {
                  permissionData: true,
                },
              },
            },
          });

          return {
            message: 'نقش با موفقیت اضافه شد !',
            success: true,
            role: newRole,
          };
        },
        {
          beforeHandle: async ({
            body: { roleName, permissions },
            set,
            store: { checkToken },
          }) => {
            const checkUserRole = hasAccessClass.hasAccess(
              'add-role',
              checkToken.userData.roles,
              set
            );
            if ((await checkUserRole) !== true) return checkUserRole;

            // validate for there is role =>
            const checkRolle = await Prisma.role.findUnique({
              where: {
                roleName,
              },
            });
            if (checkRolle) {
              return {
                message: 'این نقش قبلا ایجاد شده است !',
                success: false,
              };
            }

            // validate for there is permissions =>
            let allPerm: any[] = await Prisma.permission.findMany();
            return checkClass.validate(allPerm, permissions, set, 'دسترسی');
          },
        }
      )

      // ! edit role =>
      .put(
        '/edit/:id',
        async ({ body: { roleName, permissions, roleDec }, params: { id } }) => {
          // handle check there is permission in edit role =>
          let allPerm: any[] = await Prisma.rolepermissions.findMany({
            where: {
              roleID: id,
            },
          });
          allPerm = allPerm.map((t) => t.permissionID);

          const notExist: number[] = allPerm.filter((t) => !permissions.includes(t));
          const isExist: number[] = permissions.filter((t) => !allPerm.includes(t));

          // remove old and add new permission =>
          const removePermRole = await Prisma.rolepermissions.deleteMany({
            where: {
              roleID: id,
              permissionID: {
                in: notExist,
              },
            },
          });
          const addNewPerm = await Prisma.rolepermissions.createMany({
            data: isExist.map((permID) => {
              return {
                roleID: id,
                permissionID: permID,
              };
            }),
          });

          // edit role info =>
          const editRole = await Prisma.role.update({
            where: {
              id,
            },
            data: {
              roleName,
              roleDec,
            },
            include: {
              permissions: {
                include: {
                  permissionData: true,
                },
              },
            },
          });

          return {
            message: 'نقش با موفقیت ویرایش شد !',
            success: true,
            role: editRole,
          };
        },
        {
          beforeHandle: async ({ store: { checkToken }, set, body: { permissions } }) => {
            const checkUserRole = hasAccessClass.hasAccess(
              'edit-role',
              checkToken.userData.roles,
              set
            );
            if ((await checkUserRole) !== true) return checkUserRole;

            // validate for there is permission =>
            let allPerm: any[] = await Prisma.permission.findMany();
            return checkClass.validate(allPerm, permissions, set, 'دسترسی');
          },
          params: t.Object({
            id: t.Number(),
          }),
        }
      )
  );
});

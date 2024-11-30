import Elysia, { t } from 'elysia';
import { Prisma } from '../auth/auth';

export const role = new Elysia().group('/roles', (app) => {
  return (
    app

      // ! ==================== permissions ====================

      // ! add new permission (user or admin dont have access) =>
      .post(
        '/perm',
        async ({ body: { permName, category } }) => {
          const newPerm = await Prisma.permission.create({
            data: {
              permName,
              category,
            },
          });

          return {
            message: 'دسترسی اضافه شد !',
            success: true,
            perm: newPerm,
          };
        },
        {
          body: t.Object({
            permName: t.String(),
            category: t.String(),
          }),
        }
      )

      // ! get all perm for show
      .get('/perm', async () => {
        const allPerm = await Prisma.permission.findMany();

        return {
          message: 'دسترسی ها با موفقیت دریافت شد !',
          success: true,
          perm: allPerm,
        };
      })

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
          beforeHandle: async ({ params: { id }, set }) => {
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
      .get('/', async () => {
        const allRole = await Prisma.role.findMany({
            include : {
                permissions : {
                    include : {
                        permissionData : true
                    }
                }
            }
        });

        return {
          message: 'نقش ها با موفقیت دریافت شد !',
          success: true,
          roles: allRole,
        };
      })

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
          beforeHandle: async ({ body: { roleName }, set }) => {
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
          params: t.Object({
            id: t.Number(),
          }),
        }
      )
  );
});

import Elysia, { t } from 'elysia';
import { auth, Prisma } from '../auth/auth';
import { imgAwcClass } from '../imageAWS/upIMG';
import { hasAccessClass } from '../auth/hasAccess';
import { checkClass } from '../utils/checkThereIs';

export const cinema = new Elysia().group('/cinema', (app) => {
  return (
    app

      .state('checkToken', null as null | any)

      // ! get cinemas
      .get(
        '/:id?',
        async ({ params: { id } }) => {
          let cinemas;
          if (id) {
            cinemas = await Prisma.cinema.findUnique({
              where: {
                id,
              },
              include: {
                halls: true,
                movies: {
                  include: {
                    movie: {
                      include: {
                        image: true,
                      },
                    },
                  },
                },
                image: true,
                dates: true,
              },
            });
          } else {
            cinemas = await Prisma.cinema.findMany({
              include: {
                halls: true,
                movies: true,
                image: true,
                dates: true,
              },
            });
          }

          return {
            data: cinemas,
            message: 'دریافت سینماها با موفقیت انجام شد !',
            success: true,
          };
        },
        {
          params: t.Object({
            id: t.Optional(t.Number()),
          }),
        }
      )

      // ! get halls
      .get(
        '/halls/:id?',
        async ({ params: { id } }) => {
          let halls;
          if (id) {
            halls = await Prisma.hall.findUnique({
              where: {
                id,
              },
              include: {
                cinemaData: true,
              },
            });
          } else {
            halls = await Prisma.hall.findMany({
              include: {
                cinemaData: true,
              },
            });
          }

          return {
            data: halls,
            message: 'دریافت سالن ها با موفقیت انجام شد !',
            success: true,
          };
        },
        {
          params: t.Object({
            id: t.Optional(t.Number()),
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
          'get-cinema',
          checkToken.userData.roles,
          set
        );
        if ((await checkUserRole) !== true) return checkUserRole;
      })

      // ! add cinema
      .post(
        '/add',
        async ({ body: { cinemaName, address, city, province, image }, set }) => {
          const checkImage = await Prisma.images.findUnique({
            where: {
              name: image.name,
            },
          });

          // ! check image =>
          const data = {
            cinemaName,
            address,
            city,
            province,
            
          };
          const include = {
            movies: true,
            image: true,
          };
          let cinema;

          if (checkImage) {
            cinema = await Prisma.cinema.create({
              data: {
                ...data,
                image: {
                  connect: {
                    name: image.name,
                  },
                },
              },
              include,
            })
          } else {
            // ! upload image to s3 =>
            const movieIMG = await imgAwcClass.uploadImage(image, 'cinemaIMG');
            if (!movieIMG.success) {
              set.status = 400;
              return {
                ...movieIMG,
              };
            }

            cinema = await Prisma.cinema.create({
              data: {
                ...data,
                image: {
                  create: {
                    name: image.name,
                    url: movieIMG.fileUrl || '',
                  },
                },
              },
              include,
            });
          }

          return {
            data: cinema,
            message: 'افزودن سینما با موفقیت انجام شد !',
            success: true,
          };
        },
        {
          beforeHandle: async ({
            body: { image, cinemaName },
            set,
            store: { checkToken },
          }) => {
            const checkUserRole = hasAccessClass.hasAccess(
              'add-cinema',
              checkToken.userData.roles,
              set
            );
            if ((await checkUserRole) !== true) return checkUserRole;

            // check image =>
            if (!image) {
              set.status = 400;
              return {
                success: false,
                message: 'عکس انتخاب نشده است !',
              };
            }
            const fileName = `${Date.now()}-${image.name}`;
          },
          body: t.Object({
            cinemaName: t.String(),
            address: t.String(),
            city: t.String(),
            province: t.String(),
            image: t.File(),
          }),
        }
      )

      // ! edit cinema
      .put(
        '/edit/:id',
        async ({ body: { cinemaName, address, city, province }, params: { id } }) => {
          const cinema = await Prisma.cinema.update({
            where: {
              id,
            },
            data: {
              cinemaName,
              address,
              city,
              province,
            },
            include: {
              movies: true,
              image: true,
            },
          });

          return {
            data: cinema,
            message: 'ویرایش سینما با موفقیت انجام شد !',
            success: true,
          };
        },
        {
          beforeHandle: async ({ body: {}, set, store: { checkToken } }) => {
            const checkUserRole = hasAccessClass.hasAccess(
              'edit-cinema',
              checkToken.userData.roles,
              set
            );
            if ((await checkUserRole) !== true) return checkUserRole;
          },
          body: t.Object({
            cinemaName: t.String(),
            address: t.String(),
            city: t.String(),
            province: t.String(),
          }),
          params: t.Object({
            id: t.Number(),
          }),
        }
      )

      // ! delete cinema
      .delete(
        '/:id',
        async ({ params: { id } }) => {
          const res = await Prisma.hall
            .deleteMany({
              where: {
                cinemaID: id,
              },
            })
            .then(async (res)=>{
              const delMovie = await Prisma.moviecinema.deleteMany({
                where: {
                  cinemaID: id,
                },
              })
            })
            .then(async (d) => {
              return await Prisma.cinema.delete({
                where: {
                  id,
                },
              });
            });

          return {
            res,
            message: 'سینما با موفقیت حذف شد !',
            success: true,
          };
        },
        {
          beforeHandle: async ({ store: { checkToken }, set }) => {
            const checkUserRole = hasAccessClass.hasAccess(
              'delete-cinema',
              checkToken.userData.roles,
              set
            );
            if ((await checkUserRole) !== true) return checkUserRole;
          },
          params: t.Object({
            id: t.Number(),
          }),
        }
      )

      // ! add movies to cinema
      .put(
        '/UPMovies/:id',
        async ({ params: { id }, body: { movies } }) => {
          let res;
          const checkData = await Prisma.moviecinema
            .deleteMany({
              where: {
                cinemaID: id,
              },
            })
            .then(async (d) => {
              res = await Prisma.moviecinema.createMany({
                data: movies.map((movie: number) => ({ movieId: movie, cinemaID: id })),
              });
            });

          return {
            res,
            message: 'افزودن فیلم به سینما با موفقیت انجام شد !',
            success: true,
          };
        },
        {
          beforeHandle: async ({
            store: { checkToken },
            set,
            body: { movies },
            params: { id },
          }) => {
            const checkUserRole = hasAccessClass.hasAccess(
              'add-movie-cinema',
              checkToken.userData.roles,
              set
            );
            if ((await checkUserRole) !== true) return checkUserRole;

            // validate for there is cinema =>
            const checkCinema = await Prisma.cinema.findUnique({
              where: {
                id,
              },
            });
            if (checkCinema === null) {
              set.status = 404;
              return {
                message: 'سینما مورد نظر وجود ندارد !',
                success: false,
              };
            }

            // validate for there is movies  =>
            const allMovies = await Prisma.movies.findMany();
            return checkClass.validate(allMovies, movies, set, 'فیلم');
          },
          params: t.Object({
            id: t.Number(),
          }),
          body: t.Object({
            movies: t.Array(t.Number()),
          }),
        }
      )

      // ! ==================== Halls ====================

      // ! add halls
      .post(
        '/halls/add',
        async ({ body: { hallName, maximumRows, cinemaID, maximumCol } }) => {
          const hall = await Prisma.hall.create({
            data: {
              hallName,
              maximumRows,
              maximumCol,
              cinemaID,
            },
          });

          return {
            data: hall,
            message: 'افزودن سالن با موفقیت انجام شد !',
            success: true,
          };
        },
        {
          beforeHandle: async ({ store: { checkToken }, set, body: { cinemaID } }) => {
            const checkUserRole = hasAccessClass.hasAccess(
              'add-hall',
              checkToken.userData.roles,
              set
            );
            if ((await checkUserRole) !== true) return checkUserRole;

            // validate for there is cinema =>
            const checkCinema = await Prisma.cinema.findUnique({
              where: {
                id: cinemaID,
              },
            });
            if (checkCinema === null) {
              set.status = 404;
              return {
                message: 'سینما مورد نظر وجود ندارد !',
                success: false,
              };
            }
          },
          body: t.Object({
            hallName: t.String(),
            maximumRows: t.Number(),
            cinemaID: t.Number(),
            maximumCol: t.Number(),
          }),
        }
      )

      // ! delete hall
      .delete(
        '/halls/delete/:id',
        async ({ params: { id } }) => {
          const res = await Prisma.hall.delete({
            where: {
              id,
            },
          });

          return {
            res,
            message: 'سالن با موفقیت حذف شد !',
            success: true,
          };
        },
        {
          beforeHandle: async ({ store: { checkToken }, set }) => {
            const checkUserRole = hasAccessClass.hasAccess(
              'delete-hall',
              checkToken.userData.roles,
              set
            );
            if ((await checkUserRole) !== true) return checkUserRole;
          },
          params: t.Object({
            id: t.Number(),
          }),
        }
      )

      // ! edit hall
      .put(
        '/halls/edit/:id',
        async ({ params: { id }, body: { hallName, maximumRows, maximumCol } }) => {
          const res = await Prisma.hall.update({
            where: {
              id,
            },
            data: {
              hallName,
              maximumRows,
              maximumCol,
            },
          });

          return {
            res,
            message: 'سالن با موفقیت اپدیت شد !',
            success: true,
          };
        },
        {
          beforeHandle: async ({ store: { checkToken }, set }) => {
            const checkUserRole = hasAccessClass.hasAccess(
              'update-hall',
              checkToken.userData.roles,
              set
            );
            if ((await checkUserRole) !== true) return checkUserRole;
          },
          params: t.Object({
            id: t.Number(),
          }),
          body: t.Object({
            hallName: t.String(),
            maximumRows: t.Number(),
            maximumCol: t.Number(),
          }),
        }
      )
  );
});

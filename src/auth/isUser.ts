import { Prisma } from './auth';

export class authClass {
  async isUser(email: string | null) {
    if (email !== null) {
      const userData = (
        await Prisma.user.findUnique({
          where: {
            email: email,
          },
        })
      );
      return userData || null;
    }
  }

  async checkToken(token: string) {
    return await Prisma.sessiontoken.findUnique({
      where: {
        token,
      },
      include: {
        userData: {
          include: {
            tickets: {
              include : {
                movieData: true,
                rows: true,
                cinemaData: true,
                hallData: true,
              }
            },
            wallet : true,
            token : true,
            roles : {
              include :{
                roleData : {
                  include : {
                    permissions : {
                      include : {
                        permissionData : {
                          select : {
                            category : true,
                            id : true,
                            permName : true ,
                          }
                        }
                      }
                    }
                  }
                },
              }
            },
          },
        },
      },
    });
  }
}

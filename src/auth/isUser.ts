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
    return await Prisma.sessionToken.findUnique({
      where: {
        token,
      },
      include: {
        userData: {
          include: {
            tickets: true,
            wallet : true,
            token : true
          },
        },
      },
    });
  }
}

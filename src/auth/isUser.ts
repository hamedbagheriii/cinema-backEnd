import { Prisma } from "./auth";

export class authClass {
  async isUser(email: string | undefined) {
    const userData = (await Prisma.user.findMany({
      where: {
        email: email,
      },
    }))[0];
    return userData || null;
  }
}
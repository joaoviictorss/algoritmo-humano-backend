import { prisma } from "@/lib/prisma";

export const findUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
    where: {
      id: userId,
    },
  });

  return user;
};

import { UsersFindManyArgs, UsersGetPayload } from "@/generated/prisma/models";

export const usersArgs = {
  select: {
    userId: true,
    name: true,
    username: true,
    email: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  },
} satisfies UsersFindManyArgs;

export type Users = UsersGetPayload<typeof usersArgs>;

import {
  ProductsFindManyArgs,
  ProductsGetPayload,
} from "@/generated/prisma/models";

export const productsIcons = {
  include: {
    category: {
      select: {
        name: true,
        icon: true,
      },
    },
  },
} satisfies ProductsFindManyArgs;

export type ProductsIcons = ProductsGetPayload<typeof productsIcons>;

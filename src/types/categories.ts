import {
  CategoriesFindManyArgs,
  CategoriesGetPayload,
} from "@/generated/prisma/models";

export const categoriesExtended = {
  include: {
    _count: {
      select: { products: true },
    },
  },
} satisfies CategoriesFindManyArgs;

export type Categories = CategoriesGetPayload<typeof categoriesExtended>;

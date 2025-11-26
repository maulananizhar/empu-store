import {
  ProductsFindManyArgs,
  ProductsGetPayload,
} from "@/generated/prisma/models";

// interface ProductsIcons extends Products {
//   category: {
//     name: string;
//     icon: string;
//   };
// }

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

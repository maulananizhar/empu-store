import {
  DiscountsFindManyArgs,
  DiscountsGetPayload,
} from "@/generated/prisma/models";

export const discountsExtended = {
  include: {
    product: {
      include: {
        category: true,
      },
    },
  },
} satisfies DiscountsFindManyArgs;

export type Discounts = DiscountsGetPayload<typeof discountsExtended>;

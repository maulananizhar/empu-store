import {
  OrdersFindManyArgs,
  OrdersGetPayload,
} from "@/generated/prisma/models";

export const ordersProductsExtended = {
  include: {
    OrdersProducts: {
      select: {
        orderProductId: true,
        quantity: true,
        product: {
          select: {
            productId: true,
            name: true,
            price: true,
            category: {
              select: {
                icon: true,
              },
            },
          },
        },
      },
    },
    cashier: {
      select: {
        name: true,
      },
    },
    method: {
      select: {
        method: true,
      },
    },
  },
} satisfies OrdersFindManyArgs;

export type OrdersProductsExtended = OrdersGetPayload<
  typeof ordersProductsExtended
>;

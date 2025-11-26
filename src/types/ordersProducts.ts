import { Orders } from "@/generated/prisma/browser";

interface OrdersProductsExtended extends Orders {
  OrdersProducts: {
    orderProductId: number;
    quantity: number;
    product: {
      productId: number;
      name: string;
      price: number;
      category: {
        icon: string;
      };
    };
  }[];
  cashier: {
    name: string;
  };
  method: {
    method: string;
  };
}

export type { OrdersProductsExtended };

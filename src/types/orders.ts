import { Orders } from "@/generated/prisma/browser";

interface OrderExtended extends Orders {
  cashierName: string;
  methodName: string;
}

export type { OrderExtended };

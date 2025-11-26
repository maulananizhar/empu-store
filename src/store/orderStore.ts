import { create } from "zustand";

type Order = {
  orderId: number | null;
  setOrderId: (orderId: number) => void;
};

export const useOrder = create<Order>(set => ({
  orderId: 0,
  setOrderId: (newOrderId: number) => set({ orderId: newOrderId }),
}));

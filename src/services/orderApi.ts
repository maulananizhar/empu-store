import { Orders } from "@/generated/prisma/browser";
import { OrderExtended } from "@/types/orders";
import axios from "axios";
import { toast } from "sonner";

// Function to fetch products from the API
async function fetchOrders() {
  try {
    const response = await axios.get("/api/orders");
    return response.data.data as OrderExtended[];
  } catch (error) {
    throw error;
  }
}

async function createOrder(cashierId: number) {
  try {
    const response = await axios.post(
      "/api/orders/add",
      {
        cashierId: cashierId,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data as Orders;
  } catch (error) {
    throw error;
  }
}

async function updateOrder(orderId: number, updatedData: Partial<Orders>) {
  try {
    const response = await axios.put(
      `/api/orders/edit`,
      {
        orderId: orderId,
        total: updatedData.total,
        cash: updatedData.cash,
        methodId: updatedData.methodId,
        status: updatedData.status,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data as Orders;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      toast.error(
        `${
          (error.response?.data as { message: string })?.message ||
          error.message
        }`,
        { richColors: true }
      );
    }
  }
}

export { fetchOrders, createOrder, updateOrder };

import { OrdersProducts } from "@/generated/prisma/browser";
import { OrdersProductsExtended } from "@/types/ordersProducts";
import axios from "axios";
import { toast } from "sonner";

// Function to fetch orders products from the API
async function fetchOrdersProducts(orderId: number) {
  try {
    const response = await axios.post(
      "/api/orders-product",
      {
        orderId,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data as OrdersProductsExtended;
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

async function addProductToOrder(orderId: number, productId: number) {
  try {
    const response = await axios.post(
      "/api/orders-product/add",
      {
        orderId,
        productId,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data as OrdersProducts;
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

async function addQuantityToOrderProduct(
  orderProductsId: number,
  number: number
) {
  try {
    const response = await axios.put(
      "/api/orders-product/add-quantity",
      {
        orderProductsId,
        number,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data as { count: number };
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

export { fetchOrdersProducts, addProductToOrder, addQuantityToOrderProduct };

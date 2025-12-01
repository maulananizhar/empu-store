import { AxiosExtendedResponse } from "@/types/axios";
import { Discounts } from "@/types/discounts";
import axios, { AxiosResponse } from "axios";
import { toast } from "sonner";

// Function to fetch products from the API
async function fetchDiscounts(date: Date, all?: boolean) {
  try {
    const response: AxiosResponse<AxiosExtendedResponse> = await axios.get(
      "/api/discounts",
      {
        params: {
          date: date,
          all: all ? "true" : "false",
        },
      }
    );
    return response.data.data as Discounts[];
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

async function addDiscount(
  productId: number,
  percentage: number,
  expiredAt: string
) {
  try {
    // Jika expiredAt adalah ISO date, ubah jamnya menjadi 23:59:59
    const expiredDate = new Date(expiredAt);
    expiredDate.setHours(23, 59, 59, 0);
    const expiredAtISO = expiredDate.toISOString();

    const response: AxiosResponse<AxiosExtendedResponse> = await axios.post(
      "/api/discounts/add",
      {
        productId,
        percentage,
        expiredAt: expiredAtISO,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    toast.success(response.data.message, { richColors: true });
    return response.data;
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

async function deleteDiscount(discountId: number, productId: number) {
  try {
    const response: AxiosResponse<AxiosExtendedResponse> = await axios.delete(
      "/api/discounts/delete",
      {
        data: {
          discountId,
          productId,
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    toast.success(response.data.message, { richColors: true });
    return response.data;
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

async function updateDiscount(
  discountId: number,
  productId: number,
  percentage: number,
  expiredAt: string
) {
  try {
    // Jika expiredAt adalah ISO date, ubah jamnya menjadi 23:59:59
    const expiredDate = new Date(expiredAt);
    expiredDate.setHours(23, 59, 59, 0);
    const expiredAtISO = expiredDate.toISOString();

    const response: AxiosResponse<AxiosExtendedResponse> = await axios.put(
      "/api/discounts/edit",
      {
        discountId,
        productId,
        percentage,
        expiredAt: expiredAtISO,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    toast.success(response.data.message, { richColors: true });
    return response.data;
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

export { fetchDiscounts, addDiscount, deleteDiscount, updateDiscount };

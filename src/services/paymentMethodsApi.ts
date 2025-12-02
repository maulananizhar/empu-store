import { Payments } from "@/generated/prisma/client";
import axios from "axios";
import { toast } from "sonner";

async function fetchPaymentMethods() {
  try {
    const response = await axios.get("/api/payment-methods");
    return response.data.data as Payments[];
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

export { fetchPaymentMethods };

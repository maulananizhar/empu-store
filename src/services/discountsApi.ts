import { Discounts } from "@/generated/prisma/browser";
import axios from "axios";

// Function to fetch products from the API
async function fetchDiscounts(date: Date) {
  try {
    const response = await axios.get("/api/discounts", {
      params: {
        date: date,
      },
    });
    return response.data.data as Discounts[];
  } catch (error) {
    throw error;
  }
}

export { fetchDiscounts };

import { Categories } from "@/generated/prisma/browser";
import axios from "axios";

// Function to fetch categories from the API
async function fetchCategories(name: string) {
  try {
    const response = await axios.get("/api/categories", {
      params: {
        name,
      },
    });
    return response.data.data as Categories[];
  } catch (error) {
    throw error;
  }
}

export { fetchCategories };

import { ProductsIcons } from "@/types/products";
import axios from "axios";

// Function to fetch products from the API
async function fetchProducts(name?: string, categoryId?: number) {
  try {
    const response = await axios.get("/api/products", {
      params: {
        name: name,
        categoryId: categoryId,
      },
    });
    return response.data.data as ProductsIcons[];
  } catch (error) {
    throw error;
  }
}

export { fetchProducts };

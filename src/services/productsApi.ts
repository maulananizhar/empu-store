import { ProductsIcons } from "@/types/products";
import axios from "axios";
import { toast } from "sonner";

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

async function addProduct(name: string, category: string, price: number) {
  try {
    const response = await axios.post(
      `/api/products/add`,
      {
        name,
        category,
        price,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data as ProductsIcons;
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

async function deleteProduct(productId: number) {
  try {
    const response = await axios.delete(`/api/products/delete`, {
      data: {
        productId,
      },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    toast.success(response.data.message, { richColors: true });
    return response.data.data as ProductsIcons;
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

async function updateProduct(
  productId: number,
  name: string,
  category: string,
  price: number,
  stok: number
) {
  try {
    const response = await axios.put(
      `/api/products/edit`,
      {
        productId,
        name,
        category,
        price,
        stok,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    toast.success(response.data.message, { richColors: true });
    return response.data.data as ProductsIcons;
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

export { fetchProducts, addProduct, deleteProduct, updateProduct };

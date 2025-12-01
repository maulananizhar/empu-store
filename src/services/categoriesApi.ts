import { Categories } from "@/types/categories";
import axios from "axios";
import { toast } from "sonner";

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

async function addCategory(name: string, icon: string) {
  try {
    const response = await axios.post(
      `/api/categories/add`,
      {
        name,
        icon,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data as Categories;
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

async function updateCategory(categoryId: number, name: string, icon: string) {
  try {
    const response = await axios.put(
      `/api/categories/edit`,
      {
        categoryId,
        name,
        icon,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data as Categories;
  } catch (error) {
    // throw error;
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

async function deleteCategory(categoryId: number) {
  try {
    const formData = new FormData();
    formData.append("categoryId", categoryId.toString());
    const response = await axios.delete(`/api/categories/delete`, {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    toast.success(response.data.message, { richColors: true });
    return response.data.data as Categories;
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

export { fetchCategories, addCategory, updateCategory, deleteCategory };

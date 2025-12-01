import { Roles } from "@/generated/prisma/client";
import { AxiosExtendedResponse } from "@/types/axios";
import { Users } from "@/types/users";
import axios, { AxiosResponse } from "axios";
import { toast } from "sonner";

async function fetchUsers() {
  try {
    const response = await axios.get("/api/users");
    return response.data.data as Users[];
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

async function fetchRoles() {
  try {
    const response = await axios.get("/api/roles");
    return response.data.data as Roles[];
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

async function createUsers(
  name: string,
  username: string,
  email: string,
  password: string,
  confirmPassword: string,
  roleId: number
) {
  try {
    const response: AxiosResponse<AxiosExtendedResponse<Users>> =
      await axios.post(
        "/api/users/add",
        {
          name,
          username,
          email,
          password,
          confirmPassword,
          roleId,
        },
        { headers: { "Content-Type": "multipart/form-data" } }
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

async function deleteUsers(userId: number) {
  try {
    const response: AxiosResponse<AxiosExtendedResponse<Users>> =
      await axios.delete("/api/users/delete", {
        data: { userId },
        headers: { "Content-Type": "multipart/form-data" },
      });
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

async function updateUser(
  userId: number,
  name: string,
  username: string,
  email: string,
  password: string,
  confirmPassword: string,
  roleId: number
) {
  try {
    const response: AxiosResponse<AxiosExtendedResponse<Users>> =
      await axios.put(
        "/api/users/edit",
        {
          userId,
          name,
          username,
          email,
          password,
          confirmPassword,
          roleId,
        },
        { headers: { "Content-Type": "multipart/form-data" } }
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

export { fetchUsers, fetchRoles, createUsers, deleteUsers, updateUser };

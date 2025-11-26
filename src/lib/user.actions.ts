import { PrismaClient } from "@/generated/prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function getUserFromDb(username: string, password: string) {
  try {
    const existedUser = await prisma.users.findUnique({
      where: {
        username: username,
      },
    });

    if (!existedUser) {
      return {
        status: "error",
        message: "Username tidak ditemukan",
      };
    }

    if (!existedUser.password) {
      return {
        status: "error",
        message: "Kata sandi kosong",
      };
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existedUser.password
    );

    if (!isPasswordValid) {
      return {
        status: "error",
        message: "Kata sandi salah",
      };
    }

    return {
      status: "success",
      message: "User retrieved successfully",
      data: existedUser,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        status: "error",
        message: error.message,
      };
    }
  }
}

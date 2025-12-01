import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { AxiosExtendedResponse } from "@/types/axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { usersArgs } from "@/types/users";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      {
        status: "error",
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  if (!session.user.role || session.user.role !== "Manager") {
    return NextResponse.json(
      {
        status: "error",
        message: "Forbidden",
      },
      { status: 403 }
    );
  }

  try {
    const users = await prisma.users.findMany({
      ...usersArgs,
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Users retrieved successfully",
        data: users,
      } as AxiosExtendedResponse<typeof users>,
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to retrieve products",
        error: (error as Error).name,
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { AxiosExtendedResponse } from "@/types/axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);

    // If no session, return unauthorized
    if (!session) {
      return NextResponse.json(
        {
          status: "error",
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const paymentMethods = await prisma.payments.findMany();

    return NextResponse.json(
      {
        status: "success",
        message: "Payment methods retrieved successfully",
        data: paymentMethods,
      } as AxiosExtendedResponse<typeof paymentMethods>,
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

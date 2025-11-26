import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get current timestamp
    const now = new Date();

    // Fetch discounts from the database
    const discounts = await prisma.discounts.findMany({
      where: {
        expiredAt: {
          gt: now,
        },
      },
    });

    // Return the discounts in the response
    return NextResponse.json(
      {
        status: "success",
        message: "Discounts retrieved successfully",
        data: discounts,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to retrieve discounts",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

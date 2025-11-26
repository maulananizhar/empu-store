import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Get parameters from the request URLA
    const { searchParams } = new URL(request.url);

    // Retrieve name from query parameters
    const name = searchParams.get("name") || "";

    // Fetch products from the database based on the provided parameters
    const categories = await prisma.categories.findMany({
      where: {
        name: {
          contains: name,
        },
      },
    });

    // Return the products in the response
    return NextResponse.json(
      {
        status: "success",
        message: "Categories retrieved successfully",
        data: categories,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to retrieve categories",
        error: (error as Error).name,
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { ProductsIcons, productsIcons } from "@/types/products";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Get parameters from the request URL
    const { searchParams } = new URL(request.url);

    // Retrieve name and categoryId from query parameters
    const name = searchParams.get("name") || "";
    const categoryId = searchParams.get("categoryId") || undefined;

    // Fetch products from the database based on the provided parameters
    const products = await prisma.products.findMany({
      relationLoadStrategy: "join",
      where: {
        name: {
          contains: name,
        },
        categoryId: categoryId ? Number(categoryId) : undefined,
      },
      ...productsIcons,
    });

    // Return the products in the response
    return NextResponse.json(
      {
        status: "success",
        message: "Products retrieved successfully",
        data: products as ProductsIcons[],
      },
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

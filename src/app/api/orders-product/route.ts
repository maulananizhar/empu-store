import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { z } from "zod";
import {
  ordersProductsExtended,
  OrdersProductsExtended,
} from "@/types/ordersProducts";

const prisma = new PrismaClient();

const schema = z.object({
  orderId: z.number(),
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const formData = await request.formData();

    // Validate the request fields
    const validatedFields = schema.safeParse({
      orderId: Number(formData.get("orderId")),
    });

    // Validate the request parameters
    if (!validatedFields.success) {
      return NextResponse.json(
        {
          status: "error",
          error: validatedFields.error.name,
          message: validatedFields.error.issues
            .map(issue => issue.message)
            .join(", "),
        },
        { status: 400 }
      );
    }

    // Fetch orders from the database based on the provided parameters
    const orders = await prisma.orders.findUnique({
      where: {
        orderId: validatedFields.data.orderId,
      },
      ...ordersProductsExtended,
    });

    // Return the orders in the response
    return NextResponse.json(
      {
        status: "success",
        message: "Orders products retrieved successfully",
        data: orders as OrdersProductsExtended,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          status: "error",
          error: error.name,
          message: "Invalid request data",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to retrieve orders products",
        error: (error as Error).name,
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

const schema = z.object({
  orderProductsId: z.number(),
  number: z.number(),
});

export async function PUT(request: Request) {
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

    // Parse the request body
    const formData = await request.formData();

    // Validate the request fields
    const validatedFields = schema.safeParse({
      orderProductsId: Number(formData.get("orderProductsId")),
      number: Number(formData.get("number")),
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

    // Get productId
    const productId = await prisma.ordersProducts.findUnique({
      where: {
        orderProductId: validatedFields.data.orderProductsId,
      },
    });

    if (!productId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    // Get current stock
    const productStock = await prisma.products.findUnique({
      where: {
        productId: productId?.productId,
      },
    });

    // Check if stock is sufficient
    if (
      productStock &&
      productStock.stock < validatedFields.data.number &&
      validatedFields.data.number > 0
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "Stok tidak mencukupi.",
        },
        { status: 400 }
      );
    }

    // Update the product quantity in the database
    const updatedOrdersProduct = await prisma.ordersProducts.updateMany({
      where: {
        orderProductId: validatedFields.data.orderProductsId,
      },
      data: {
        quantity: {
          increment: validatedFields.data.number,
        },
      },
    });

    const ordersProducts = await prisma.ordersProducts.findUnique({
      where: {
        orderProductId: validatedFields.data.orderProductsId,
      },
    });

    if (ordersProducts?.quantity === 0) {
      // Delete the ordersProducts entry if quantity is zero
      await prisma.ordersProducts.delete({
        where: {
          orderProductId: validatedFields.data.orderProductsId,
        },
      });
    }

    // Update the product stock in the database
    await prisma.products.update({
      where: { productId: productId.productId },
      data: {
        stock: {
          decrement: validatedFields.data.number,
        },
      },
    });

    // Return the updated orders product in the response
    return NextResponse.json(
      {
        status: "success",
        message: "Product quantity updated successfully.",
        data: updatedOrdersProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to process the request.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

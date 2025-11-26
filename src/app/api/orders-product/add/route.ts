import { PrismaClient } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import z from "zod";

const prisma = new PrismaClient();

const schema = z.object({
  orderId: z.number(),
  productId: z.number(),
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const formData = await request.formData();

    // Validate the request fields
    const validatedFields = schema.safeParse({
      orderId: Number(formData.get("orderId")),
      productId: Number(formData.get("productId")),
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

    // Check if product exists
    const product = await prisma.products.findUnique({
      where: {
        productId: validatedFields.data.productId,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          status: "error",
          message: "Produk tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // Check if order exists
    const order = await prisma.orders.findUnique({
      where: {
        orderId: validatedFields.data.orderId,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          status: "error",
          message: "Order tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // Check for duplicate entry
    const duplicateCheck = await prisma.ordersProducts.findFirst({
      where: {
        orderId: validatedFields.data.orderId,
        productId: validatedFields.data.productId,
      },
    });

    if (duplicateCheck) {
      const orderProduct = await prisma.ordersProducts.update({
        where: {
          orderProductId: duplicateCheck.orderProductId,
        },
        data: {
          quantity: { increment: 1 },
        },
      });

      // Update the product stock in the database
      await prisma.products.update({
        where: { productId: validatedFields.data.productId },
        data: {
          stock: {
            decrement: 1,
          },
        },
      });

      return NextResponse.json(
        {
          status: "success",
          message:
            "Produk sudah ditambahkan ke pesanan. Menambahkan jumlah menjadi 1.",
          data: orderProduct,
        },
        { status: 200 }
      );
    }

    // Get current stock
    const productStock = await prisma.products.findUnique({
      where: {
        productId: validatedFields.data.productId,
      },
    });

    // Check if stock is sufficient
    if (productStock && productStock.stock < 1) {
      return NextResponse.json(
        {
          status: "error",
          message: "Stok tidak mencukupi.",
        },
        { status: 400 }
      );
    }

    // Create new order product entry
    const orderProduct = await prisma.ordersProducts.create({
      data: {
        orderId: validatedFields.data.orderId,
        productId: validatedFields.data.productId,
        quantity: 1,
      },
    });

    // Update the product stock in the database
    await prisma.products.update({
      where: { productId: validatedFields.data.productId },
      data: {
        stock: {
          decrement: 1,
        },
      },
    });

    // Return the created order product
    return NextResponse.json(
      {
        status: "success",
        message: "Produk ditambahkan ke pesanan dengan sukses.",
        data: orderProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Terjadi kesalahan saat memproses permintaan.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

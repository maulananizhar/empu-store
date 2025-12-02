import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import z from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

const schema = z.object({
  orderId: z
    .number("Order ID harus berupa angka")
    .min(1, "Order ID tidak boleh kurang dari 1"),
  total: z
    .number("Total harus berupa angka")
    .min(0, "Total tidak boleh kurang dari 0"),
  cash: z
    .number("Cash harus berupa angka")
    .min(0, "Cash tidak boleh kurang dari 0"),
  methodId: z
    .number("Method ID harus berupa angka")
    .min(1, "Method ID tidak boleh kurang dari 1"),
  status: z.enum(["Sukses", "Gagal", "Pending"], "Status tidak valid"),
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
      orderId: Number(formData.get("orderId")),
      total: Number(formData.get("total")),
      cash: Number(formData.get("cash")),
      methodId: Number(formData.get("methodId")),
      status: String(formData.get("status")),
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

    // Check if the order exists
    const existingOrder = await prisma.orders.findUnique({
      where: {
        orderId: validatedFields.data.orderId,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        {
          status: "error",
          message: "Order tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Check if the payment method exists
    const existingPaymentMethod = await prisma.payments.findUnique({
      where: {
        paymentId: validatedFields.data.methodId,
      },
    });

    if (!existingPaymentMethod) {
      return NextResponse.json(
        {
          status: "error",
          message: "Metode pembayaran tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Ensure that cash is not less than total
    if (validatedFields.data.cash < validatedFields.data.total) {
      return NextResponse.json(
        {
          status: "error",
          message: "Uang pembayaran tidak boleh kurang dari total pembayaran",
        },
        { status: 400 }
      );
    }

    // Update the order in the database
    const updatedOrder = await prisma.orders.update({
      where: {
        orderId: validatedFields.data.orderId,
      },
      data: {
        total: validatedFields.data.total,
        cash: validatedFields.data.cash,
        methodId: validatedFields.data.methodId,
        status: validatedFields.data.status,
      },
    });

    // Return the updated order in the response
    return NextResponse.json(
      {
        status: "success",
        message: "Order updated successfully",
        data: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to update order",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

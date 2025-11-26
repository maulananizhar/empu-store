import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import z from "zod";

const prisma = new PrismaClient();

const schema = z.object({
  orderId: z.number(),
  total: z.number().min(0),
  cash: z.number().min(0),
  status: z.enum(["Sukses", "Gagal", "Pending"]),
});

export async function PUT(request: Request) {
  try {
    // Parse the request body
    const formData = await request.formData();

    // Validate the request fields
    const validatedFields = schema.safeParse({
      orderId: Number(formData.get("orderId")),
      total: Number(formData.get("total")),
      cash: Number(formData.get("cash")),
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

    // Update the order in the database
    const updatedOrder = await prisma.orders.update({
      where: {
        orderId: validatedFields.data.orderId,
      },
      data: {
        total: validatedFields.data.total,
        cash: validatedFields.data.cash,
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

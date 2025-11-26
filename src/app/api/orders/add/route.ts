import { PrismaClient } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import z from "zod";

const prisma = new PrismaClient();

const schema = z.object({
  cashierId: z.number(),
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const formData = await request.formData();

    // Validate the request fields
    const validatedFields = schema.safeParse({
      cashierId: Number(formData.get("cashierId")),
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

    // Create a new order in the database
    const newOrder = await prisma.orders.create({
      data: {
        cashierId: validatedFields.data.cashierId,
        methodId: 1, // Default methodId
        total: 0,
        cash: 0,
        status: "Pending",
      },
    });

    // Return the newly created order in the response
    return NextResponse.json(
      {
        status: "success",
        message: "Order berhasil dibuat.",
        data: newOrder,
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

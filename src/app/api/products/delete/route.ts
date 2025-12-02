import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import z from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

const schema = z.object({
  productId: z.number().min(1, "ID kategori tidak valid."),
});

export async function DELETE(request: Request) {
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

    // If the user is not a manager, return forbidden
    if (!session.user.role || session.user.role !== "Manager") {
      return NextResponse.json(
        {
          status: "error",
          message: "Forbidden",
        },
        { status: 403 }
      );
    }

    // Parse the request body
    const formData = await request.formData();
    // Validate the request fields
    const validatedFields = schema.safeParse({
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

    // Check if product on any orders
    const orderProductCount = await prisma.ordersProducts.count({
      where: {
        productId: validatedFields.data.productId,
      },
    });

    if (orderProductCount > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Produk tidak dapat dihapus karena terkait dengan pesanan.",
        },
        { status: 400 }
      );
    }

    // Delete the product from the database
    const data = await prisma.products.delete({
      where: {
        productId: validatedFields.data.productId,
      },
    });

    return NextResponse.json(
      {
        status: "success",
        message: `Produk ${data.name} berhasil dihapus.`,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Server error: Gagal menghapus kategori.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

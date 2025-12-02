import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

export async function GET() {
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

    // Fetch orders from the database based on the provided parameters
    const orders = await prisma.orders.findMany({
      include: {
        cashier: {
          select: {
            name: true,
          },
        },
        method: {
          select: {
            method: true,
          },
        },
      },
    });

    if (!orders) {
      return NextResponse.json(
        {
          status: "error",
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    // Return the orders in the response
    if (orders)
      return NextResponse.json(
        {
          status: "success",
          message: "Orders retrieved successfully",
          data: orders.map(order => ({
            orderId: order.orderId,
            cashierName: order.cashier.name,
            methodName: order.method.method,
            total: order.total,
            cash: order.cash,
            status: order.status,
            createdAt: order.createdAt,
          })),
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

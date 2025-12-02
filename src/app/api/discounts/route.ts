import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { Discounts, discountsExtended } from "@/types/discounts";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

export async function GET(request: Request) {
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

    // Get parameters from the request URL
    const { searchParams } = new URL(request.url);

    // Retrieve name from query parameters
    const dateRaw = searchParams.get("date") || "";
    const all = searchParams.get("all") === "false" ? false : true;

    // Validate date parameter
    if (!dateRaw || isNaN(Date.parse(dateRaw)) || dateRaw === "") {
      return NextResponse.json(
        {
          status: "error",
          message: "Tanggal tidak valid.",
        },
        { status: 400 }
      );
    }

    const date = new Date(dateRaw).toISOString();

    // Fetch discounts from the database
    const discounts = await prisma.discounts.findMany({
      where: all
        ? {}
        : {
            expiredAt: { gte: new Date(date) },
            createdAt: { lte: new Date(date) },
          },
      ...discountsExtended,
    });

    // Return the discounts in the response
    return NextResponse.json(
      {
        status: "success",
        message: "Discounts retrieved successfully",
        data: discounts as Discounts[],
        gt: date,
        lte: all ? new Date("3000-01-01") : date,
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

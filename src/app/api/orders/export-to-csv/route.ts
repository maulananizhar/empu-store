import { NextResponse } from "next/server";
import { json2csv } from "json-2-csv";

export async function GET() {
  try {
    const data = [
      { id: 1, name: "Alice", email: "alice@example.com" },
      { id: 2, name: "Bob", email: "bob@example.com" },
    ];

    const csv = json2csv(data);

    return NextResponse.json(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="transactions.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to update category",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

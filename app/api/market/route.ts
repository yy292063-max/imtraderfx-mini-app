import { NextResponse } from "next/server";
import { getMarketData } from "@/lib/market";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getMarketData();

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("MARKET API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        data: [],
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}
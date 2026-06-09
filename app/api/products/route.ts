import { NextResponse } from "next/server";
import { listProducts } from "@/lib/dropship";

export async function GET() {
  const products = await listProducts();

  return NextResponse.json({ products });
}

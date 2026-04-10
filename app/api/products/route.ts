import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const products = await prisma.product.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, price, stock, category, imageUrl } = body;

  if (!name || price == null || stock == null || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: { name, description, price: Number(price), stock: Number(stock), category, imageUrl },
  });

  await prisma.inventoryLog.create({
    data: { productId: product.id, quantityChange: product.stock, reason: "Initial stock" },
  });

  return NextResponse.json(product, { status: 201 });
}

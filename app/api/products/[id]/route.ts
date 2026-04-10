import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, price, stock, category, imageUrl } = body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const product = await prisma.product.update({
      where: { id },
      data: { name, description, price: Number(price), stock: Number(stock), category, imageUrl },
    });

    const diff = Number(stock) - existing.stock;
    if (diff !== 0) {
      await prisma.inventoryLog.create({
        data: { productId: id, quantityChange: diff, reason: "Manual adjustment" },
      });
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error("PUT /api/products/[id]", err);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.inventoryLog.deleteMany({ where: { productId: id } });
  await prisma.orderItem.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}

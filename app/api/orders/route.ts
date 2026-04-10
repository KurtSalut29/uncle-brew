import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { verifyToken } from "../../../lib/auth";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const orders = await prisma.order.findMany({
    where: {
      ...(from && to ? { createdAt: { gte: new Date(from), lte: new Date(to) } } : {}),
    },
    include: { items: { include: { product: true } }, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items } = await req.json() as {
    items: { productId: string; quantity: number }[];
  };

  if (!items?.length) return NextResponse.json({ error: "No items" }, { status: 400 });

  // Validate stock
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) return NextResponse.json({ error: `Product not found` }, { status: 404 });
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
    }
  }

  // Build order items with subtotals
  const orderItemsData = await Promise.all(
    items.map(async (item) => {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      return { productId: item.productId, quantity: item.quantity, subtotal: product!.price * item.quantity };
    })
  );

  const totalAmount = orderItemsData.reduce((sum, i) => sum + i.subtotal, 0);

  const order = await prisma.order.create({
    data: {
      userId: payload.id,
      totalAmount,
      items: { create: orderItemsData },
    },
    include: { items: { include: { product: true } } },
  });

  // Deduct stock and log
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
    await prisma.inventoryLog.create({
      data: { productId: item.productId, quantityChange: -item.quantity, reason: `Order #${order.id.slice(-6)}` },
    });
  }

  return NextResponse.json(order, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "sales";
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date(Date.now() - 30 * 86400000);
  const toRaw = searchParams.get("to") ? new Date(searchParams.get("to")!) : new Date();
  const to = new Date(toRaw);
  to.setHours(23, 59, 59, 999);

  const dateFilter = { createdAt: { gte: from, lte: to } };

  if (type === "summary") {
    const [orders, items] = await Promise.all([
      prisma.order.findMany({ where: dateFilter, select: { totalAmount: true } }),
      prisma.orderItem.findMany({
        where: { order: dateFilter },
        select: { quantity: true },
      }),
    ]);

    const totalSales = orders.reduce((s, o) => s + o.totalAmount, 0);
    const totalOrders = orders.length;
    const totalItems = items.reduce((s, i) => s + i.quantity, 0);
    const avgOrder = totalOrders ? totalSales / totalOrders : 0;

    return NextResponse.json({ totalSales, totalOrders, totalItems, avgOrder });
  }

  if (type === "daily") {
    const orders = await prisma.order.findMany({
      where: dateFilter,
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const byDay: Record<string, number> = {};
    for (const o of orders) {
      const day = o.createdAt.toISOString().slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + o.totalAmount;
    }

    return NextResponse.json(Object.entries(byDay).map(([date, total]) => ({ date, total })));
  }

  if (type === "products") {
    const items = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: { order: dateFilter },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { subtotal: "desc" } },
      take: 10,
    });

    const withNames = await Promise.all(
      items.map(async (i) => {
        const product = await prisma.product.findUnique({ where: { id: i.productId }, select: { name: true } });
        return { name: product?.name ?? "Unknown", quantity: i._sum.quantity ?? 0, revenue: i._sum.subtotal ?? 0 };
      })
    );

    return NextResponse.json(withNames);
  }

  if (type === "categories") {
    const items = await prisma.orderItem.findMany({
      where: { order: dateFilter },
      include: { product: { select: { category: true } } },
    });

    const byCategory: Record<string, number> = {};
    for (const item of items) {
      const cat = item.product.category;
      byCategory[cat] = (byCategory[cat] ?? 0) + item.subtotal;
    }

    return NextResponse.json(Object.entries(byCategory).map(([category, revenue]) => ({ category, revenue })));
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const [lowStockProducts, recentOrders, recentFeedbacks] = await Promise.all([
    prisma.product.findMany({
      where: { stock: { gt: 0, lte: 10 } },
      select: { id: true, name: true, stock: true },
      orderBy: { stock: "asc" },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      select: { id: true, totalAmount: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.feedback.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      select: { id: true, name: true, rating: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const STARS = ["", "★", "★★", "★★★", "★★★★", "★★★★★"];

  const notifications = [
    ...lowStockProducts.map((p) => ({
      id: `stock-${p.id}`,
      type: "stock" as const,
      title: "Low stock alert",
      body: `${p.name} has only ${p.stock} unit${p.stock === 1 ? "" : "s"} left.`,
      time: new Date().toISOString(),
      link: "/products",
    })),
    ...recentOrders.map((o) => ({
      id: `order-${o.id}`,
      type: "order" as const,
      title: "Order completed",
      body: `Order #${o.id.slice(-6).toUpperCase()} — ₱${o.totalAmount.toFixed(2)}`,
      time: o.createdAt.toISOString(),
      link: "/orders/history",
    })),
    ...recentFeedbacks.map((f) => ({
      id: `feedback-${f.id}`,
      type: "feedback" as const,
      title: "New feedback received",
      body: `${f.name} left a ${STARS[f.rating]} rating.`,
      time: f.createdAt.toISOString(),
      link: "/feedbacks",
    })),
  ];

  return NextResponse.json(notifications);
}

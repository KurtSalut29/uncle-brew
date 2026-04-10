import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(feedbacks);
}

export async function POST(req: NextRequest) {
  try {
    const { name, message, rating } = await req.json();
    if (!name || !message || !rating) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    const feedback = await prisma.feedback.create({
      data: { name, message, rating: Number(rating) },
    });
    return NextResponse.json(feedback, { status: 201 });
  } catch (err) {
    console.error("Feedback POST error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

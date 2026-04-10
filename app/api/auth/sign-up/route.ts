import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const existing = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (existing) {
      return NextResponse.json({ error: "Registration is disabled." }, { status: 403 });
    }

    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: "ADMIN" },
    });

    return NextResponse.json({ message: "Admin account created", id: user.id }, { status: 201 });
  } catch (e) {
    console.error("sign-up error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

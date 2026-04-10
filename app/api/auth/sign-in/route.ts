import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "../../../../lib/prisma";
import { signToken } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });

    const res = NextResponse.json({ message: "OK", user: { name: user.name, role: user.role } });
    res.cookies.set("token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (e) {
    console.error("sign-in error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import SignUpForm from "./SignUpForm";

export default async function SignUpPage() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (admin) redirect("/sign-in");
  return <SignUpForm />;
}

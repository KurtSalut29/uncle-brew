import { prisma } from "../../../lib/prisma";
import SignInForm from "./SignInForm";

export default async function SignInPage() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  return <SignInForm hasAdmin={!!admin} />;
}

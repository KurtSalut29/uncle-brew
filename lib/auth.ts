import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "milktea_secret_key_change_in_prod";

export type JwtPayload = {
  id: string;
  email: string;
  role: string;
  name: string;
};

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

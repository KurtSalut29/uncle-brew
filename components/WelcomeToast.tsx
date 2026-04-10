"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useToast } from "./ToastProvider";

export default function WelcomeToast() {
  const { toast } = useToast();
  const pathname = usePathname();

  useEffect(() => {
    const msg = localStorage.getItem("pendingToast");
    if (msg) {
      localStorage.removeItem("pendingToast");
      setTimeout(() => toast(msg, "success"), 400);
    }
  }, [pathname]);

  return null;
}

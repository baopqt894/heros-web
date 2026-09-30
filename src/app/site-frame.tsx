"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** A standalone art direction for v2; existing routes keep their shared chrome. */
export default function SiteFrame({ children, navigation, footer }: {
  children: ReactNode;
  navigation: ReactNode;
  footer: ReactNode;
}) {
  const standalone = usePathname() === "/v2";
  return <>{!standalone && navigation}{children}{!standalone && footer}</>;
}

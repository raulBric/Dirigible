import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { AccountShell } from "@/components/account/AccountViews";

export const metadata: Metadata = {
  title: { default: "Mi cuenta", template: "%s · Mi cuenta" },
  robots: { index: false },
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <ClientOnly>
      <AccountShell>{children}</AccountShell>
    </ClientOnly>
  );
}
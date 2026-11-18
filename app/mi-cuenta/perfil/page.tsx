import type { Metadata } from "next";
import { AccountProfile } from "@/components/account/AccountViews";

export const metadata: Metadata = { title: "Perfil y pasajeros" };

export default function Page() {
  return <AccountProfile />;
}
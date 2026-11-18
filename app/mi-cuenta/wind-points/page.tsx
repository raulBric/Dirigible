import type { Metadata } from "next";
import { AccountPoints } from "@/components/account/AccountViews";

export const metadata: Metadata = { title: "Wind Points" };

export default function Page() {
  return <AccountPoints />;
}
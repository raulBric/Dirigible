import type { Metadata } from "next";
import { AccountInvoices } from "@/components/account/AccountViews";

export const metadata: Metadata = { title: "Facturas" };

export default function Page() {
  return <AccountInvoices />;
}
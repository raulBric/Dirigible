import type { Metadata } from "next";
import { AccountBookings } from "@/components/account/AccountViews";

export const metadata: Metadata = { title: "Mis reservas" };

export default function Page() {
  return <AccountBookings />;
}
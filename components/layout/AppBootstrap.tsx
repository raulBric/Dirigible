"use client";

import { useEffect } from "react";
import { useApp } from "@/store/app";
import { buildDemoData } from "@/lib/bookings";

/** Crea una cuenta demo con reservas la primera vez que se abre la app. */
export function AppBootstrap() {
  useEffect(() => {
    const st = useApp.getState();
    if (!st.demoSeeded) {
      const { users, bookings } = buildDemoData();
      st.markDemoSeeded(users, bookings);
    }
  }, []);
  return null;
}

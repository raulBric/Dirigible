"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { uid } from "@/lib/random";
import type { B2BRequest, Booking, FrequentPassenger, User } from "@/lib/types";
import type { LocalOccupancy } from "@/lib/flights";

export type CookieConsent = { necessary: true; analytics: boolean; marketing: boolean; decidedAt: string } | null;

interface AppState {
  users: User[];
  currentUserId: string | null;
  bookings: Booking[];
  b2bRequests: B2BRequest[];
  cookieConsent: CookieConsent;
  demoSeeded: boolean;
}

interface AppActions {
  register: (u: Pick<User, "firstName" | "lastName" | "email" | "password" | "phone">) => { ok: true; user: User } | { ok: false; error: string };
  login: (email: string, password: string) => { ok: true; user: User } | { ok: false; error: string };
  logout: () => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  addPoints: (userId: string, points: number, description: string) => void;
  saveFrequentPassenger: (userId: string, p: Omit<FrequentPassenger, "id"> & { id?: string }) => void;
  removeFrequentPassenger: (userId: string, id: string) => void;
  addBooking: (b: Booking) => void;
  updateBooking: (locator: string, patch: Partial<Booking> | ((b: Booking) => Partial<Booking>)) => void;
  addB2BRequest: (r: B2BRequest) => void;
  setCookieConsent: (c: CookieConsent) => void;
  markDemoSeeded: (users: User[], bookings: Booking[]) => void;
}

export const useApp = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,
      bookings: [],
      b2bRequests: [],
      cookieConsent: null,
      demoSeeded: false,

      register: ({ firstName, lastName, email, password, phone }) => {
        const normalized = email.trim().toLowerCase();
        if (get().users.some((u) => u.email === normalized)) return { ok: false, error: "Ya existe una cuenta con este email. Inicia sesión." };
        const user: User = {
          id: uid("usr"),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: normalized,
          password,
          phone: phone.trim(),
          birthDate: "",
          docType: "DNI",
          docNumber: "",
          nationality: "Española",
          points: 250,
          lifetimePoints: 250,
          pointsHistory: [{ id: uid("pt"), date: new Date().toISOString(), description: "Bienvenida al programa Wind Points", points: 250 }],
          frequentPassengers: [],
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ users: [...s.users, user], currentUserId: user.id }));
        return { ok: true, user };
      },

      login: (email, password) => {
        const user = get().users.find((u) => u.email === email.trim().toLowerCase());
        if (!user || user.password !== password) return { ok: false, error: "Email o contraseña incorrectos." };
        set({ currentUserId: user.id });
        return { ok: true, user };
      },

      logout: () => set({ currentUserId: null }),

      updateUser: (id, patch) => set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),

      addPoints: (userId, points, description) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  points: Math.max(0, u.points + points),
                  lifetimePoints: points > 0 ? u.lifetimePoints + points : u.lifetimePoints,
                  pointsHistory: [{ id: uid("pt"), date: new Date().toISOString(), description, points }, ...u.pointsHistory],
                }
              : u,
          ),
        })),

      saveFrequentPassenger: (userId, p) =>
        set((s) => ({
          users: s.users.map((u) => {
            if (u.id !== userId) return u;
            const id = p.id ?? uid("fp");
            const entry = { ...p, id } as FrequentPassenger;
            const exists = u.frequentPassengers.some((x) => x.id === id);
            return { ...u, frequentPassengers: exists ? u.frequentPassengers.map((x) => (x.id === id ? entry : x)) : [...u.frequentPassengers, entry] };
          }),
        })),

      removeFrequentPassenger: (userId, id) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === userId ? { ...u, frequentPassengers: u.frequentPassengers.filter((x) => x.id !== id) } : u)),
        })),

      addBooking: (b) => set((s) => ({ bookings: [b, ...s.bookings] })),

      updateBooking: (locator, patch) =>
        set((s) => ({
          bookings: s.bookings.map((b) => (b.locator === locator ? { ...b, ...(typeof patch === "function" ? patch(b) : patch) } : b)),
        })),

      addB2BRequest: (r) => set((s) => ({ b2bRequests: [r, ...s.b2bRequests] })),

      setCookieConsent: (cookieConsent) => set({ cookieConsent }),

      markDemoSeeded: (users, bookings) =>
        set((s) => ({ users: [...s.users, ...users], bookings: [...s.bookings, ...bookings], demoSeeded: true })),
    }),
    { name: "dirigible-app", storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);

export const useCurrentUser = () => useApp((s) => s.users.find((u) => u.id === s.currentUserId) ?? null);

export function useLocalOccupancy() {
  const bookings = useApp((s) => s.bookings);
  return useMemo(() => localOccupancy(bookings), [bookings]);
}

/** Asientos ocupados por reservas activas guardadas en este navegador. */
export function localOccupancy(bookings: Booking[]): LocalOccupancy {
  const occ: LocalOccupancy = {};
  bookings
    .filter((b) => b.status === "confirmada")
    .forEach((b) =>
      b.legs.forEach((leg, li) => {
        const seats = (b.seats[li] ?? []).filter(Boolean) as string[];
        occ[leg.flightId] = [...(occ[leg.flightId] ?? []), ...seats];
      }),
    );
  return occ;
}

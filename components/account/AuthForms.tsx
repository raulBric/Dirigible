"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { LogIn, UserPlus } from "lucide-react";
import type { User } from "@/lib/types";
import { useApp } from "@/store/app";
import { validateEmail, validateName, validatePhone } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { TextField, focusFirstInvalid, useValidation } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { Notice } from "@/components/ui/Primitives";

export function LoginForm({ onSuccess }: { onSuccess?: (u: User) => void }) {
  const login = useApp((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const v = useValidation();
  const errors = { email: validateEmail(email), password: password ? null : "La contraseña es obligatoria." };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    v.setSubmitted(true);
    if (errors.email || errors.password) return focusFirstInvalid(e.currentTarget);
    const res = login(email, password);
    if (!res.ok) return setError(res.error);
    onSuccess?.(res.user);
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Notice tone="info">
        Cuenta de demostración: <strong>demo@dirigible.es</strong> / <strong>demo1234</strong>
      </Notice>
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => v.touch("email")}
        error={errors.email}
        showError={v.shouldShow("email")}
      />
      <TextField
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => v.touch("password")}
        error={errors.password}
        showError={v.shouldShow("password")}
      />
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" icon={<LogIn className="size-4" aria-hidden />}>
        Iniciar sesión
      </Button>
    </form>
  );
}

export function RegisterForm({ onSuccess }: { onSuccess?: (u: User) => void }) {
  const register = useApp((s) => s.register);
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const v = useValidation();
  const errors = {
    firstName: validateName(f.firstName, "El nombre"),
    lastName: validateName(f.lastName, "Los apellidos"),
    email: validateEmail(f.email),
    phone: validatePhone(f.phone),
    password: f.password.length >= 8 ? null : "La contraseña debe tener al menos 8 caracteres.",
  };
  const field = (k: keyof typeof f) => ({
    value: f[k],
    onChange: (e: ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value }),
    onBlur: () => v.touch(k),
    error: errors[k],
    showError: v.shouldShow(k),
    required: true,
  });

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    v.setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return focusFirstInvalid(e.currentTarget);
    const res = register(f);
    if (!res.ok) return setError(res.error);
    onSuccess?.(res.user);
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Nombre" autoComplete="given-name" {...field("firstName")} />
        <TextField label="Apellidos" autoComplete="family-name" {...field("lastName")} />
      </div>
      <TextField label="Email" type="email" autoComplete="email" {...field("email")} />
      <TextField label="Teléfono" type="tel" autoComplete="tel" {...field("phone")} />
      <TextField label="Contraseña" type="password" autoComplete="new-password" hint="Mínimo 8 caracteres." {...field("password")} />
      <p className="text-xs text-muted">Registro simulado: los datos se guardan solo en este navegador. Recibirás 250 Wind Points de bienvenida.</p>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" icon={<UserPlus className="size-4" aria-hidden />}>
        Crear cuenta
      </Button>
    </form>
  );
}

export function AuthTabs({ onSuccess, initial = "login" }: { onSuccess?: (u: User) => void; initial?: "login" | "register" }) {
  const [tab, setTab] = useState(initial);
  return (
    <div>
      <div className="mb-6 flex rounded-full bg-navy-50 p-1 text-sm font-semibold" role="group" aria-label="Acceso">
        {(
          [
            ["login", "Iniciar sesión"],
            ["register", "Crear cuenta"],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            type="button"
            aria-pressed={tab === k}
            onClick={() => setTab(k)}
            className={`flex-1 rounded-full px-4 py-2 transition ${tab === k ? "bg-white text-navy shadow-sm" : "text-muted hover:text-navy"}`}
          >
            {l}
          </button>
        ))}
      </div>
      {tab === "login" ? <LoginForm onSuccess={onSuccess} /> : <RegisterForm onSuccess={onSuccess} />}
    </div>
  );
}

export function LoginDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess?: (u: User) => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Accede a tu cuenta" description="Autocompleta tus datos y acumula Wind Points con esta reserva." size="sm">
      <AuthTabs
        onSuccess={(u) => {
          onSuccess?.(u);
          onClose();
        }}
      />
    </Modal>
  );
}

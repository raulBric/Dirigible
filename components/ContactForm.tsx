"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { validateEmail, validateName } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Checkbox, SelectField, TextArea, TextField, announce, focusFirstInvalid, useValidation } from "@/components/ui/Form";

export function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", topic: "Reservas", message: "", privacy: false });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const v = useValidation();
  const errors = {
    name: validateName(f.name, "El nombre"),
    email: validateEmail(f.email),
    message: f.message.trim().length >= 10 ? null : "Cuéntanos un poco más (mínimo 10 caracteres).",
    privacy: f.privacy ? null : "Debes aceptar la política de privacidad.",
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    v.setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return focusFirstInvalid(e.currentTarget);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      announce("Mensaje enviado. Te responderemos en 24 horas.", 0);
    }, 900);
  };

  if (sent) {
    return (
      <div role="status" className="text-center">
        <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden />
        <p className="mt-3 text-xl font-semibold text-navy">¡Gracias, {f.name.split(" ")[0]}!</p>
        <p className="mt-1 text-muted">Te responderemos en {f.email} en menos de 24 h (envío simulado).</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <TextField label="Nombre" autoComplete="name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} onBlur={() => v.touch("name")} error={errors.name} showError={v.shouldShow("name")} />
      <TextField label="Email" type="email" autoComplete="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} onBlur={() => v.touch("email")} error={errors.email} showError={v.shouldShow("email")} />
      <SelectField label="Motivo" wrapperClassName="sm:col-span-2" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })}>
        <option>Reservas</option>
        <option>Cambios y cancelaciones</option>
        <option>Empresas y eventos</option>
        <option>Wind Points</option>
        <option>Prensa</option>
        <option>Otro</option>
      </SelectField>
      <TextArea
        label="Mensaje"
        required
        rows={5}
        wrapperClassName="sm:col-span-2"
        value={f.message}
        onChange={(e) => setF({ ...f, message: e.target.value })}
        onBlur={() => v.touch("message")}
        error={errors.message}
        showError={v.shouldShow("message")}
      />
      <Checkbox
        className="sm:col-span-2"
        label="Acepto la política de privacidad"
        checked={f.privacy}
        onChange={(e) => setF({ ...f, privacy: e.target.checked })}
        error={errors.privacy}
        showError={v.shouldShow("privacy")}
      />
      <div className="sm:col-span-2">
        <Button type="submit" loading={loading} icon={<Send className="size-4" aria-hidden />}>
          Enviar mensaje
        </Button>
      </div>
    </form>
  );
}

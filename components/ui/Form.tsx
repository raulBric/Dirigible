"use client";

import { useCallback, useId, useState, type ComponentProps, type ReactNode } from "react";
import { AlertCircle, Minus, Plus } from "lucide-react";

/* ───────────── Anuncios para lectores de pantalla ───────────── */

let announceTimer: ReturnType<typeof setTimeout> | undefined;
/** Una única región aria-live de la página (#live-region en el layout). */
export function announce(text: string, delay = 500) {
  const region = typeof document !== "undefined" ? document.getElementById("live-region") : null;
  if (!region) return;
  clearTimeout(announceTimer);
  region.textContent = "";
  announceTimer = setTimeout(() => (region.textContent = text), delay);
}

/* ───────────── Estado de validación ───────────── */

/**
 * Muestra errores solo tras la interacción (blur) o tras un intento de envío,
 * para no anunciar errores antes de que el usuario escriba.
 */
export function useValidation() {
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const [submitted, setSubmitted] = useState(false);
  const touch = useCallback((name: string) => setTouched((t) => (t.has(name) ? t : new Set(t).add(name))), []);
  const shouldShow = useCallback((name: string) => submitted || touched.has(name), [submitted, touched]);
  const reset = useCallback(() => {
    setTouched(new Set());
    setSubmitted(false);
  }, []);
  return { touch, shouldShow, submitted, setSubmitted, reset };
}

/** Tras un envío fallido, lleva el foco al primer campo inválido para que se anuncie su error. */
export function focusFirstInvalid(root: ParentNode = document) {
  requestAnimationFrame(() => {
    const el = root.querySelector<HTMLElement>('[aria-invalid="true"]');
    el?.focus();
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  });
}

/* ───────────── Campos ───────────── */

interface FieldShellProps {
  label: ReactNode;
  error?: string | null;
  showError?: boolean;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
  children: (a11y: { id: string; "aria-invalid": boolean; "aria-describedby"?: string; "aria-required"?: boolean }) => ReactNode;
}

function FieldShell({ label, error, showError, hint, required, className = "", children }: FieldShellProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const visible = Boolean(showError && error);
  const describedBy = [hint ? hintId : null, visible ? errId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && (
          <span className="text-pink-700" aria-hidden>
            {" "}*
          </span>
        )}
      </label>
      {/* Las pistas de formato van encima del campo para que el teclado móvil no las tape */}
      {hint && (
        <p id={hintId} className="-mt-0.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {children({ id, "aria-invalid": visible, "aria-describedby": describedBy, "aria-required": required || undefined })}
      {visible && (
        <p id={errId} className="flex items-start gap-1.5 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "field-input w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink shadow-sm transition-colors placeholder:text-gray-400 hover:border-navy/40 focus:border-navy focus:outline-none focus-visible:outline-2 focus-visible:outline-navy disabled:bg-gray-50";

type BaseProps = { label: ReactNode; error?: string | null; showError?: boolean; hint?: ReactNode; wrapperClassName?: string };

export function TextField({ label, error, showError, hint, wrapperClassName, required, className = "", ...rest }: BaseProps & ComponentProps<"input">) {
  return (
    <FieldShell label={label} error={error} showError={showError} hint={hint} required={required} className={wrapperClassName}>
      {(a11y) => <input className={`${inputClass} ${className}`} {...a11y} {...rest} />}
    </FieldShell>
  );
}

export function SelectField({ label, error, showError, hint, wrapperClassName, required, className = "", children, ...rest }: BaseProps & ComponentProps<"select">) {
  return (
    <FieldShell label={label} error={error} showError={showError} hint={hint} required={required} className={wrapperClassName}>
      {(a11y) => (
        <select className={`${inputClass} pr-8 ${className}`} {...a11y} {...rest}>
          {children}
        </select>
      )}
    </FieldShell>
  );
}

export function TextArea({ label, error, showError, hint, wrapperClassName, required, className = "", ...rest }: BaseProps & ComponentProps<"textarea">) {
  return (
    <FieldShell label={label} error={error} showError={showError} hint={hint} required={required} className={wrapperClassName}>
      {(a11y) => <textarea className={`${inputClass} min-h-24 ${className}`} {...a11y} {...rest} />}
    </FieldShell>
  );
}

export function Checkbox({
  label,
  description,
  error,
  showError,
  className = "",
  ...rest
}: { label: ReactNode; description?: ReactNode; error?: string | null; showError?: boolean } & ComponentProps<"input">) {
  const id = useId();
  const visible = Boolean(showError && error);
  return (
    <div className={className}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-xl p-1 text-[15px]">
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-navy"
          aria-invalid={visible}
          aria-describedby={visible ? `${id}-err` : description ? `${id}-desc` : undefined}
          {...rest}
        />
        <span>
          <span className="font-medium text-ink">{label}</span>
          {description && (
            <span id={`${id}-desc`} className="block text-sm text-muted">
              {description}
            </span>
          )}
        </span>
      </label>
      {visible && (
        <p id={`${id}-err`} className="ml-9 flex items-center gap-1.5 text-sm text-danger">
          <AlertCircle className="size-4" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

export function Counter({
  label,
  description,
  value,
  min = 0,
  max = 9,
  onChange,
}: {
  label: string;
  description?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-2" role="group" aria-labelledby={`${id}-l`}>
      <div>
        <p id={`${id}-l`} className="font-medium text-ink">
          {label}
        </p>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="grid size-9 place-items-center rounded-full ring-1 ring-navy/25 text-navy transition hover:bg-navy-50 disabled:opacity-35"
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          aria-label={`Quitar ${label.toLowerCase()}`}
        >
          <Minus className="size-4" aria-hidden />
        </button>
        <output className="w-5 text-center text-lg font-semibold tabular-nums text-navy" aria-live="polite" aria-label={`${label}: ${value}`}>
          {value}
        </output>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-full ring-1 ring-navy/25 text-navy transition hover:bg-navy-50 disabled:opacity-35"
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          aria-label={`Añadir ${label.toLowerCase()}`}
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

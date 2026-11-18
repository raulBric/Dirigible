"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Diálogo modal nativo (<dialog> + showModal): el navegador gestiona foco, inercia de la página,
 * Esc y la devolución del foco al botón que lo abrió.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  dismissible?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const handleClose = () => onClose();
    const handleCancel = (e: Event) => {
      if (!dismissible) e.preventDefault();
    };
    d.addEventListener("close", handleClose);
    d.addEventListener("cancel", handleCancel);
    return () => {
      d.removeEventListener("close", handleClose);
      d.removeEventListener("cancel", handleCancel);
    };
  }, [onClose, dismissible]);

  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" };

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-t`}
      aria-describedby={description ? `${id}-d` : undefined}
      {...({ closedby: dismissible ? "any" : "none" } as Record<string, string>)}
      className={`m-auto w-[calc(100%-2rem)] ${widths[size]} rounded-3xl bg-white p-0 text-ink shadow-[var(--shadow-lift)]`}
    >
      {open && (
        <div className="p-6 sm:p-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 id={`${id}-t`} className="text-xl text-navy sm:text-2xl">
                {title}
              </h2>
              {description && (
                <p id={`${id}-d`} className="mt-1 text-sm text-muted">
                  {description}
                </p>
              )}
            </div>
            {dismissible && (
              <button
                type="button"
                onClick={() => ref.current?.close()}
                className="grid size-10 shrink-0 place-items-center rounded-full text-muted transition hover:bg-navy-50 hover:text-navy"
                aria-label="Cerrar"
              >
                <X className="size-5" aria-hidden />
              </button>
            )}
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

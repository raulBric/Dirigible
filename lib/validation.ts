import { ageOn, todayISO, type ISODate } from "./dates";
import type { DocType, PassengerType } from "./types";

const DNI_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";

export const required = (v: string, label = "Este campo") => (v.trim() ? null : `${label} es obligatorio.`);

export function validateName(v: string, label: string) {
  if (!v.trim()) return `${label} es obligatorio.`;
  if (!/^[\p{L}\p{M}' .-]{2,}$/u.test(v.trim())) return `${label} solo puede contener letras, espacios, guiones o apóstrofos.`;
  return null;
}

export function validateEmail(v: string) {
  if (!v.trim()) return "El email es obligatorio.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return "Introduce un email válido, por ejemplo nombre@dominio.es.";
  return null;
}

export function validatePhone(v: string) {
  const digits = v.replace(/[\s().-]/g, "");
  if (!digits) return "El teléfono es obligatorio.";
  if (!/^\+?\d{9,15}$/.test(digits)) return "Introduce un teléfono válido (9 a 15 dígitos, con prefijo opcional).";
  return null;
}

export function validateDocument(type: DocType, raw: string) {
  const v = raw.trim().toUpperCase().replace(/[\s-]/g, "");
  if (!v) return "El número de documento es obligatorio.";
  if (type === "DNI") {
    if (!/^\d{8}[A-Z]$/.test(v)) return "El DNI debe tener 8 números y una letra (p. ej. 12345678Z).";
    if (DNI_LETTERS[Number(v.slice(0, 8)) % 23] !== v[8]) return "La letra del DNI no es correcta.";
  } else if (type === "NIE") {
    if (!/^[XYZ]\d{7}[A-Z]$/.test(v)) return "El NIE debe empezar por X, Y o Z, seguido de 7 números y una letra.";
    const num = "XYZ".indexOf(v[0]) + v.slice(1, 8);
    if (DNI_LETTERS[Number(num) % 23] !== v[8]) return "La letra del NIE no es correcta.";
  } else if (!/^[A-Z0-9]{6,9}$/.test(v)) {
    return "El pasaporte debe tener entre 6 y 9 letras o números.";
  }
  return null;
}

export function validateBirthDate(v: ISODate | "", type: PassengerType, travelDate: ISODate | null) {
  if (!v) return "La fecha de nacimiento es obligatoria.";
  if (v > todayISO()) return "La fecha de nacimiento no puede ser futura.";
  const age = ageOn(v, travelDate ?? todayISO());
  if (age > 120) return "Revisa el año de nacimiento.";
  if (type === "adult" && age < 12) return "Un adulto debe tener 12 años o más el día del vuelo.";
  if (type === "child" && (age < 2 || age > 11)) return "Un niño debe tener entre 2 y 11 años el día del vuelo.";
  if (type === "infant" && age >= 2) return "Un bebé debe tener menos de 2 años el día del vuelo.";
  return null;
}

/** NIF de empresa (CIF) o NIF de persona física/NIE. Validación de formato. */
export function validateTaxId(raw: string) {
  const v = raw.trim().toUpperCase().replace(/[\s-]/g, "");
  if (!v) return "El NIF es obligatorio.";
  if (/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(v)) return null;
  if (!validateDocument("DNI", v) || !validateDocument("NIE", v)) return null;
  return "Introduce un NIF válido (p. ej. B12345678).";
}

export function luhn(num: string) {
  const digits = num.replace(/\D/g, "");
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return digits.length > 0 && sum % 10 === 0;
}

export function validateCardNumber(v: string) {
  const digits = v.replace(/\s/g, "");
  if (!digits) return "El número de tarjeta es obligatorio.";
  if (!/^\d{13,19}$/.test(digits)) return "El número de tarjeta debe tener entre 13 y 19 dígitos.";
  if (!luhn(digits)) return "El número de tarjeta no es válido. Revisa los dígitos.";
  return null;
}

export function validateExpiry(v: string) {
  const m = v.trim().match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!m) return "Usa el formato MM/AA.";
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return "El mes debe estar entre 01 y 12.";
  const now = new Date();
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) return "La tarjeta está caducada.";
  return null;
}

export function validateCvc(v: string) {
  if (!/^\d{3,4}$/.test(v.trim())) return "El código de seguridad tiene 3 o 4 dígitos.";
  return null;
}

export function formatCardNumber(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

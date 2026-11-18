"use client";

import { AIRPORTS, B2B, BRAND, CANCELLATION_POLICY, MENUS, PRICING } from "@/config/site";
import { addMinutesToTime, dateTime, formatDateLong, formatDateNumeric } from "./dates";
import type { B2BRequest, Booking } from "./types";

const NAVY: [number, number, number] = [31, 56, 100];
const PINK: [number, number, number] = [244, 114, 182];
const AMBER: [number, number, number] = [245, 158, 11];

/** Las fuentes estándar de PDF no incluyen "€" ni "→": usamos texto equivalente. */
const pdfEUR = (n: number) =>
  `${new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} EUR`;

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ───────────── Calendario (.ics) ───────────── */

const icsDate = (d: Date) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;

const icsEscape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function downloadICS(b: Booking) {
  const stamp = icsDate(new Date());
  const events = b.legs.map((leg, i) => {
    const start = dateTime(leg.date, leg.departure);
    const end = dateTime(leg.date, leg.arrival);
    return [
      "BEGIN:VEVENT",
      `UID:${b.locator}-${i}@dirigible.demo`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=Europe/Madrid:${icsDate(start)}`,
      `DTEND;TZID=Europe/Madrid:${icsDate(end)}`,
      `SUMMARY:${icsEscape(`Vuelo en dirigible ${AIRPORTS[leg.origin].city} → ${AIRPORTS[leg.destination].city} (${b.locator})`)}`,
      `LOCATION:${icsEscape(AIRPORTS[leg.origin].name)}`,
      `DESCRIPTION:${icsEscape(`Localizador ${b.locator}. Puerta ${leg.gate}. El embarque cierra ${CANCELLATION_POLICY.boardingClosesMin} min antes de la salida. ${BRAND.disclaimer}.`)}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT3H",
      "ACTION:DISPLAY",
      "DESCRIPTION:Tu vuelo en dirigible sale en 3 horas",
      "END:VALARM",
      "END:VEVENT",
    ].join("\r\n");
  });
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Dirigible demo//ES", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR"].join("\r\n");
  downloadBlob(new Blob([ics], { type: "text/calendar;charset=utf-8" }), `vuelo-${b.locator}.ics`);
}

/* ───────────── PDF ───────────── */

async function newDoc(orientation: "p" | "l" = "p") {
  const { jsPDF } = await import("jspdf");
  return new jsPDF({ orientation, unit: "mm", format: "a4" });
}

function header(doc: import("jspdf").jsPDF, title: string) {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, w, 28, "F");
  doc.setFillColor(...PINK);
  doc.rect(0, 28, w / 2, 1.5, "F");
  doc.setFillColor(...AMBER);
  doc.rect(w / 2, 28, w / 2, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(BRAND.name, 14, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(title, 14, 21);
  doc.setTextColor(30, 30, 30);
}

function footer(doc: import("jspdf").jsPDF) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`${BRAND.disclaimer}. Documento generado con fines de demostración.`, w / 2, h - 8, { align: "center" });
  doc.setTextColor(30, 30, 30);
}

export async function downloadBoardingPasses(b: Booking, legIndexes?: number[]) {
  const QRCode = await import("qrcode");
  const doc = await newDoc();
  const w = doc.internal.pageSize.getWidth();
  let first = true;
  const legs = legIndexes ?? b.legs.map((_, i) => i);
  for (const li of legs) {
    const leg = b.legs[li];
    for (let pi = 0; pi < b.passengers.length; pi++) {
      const p = b.passengers[pi];
      if (!first) doc.addPage();
      first = false;
      header(doc, "Tarjeta de embarque");
      const seatedIndex = b.passengers.slice(0, pi + 1).filter((x) => x.type !== "infant").length - 1;
      const seat = p.type === "infant" ? "En brazos" : (b.seats[li]?.[seatedIndex] ?? "Asignación en puerta");
      const boarding = addMinutesToTime(leg.departure, -CANCELLATION_POLICY.boardingStartsMin);
      const closes = addMinutesToTime(leg.departure, -CANCELLATION_POLICY.boardingClosesMin);

      doc.setDrawColor(220, 220, 230);
      doc.roundedRect(12, 38, w - 24, 120, 6, 6);

      doc.setFontSize(9);
      doc.setTextColor(110, 110, 120);
      doc.text("PASAJERO", 20, 50);
      doc.text("LOCALIZADOR", 130, 50);
      doc.setFontSize(14);
      doc.setTextColor(...NAVY);
      doc.setFont("helvetica", "bold");
      doc.text(`${p.lastName.toUpperCase()}, ${p.firstName}`, 20, 57);
      doc.text(b.locator, 130, 57);

      doc.setFontSize(30);
      doc.text(AIRPORTS[leg.origin].code, 20, 78);
      doc.text(AIRPORTS[leg.destination].code, 90, 78);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 70);
      doc.text(AIRPORTS[leg.origin].name, 20, 85);
      doc.text(AIRPORTS[leg.destination].name, 90, 85);
      doc.setDrawColor(...PINK);
      doc.setLineDashPattern([1.5, 1.5], 0);
      doc.line(52, 72, 86, 72);
      doc.setLineDashPattern([], 0);

      const cells: [string, string][] = [
        ["FECHA", formatDateNumeric(leg.date)],
        ["SALIDA", leg.departure],
        ["PUERTA", leg.gate],
        ["EMBARQUE", boarding],
        ["CIERRE", closes],
        ["ASIENTO", seat],
      ];
      cells.forEach(([k, v], i) => {
        const x = 20 + (i % 3) * 40;
        const y = 102 + Math.floor(i / 3) * 20;
        doc.setFontSize(8);
        doc.setTextColor(110, 110, 120);
        doc.text(k, x, y);
        doc.setFontSize(13);
        doc.setTextColor(...NAVY);
        doc.setFont("helvetica", "bold");
        doc.text(v, x, y + 7);
        doc.setFont("helvetica", "normal");
      });

      const qr = await QRCode.toDataURL(`${b.locator}|${leg.flightId}|${p.lastName}|${seat}`, { margin: 1, width: 300 });
      doc.addImage(qr, "PNG", 145, 92, 45, 45);
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 120);
      doc.text("Muestra este código en la puerta", 167.5, 142, { align: "center" });

      doc.setFontSize(9);
      doc.setTextColor(60, 60, 70);
      const notes = [
        `El embarque cierra ${CANCELLATION_POLICY.boardingClosesMin} minutos antes de la salida (${closes}).`,
        "Lleva tu documento de identidad original. Equipaje de cabina incluido: 1 maleta de 10 kg y 1 bolso.",
        p.assistance ? "Asistencia para movilidad reducida solicitada: preséntate en el mostrador de atención." : "",
      ].filter(Boolean);
      doc.text(notes, 20, 170);
      footer(doc);
    }
  }
  doc.save(`tarjeta-embarque-${b.locator}.pdf`);
}

export async function downloadInvoice(b: Booking) {
  const doc = await newDoc();
  const w = doc.internal.pageSize.getWidth();
  header(doc, b.invoice ? "Factura" : "Factura simplificada");
  doc.setFontSize(10);
  doc.text([`${BRAND.legalName}`, `CIF ${BRAND.cif}`, BRAND.address], 14, 40);
  doc.text([`Nº factura: F-${b.locator}`, `Fecha: ${formatDateNumeric(b.createdAt.slice(0, 10))}`, `Localizador: ${b.locator}`], w - 14, 40, { align: "right" });

  let y = 62;
  doc.setFont("helvetica", "bold");
  doc.text("Cliente", 14, y);
  doc.setFont("helvetica", "normal");
  const client = b.invoice
    ? [b.invoice.companyName, `NIF ${b.invoice.nif}`, b.invoice.address]
    : [`${b.passengers[0].firstName} ${b.passengers[0].lastName}`, b.contact.email];
  doc.text(client, 14, y + 6);
  y += 28;

  doc.setFillColor(245, 243, 255);
  doc.rect(14, y - 5, w - 28, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Concepto", 16, y);
  doc.text("Importe", w - 16, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  y += 9;
  b.quote.lines.forEach((l) => {
    doc.text(`${l.label}${l.detail ? ` (${l.detail.replace("→", "-")})` : ""}`, 16, y);
    doc.text(pdfEUR(l.amount), w - 16, y, { align: "right" });
    y += 7;
  });
  y += 4;
  doc.line(14, y, w - 14, y);
  y += 8;
  const totals: [string, number][] = [
    ["Base imponible", b.quote.taxBase],
    [`IVA (${PRICING.vatRate * 100} %)`, b.quote.vat],
    ["Total", b.quote.total],
  ];
  totals.forEach(([k, v], i) => {
    if (i === 2) doc.setFont("helvetica", "bold");
    doc.text(k, w - 70, y);
    doc.text(pdfEUR(v), w - 16, y, { align: "right" });
    y += 7;
  });
  doc.setFont("helvetica", "normal");
  if (b.refundAmount > 0) {
    y += 4;
    doc.text(`Reembolsado: ${pdfEUR(b.refundAmount)}`, w - 16, y, { align: "right" });
  }
  y += 12;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 110);
  doc.text(`Forma de pago: ${b.paymentMethod} (simulado). Empresa ficticia: este documento no tiene validez fiscal.`, 14, y);
  footer(doc);
  doc.save(`factura-${b.locator}.pdf`);
}

export async function downloadB2BProposal(r: B2BRequest) {
  const doc = await newDoc();
  const w = doc.internal.pageSize.getWidth();
  header(doc, "Propuesta para empresas (resumen)");
  const format = B2B.formats[r.format];
  const event = B2B.eventTypes.find((e) => e.id === r.eventType)?.label ?? r.eventType;
  doc.setFontSize(10);
  doc.text(`Referencia: ${r.id.toUpperCase()}  ·  ${formatDateNumeric(r.createdAt.slice(0, 10))}`, 14, 40);

  const rows: [string, string][] = [
    ["Empresa", `${r.company.name} (NIF ${r.company.nif})`],
    ["Contacto", `${r.contact.name}${r.contact.role ? `, ${r.contact.role}` : ""} · ${r.contact.email} · ${r.contact.phone}`],
    ["Tipo de evento", event],
    ["Formato", `${format.label} · ${r.roundTrip ? "Ida y vuelta" : "Solo ida"}`],
    ["Fecha preferida", r.preferredDate ? formatDateLong(r.preferredDate) : "Por definir"],
    ["Fecha alternativa", r.alternativeDate ? formatDateLong(r.alternativeDate) : "Por definir"],
    ["Invitados", String(r.guests)],
    ["Menú a medida", r.customMenu ? "Sí" : "No"],
    ["Branding a bordo", r.branding ? "Sí" : "No"],
    ["Traslados", r.transfers ? "Sí" : "No"],
  ];
  let y = 54;
  rows.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold");
    doc.text(k, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(v, w - 80), 64, y);
    y += 9;
  });
  if (r.notes) {
    doc.setFont("helvetica", "bold");
    doc.text("Comentarios", 14, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(r.notes, w - 80);
    doc.text(lines, 64, y);
    y += lines.length * 5 + 4;
  }
  y += 6;
  doc.setFillColor(253, 242, 248);
  doc.roundedRect(14, y, w - 28, 22, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...NAVY);
  doc.text(`Estimación: ${pdfEUR(r.estimate)} (IVA incluido)`, 20, y + 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 100);
  doc.text(
    doc.splitTextToSize(
      "Estimación orientativa sujeta a disponibilidad y meteorología. Un gestor comercial te contactará en 24 h con la propuesta definitiva. " +
        `Menús disponibles: ${MENUS.map((m) => m.name).join(", ")}.`,
      w - 28,
    ),
    14,
    y + 32,
  );
  footer(doc);
  doc.save(`propuesta-${r.id}.pdf`);
}

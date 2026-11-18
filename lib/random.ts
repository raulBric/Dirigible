/** Generador pseudoaleatorio determinista: el mismo vuelo siempre tiene la misma ocupación. */
export function hashString(str: string): number {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  return (h1 >>> 0);
}

export function seededRandom(seed: string) {
  let a = hashString(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LOCATOR_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Localizador de 6 caracteres sin caracteres ambiguos (0/O, 1/I). */
export function generateLocator(existing: string[] = []): string {
  let code = "";
  do {
    const bytes = new Uint32Array(6);
    crypto.getRandomValues(bytes);
    code = Array.from(bytes, (b) => LOCATOR_CHARS[b % LOCATOR_CHARS.length]).join("");
  } while (existing.includes(code));
  return code;
}

export function uid(prefix = "id"): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

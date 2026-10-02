// Canonical room normalization utilities to ensure all peers join the exact same room

export function normalizeRoomId(input: string): string {
  if (!input) return '';
  let cleaned = input.trim().toLowerCase();

  // If user pasted a full URL (e.g. https://.../?room=abc-defg-hij or .../abc-defg-hij)
  if (cleaned.includes('room=')) {
    cleaned = cleaned.split('room=')[1].split('&')[0];
  } else if (cleaned.includes('/')) {
    cleaned = cleaned.split('/').pop() || cleaned;
  }

  // Remove non-alphanumeric characters except hyphens
  cleaned = cleaned.replace(/[^a-z0-9-]/g, '');

  // If 10 alphanumeric characters without hyphens (e.g. "abcdefghij"), format as "abc-defg-hij"
  if (/^[a-z0-9]{10}$/.test(cleaned)) {
    cleaned = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 10)}`;
  }

  return cleaned;
}

export function generateRoomId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const seg = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${seg(3)}-${seg(4)}-${seg(3)}`;
}

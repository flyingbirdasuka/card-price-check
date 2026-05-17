import type { CardLookup, CardType, VintedSuggestion } from "./types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function lookupCard(
  card_type: CardType,
  card_name: string,
  card_number: string
): Promise<CardLookup> {
  return request("/api/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ card_type, card_name, card_number }),
  });
}

export async function scanPhoto(file: File): Promise<{
  card_type: CardType;
  card_name: string;
  card_number: string;
}> {
  const form = new FormData();
  form.append("file", file);
  return request("/api/ai/scan-photo", { method: "POST", body: form });
}

export async function getHistory(): Promise<CardLookup[]> {
  return request("/api/history");
}

export async function updateLookup(
  id: string,
  patch: { my_price?: number; notes?: string }
): Promise<CardLookup> {
  return request(`/api/history/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

export async function deleteLookup(id: string): Promise<void> {
  await request(`/api/history/${id}`, { method: "DELETE" });
}

export async function vintedSuggest(
  lookup_id: string,
  my_price: number,
  condition: string
): Promise<VintedSuggestion> {
  return request("/api/ai/vinted-suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lookup_id, my_price, condition }),
  });
}

export async function translateCardName(card_name: string, card_type: CardType): Promise<string> {
  const res = await request<{ english_name: string }>("/api/ai/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ card_name, card_type }),
  });
  return res.english_name;
}

export function exportCsvUrl(): string {
  return `${BASE}/api/export`;
}

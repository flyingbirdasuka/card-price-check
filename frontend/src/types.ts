export type CardType = "pokemon" | "yugioh";

export interface CardUrls {
  pricecharting: string;
  cardmarket: string;
  ebay: string;
}

export interface VintedSuggestion {
  suggested_price: number;
  price_range: { low: number; high: number };
  reasoning: string;
}

export interface CardLookup {
  id: string;
  card_type: CardType;
  card_name: string;
  card_number: string;
  urls: CardUrls;
  my_price: number | null;
  currency: string;
  vinted_suggestion: VintedSuggestion | null;
  notes: string | null;
  created_at: string;
}

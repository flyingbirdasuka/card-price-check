import { CardLookup } from "../types";

interface Props {
  lookup: CardLookup;
}

const LINKS = [
  { key: "pricecharting", label: "PriceCharting", emoji: "💰", color: "bg-amber-50 border-amber-200 hover:bg-amber-100" },
  { key: "cardmarket", label: "Cardmarket", emoji: "🃏", color: "bg-blue-50 border-blue-200 hover:bg-blue-100" },
  { key: "ebay", label: "eBay (sold)", emoji: "🛒", color: "bg-red-50 border-red-200 hover:bg-red-100" },
] as const;

export default function ResultCard({ lookup }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mr-2 ${
            lookup.card_type === "pokemon"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-purple-100 text-purple-700"
          }`}>
            {lookup.card_type === "pokemon" ? "Pokémon" : "Yu-Gi-Oh!"}
          </span>
          <h3 className="inline text-base font-semibold text-gray-800">
            {lookup.card_name}
          </h3>
          {lookup.card_number && (
            <span className="text-gray-400 text-sm ml-2">#{lookup.card_number}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {LINKS.map(({ key, label, emoji, color }) => (
          <a
            key={key}
            href={lookup.urls[key]}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-medium transition-colors ${color}`}
          >
            <span>{emoji}</span>
            <span>{label}</span>
            <span className="ml-auto text-gray-400">↗</span>
          </a>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Check condition-based prices on each site, then use "Vinted Suggest" in the history to get a listing price.
      </p>
    </div>
  );
}

import { useState } from "react";
import { vintedSuggest, updateLookup } from "../api";
import type { CardLookup, VintedSuggestion } from "../types";

interface Props {
  lookup: CardLookup;
  onClose: () => void;
  onSaved: (updated: CardLookup) => void;
}

const CONDITIONS = ["Near Mint", "Lightly Played", "Moderately Played", "Heavily Played", "Damaged"];

export default function VintedModal({ lookup, onClose, onSaved }: Props) {
  const [myPrice, setMyPrice] = useState(lookup.my_price?.toString() ?? "");
  const [condition, setCondition] = useState("Near Mint");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<VintedSuggestion | null>(
    lookup.vinted_suggestion
  );
  const [error, setError] = useState("");

  async function handleSuggest() {
    const price = parseFloat(myPrice);
    if (isNaN(price) || price <= 0) {
      setError("Enter a valid market price first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await vintedSuggest(lookup.id, price, condition);
      setSuggestion(result);
      const updated = await updateLookup(lookup.id, { my_price: price });
      onSaved({ ...updated, vinted_suggestion: result });
    } catch {
      setError("AI suggestion failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-800">{lookup.card_name}</h2>
            <p className="text-sm text-gray-400">{lookup.card_type} {lookup.card_number && `· #${lookup.card_number}`}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Market price you found (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={myPrice}
              onChange={(e) => setMyPrice(e.target.value)}
              placeholder="e.g. 25.00"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {CONDITIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSuggest}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Asking AI…" : "Get Vinted Price Suggestion"}
          </button>
        </div>

        {suggestion && (
          <div className="mt-5 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-2">AI Suggestion</p>
            <p className="text-3xl font-bold text-indigo-700 mb-1">
              €{suggestion.suggested_price.toFixed(2)}
            </p>
            <p className="text-sm text-indigo-500 mb-3">
              Range: €{suggestion.price_range.low.toFixed(2)} – €{suggestion.price_range.high.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">{suggestion.reasoning}</p>
          </div>
        )}
      </div>
    </div>
  );
}

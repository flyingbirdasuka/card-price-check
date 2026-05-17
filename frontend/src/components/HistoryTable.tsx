import { useState } from "react";
import { updateLookup, deleteLookup, exportCsvUrl } from "../api";
import type { CardLookup } from "../types";
import VintedModal from "./VintedModal";

interface Props {
  lookups: CardLookup[];
  onChange: (lookups: CardLookup[]) => void;
}

export default function HistoryTable({ lookups, onChange }: Props) {
  const [editingPrice, setEditingPrice] = useState<{ id: string; value: string } | null>(null);
  const [vintedTarget, setVintedTarget] = useState<CardLookup | null>(null);

  async function savePrice(id: string, value: string) {
    const price = parseFloat(value);
    if (isNaN(price)) { setEditingPrice(null); return; }
    const updated = await updateLookup(id, { my_price: price });
    onChange(lookups.map((l) => (l.id === id ? updated : l)));
    setEditingPrice(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this lookup?")) return;
    await deleteLookup(id);
    onChange(lookups.filter((l) => l.id !== id));
  }

  function handleVintedSaved(updated: CardLookup) {
    onChange(lookups.map((l) => (l.id === updated.id ? updated : l)));
    setVintedTarget(null);
  }

  if (lookups.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-2">🃏</p>
        <p>No lookups yet — search for a card above.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-gray-500">{lookups.length} card{lookups.length !== 1 ? "s" : ""}</p>
        <a
          href={exportCsvUrl()}
          download
          className="text-sm text-indigo-600 hover:underline font-medium"
        >
          ↓ Export CSV
        </a>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Card</th>
              <th className="px-4 py-3">Links</th>
              <th className="px-4 py-3">My Price</th>
              <th className="px-4 py-3">Vinted</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {lookups.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                  {new Date(l.created_at).toLocaleDateString("nl-NL")}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    l.card_type === "pokemon"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-purple-100 text-purple-700"
                  }`}>
                    {l.card_type === "pokemon" ? "PKM" : "YGO"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{l.card_name}</p>
                  {l.card_number && <p className="text-xs text-gray-400">#{l.card_number}</p>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <a href={l.urls.pricecharting} target="_blank" rel="noopener noreferrer"
                      className="text-amber-600 hover:underline text-xs">PC</a>
                    <a href={l.urls.cardmarket} target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs">CM</a>
                    <a href={l.urls.ebay} target="_blank" rel="noopener noreferrer"
                      className="text-red-500 hover:underline text-xs">eBay</a>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {editingPrice?.id === l.id ? (
                    <input
                      autoFocus
                      type="number"
                      step="0.01"
                      value={editingPrice.value}
                      onChange={(e) => setEditingPrice({ id: l.id, value: e.target.value })}
                      onBlur={() => savePrice(l.id, editingPrice.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") savePrice(l.id, editingPrice.value);
                        if (e.key === "Escape") setEditingPrice(null);
                      }}
                      className="w-20 border border-indigo-300 rounded px-2 py-1 text-sm focus:outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => setEditingPrice({ id: l.id, value: l.my_price?.toString() ?? "" })}
                      className="text-gray-700 hover:text-indigo-600 font-medium"
                      title="Click to edit"
                    >
                      {l.my_price != null ? `€${l.my_price.toFixed(2)}` : <span className="text-gray-300">—</span>}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  {l.vinted_suggestion ? (
                    <button
                      onClick={() => setVintedTarget(l)}
                      className="text-indigo-600 font-semibold text-sm hover:underline"
                    >
                      €{l.vinted_suggestion.suggested_price.toFixed(2)}
                    </button>
                  ) : (
                    <button
                      onClick={() => setVintedTarget(l)}
                      className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-100"
                    >
                      Suggest
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(l.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {vintedTarget && (
        <VintedModal
          lookup={vintedTarget}
          onClose={() => setVintedTarget(null)}
          onSaved={handleVintedSaved}
        />
      )}
    </>
  );
}

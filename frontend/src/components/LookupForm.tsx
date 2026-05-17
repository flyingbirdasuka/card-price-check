import { useRef, useState } from "react";
import { lookupCard, scanPhoto } from "../api";
import { CardLookup, CardType } from "../types";

interface Props {
  onResult: (lookup: CardLookup) => void;
}

export default function LookupForm({ onResult }: Props) {
  const [cardType, setCardType] = useState<CardType>("pokemon");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    setError("");
    try {
      const result = await scanPhoto(file);
      setCardType(result.card_type);
      setCardName(result.card_name);
      setCardNumber(result.card_number);
    } catch {
      setError("Could not read card from photo. Please fill in manually.");
    } finally {
      setScanning(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cardName.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await lookupCard(cardType, cardName, cardNumber);
      onResult(result);
      setCardName("");
      setCardNumber("");
    } catch {
      setError("Failed to look up card. Is the backend running?");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Look Up a Card</h2>

      {/* Photo scan */}
      <div
        className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors mb-5"
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        {scanning ? (
          <p className="text-indigo-500 text-sm font-medium animate-pulse">Scanning card with AI…</p>
        ) : (
          <>
            <p className="text-2xl mb-1">📷</p>
            <p className="text-sm text-gray-500">
              Upload a photo — AI will fill in the card details
            </p>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card type */}
        <div className="flex gap-2">
          {(["pokemon", "yugioh"] as CardType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setCardType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                cardType === t
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t === "pokemon" ? "Pokémon" : "Yu-Gi-Oh!"}
            </button>
          ))}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Card name</label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="e.g. Charizard"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card number <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="e.g. 4/102"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !cardName.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          {submitting ? "Looking up…" : "Find Prices"}
        </button>
      </form>
    </div>
  );
}

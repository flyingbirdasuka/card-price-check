import { useEffect, useState } from "react";
import { getHistory } from "./api";
import { CardLookup } from "./types";
import LookupForm from "./components/LookupForm";
import ResultCard from "./components/ResultCard";
import HistoryTable from "./components/HistoryTable";

export default function App() {
  const [tab, setTab] = useState<"lookup" | "history">("lookup");
  const [history, setHistory] = useState<CardLookup[]>([]);
  const [latestResult, setLatestResult] = useState<CardLookup | null>(null);

  useEffect(() => {
    getHistory().then(setHistory).catch(console.error);
  }, []);

  function handleResult(lookup: CardLookup) {
    setLatestResult(lookup);
    setHistory((prev) => [lookup, ...prev]);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <span className="text-2xl">🃏</span>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Card Price Check</h1>
            <p className="text-xs text-gray-400">Pokémon & Yu-Gi-Oh · Japanese cards · Vinted NL</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 flex gap-1">
          {(["lookup", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "lookup" ? "Look Up" : `History (${history.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {tab === "lookup" && (
          <>
            <LookupForm onResult={handleResult} />
            {latestResult && <ResultCard lookup={latestResult} />}
          </>
        )}
        {tab === "history" && (
          <HistoryTable lookups={history} onChange={setHistory} />
        )}
      </main>
    </div>
  );
}

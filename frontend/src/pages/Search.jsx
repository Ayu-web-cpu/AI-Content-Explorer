import React, { useState, useEffect } from "react";
import { SearchAPI } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function Search() {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);  // ✅ yeh missing tha
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return; // empty query avoid karo
    setLoading(true);
    setError("");
    try {
      const res = await SearchAPI.query(query, token);

      // ✅ MCP returns { results: [...] }
      if (Array.isArray(res.results)) {
        setResults(res.results);
      } else {
        setResults([]);
      }
    } catch (err) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial load: show search history
  useEffect(() => {
    (async () => {
      try {
        const hist = await SearchAPI.history(token);

        // backend returns { search_history: [...] }
        if (Array.isArray(hist?.search_history)) {
          setResults(hist.search_history);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    })();
  }, [token]);

  return (
    <div className="p-6 min-h-screen bg-white dark:bg-gray-900 text-black dark:text-gray-100 transition-colors duration-300">
      <h1 className="text-xl font-bold mb-4">Search Information</h1>

      {/* Input + Button */}
      <div className="flex space-x-2">
        <input
          type="text"
          className="input flex-1 dark:bg-gray-800 dark:text-white dark:border-gray-700"
          placeholder="Type your query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 dark:text-red-400 mt-2">{error}</p>}

      {/* Results */}
      <ul className="mt-4 space-y-2">
        {results.length > 0 ? (
          results.map((r, i) => (
            <li
              key={i}
              className="card text-sm bg-gray-50 dark:bg-gray-800 dark:text-gray-100 p-2 rounded-md shadow"
            >
              {/* ✅ Handle different response types */}
              {r.query || r.title || r.text || JSON.stringify(r)}
            </li>
          ))
        ) : (
          <p className="text-slate-500 dark:text-slate-400">No results found</p>
        )}
      </ul>
    </div>
  );
}

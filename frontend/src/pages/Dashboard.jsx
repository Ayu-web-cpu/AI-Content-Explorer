import React, { useEffect, useState } from "react";
import { SearchAPI, ImageAPI } from "../lib/api";
import { useAuth } from "../lib/auth";

// ✅ String truncate helper
function truncate(str, n = 160) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n) + "…" : str;
}

// ✅ Extract readable snippets
function formatResults(results) {
  if (!Array.isArray(results)) return "";
  const first = results[0];
  if (first?.text) return first.text;
  if (first?.title) return first.title;
  if (first?.snippet) return first.snippet;
  return JSON.stringify(first);
}

// ✅ Format Search History for export
function formatSearchHistory(history) {
  return history.map((item) => ({
    ID: item.id,
    Query: item.query,
    Snippet: formatResults(item.results) || "N/A",
    Timestamp: item.timestamp || new Date().toLocaleString(),
  }));
}

// ✅ Format Image History for export
function formatImageHistory(history) {
  return history.map((item) => ({
    ID: item.id,
    Prompt: item.prompt || "N/A",
    "Image URL": item.image_url || item.url || "N/A",
    Timestamp: item.timestamp || new Date().toLocaleString(),
  }));
}

// 📂 CSV Export only
function exportToCSV(data, filename = "export.csv") {
  if (!data.length) {
    alert("⚠️ No data available to export!");
    return;
  }
  const rows = [Object.keys(data[0]), ...data.map((obj) => Object.values(obj))];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export default function Dashboard() {
  const { token } = useAuth();

  const [searchHistory, setSearchHistory] = useState([]);
  const [imageHistory, setImageHistory] = useState([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewBody, setPreviewBody] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const sHist = await SearchAPI.history(token);
        const iHist = await ImageAPI.history(token);

        setSearchHistory(
          Array.isArray(sHist?.search_history) ? sHist.search_history : []
        );
        setImageHistory(
          Array.isArray(iHist?.image_history) ? iHist.image_history : []
        );
      } catch (err) {
        console.error("Error fetching history:", err);
        setSearchHistory([]);
        setImageHistory([]);
      }
    })();
  }, [token]);

  const handleDeleteSearch = async (id) => {
    try {
      await SearchAPI.delete(id, token);
      setSearchHistory((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Delete search failed:", err);
    }
  };

  const handleDeleteImage = async (id) => {
    try {
      await ImageAPI.delete(id, token);
      setImageHistory((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      console.error("Delete image failed:", err);
    }
  };

  const openSearchPreview = (item) => {
    const snippets = formatResults(item.results);
    setPreviewTitle(`Search: ${item.query}`);
    setPreviewBody(snippets || "No results.");
    setPreviewOpen(true);
  };

  return (
    <div className="p-6 min-h-screen bg-white dark:bg-gray-900 text-black dark:text-gray-100 transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Search History Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Search History</h2>
        {searchHistory.length > 0 && (
          <button
            onClick={() =>
              exportToCSV(formatSearchHistory(searchHistory), "search_history.csv")
            }
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm shadow"
          >
            Export CSV
          </button>
        )}
      </div>

      {/* Search History List */}
      {searchHistory.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-300 mb-6">No search history</p>
      ) : (
        <ul className="space-y-2 mb-6">
          {searchHistory.map((s, idx) => {
            const preview = truncate(formatResults(s.results), 160);
            return (
              <li
                key={s.id || idx}
                className="card flex flex-col gap-2 md:flex-row md:items-center md:justify-between relative"
              >
                <div>
                  <div className="font-medium">{s.query}</div>
                  {preview && (
                    <div className="text-sm text-slate-600 mt-1 dark:text-slate-300">
                      {preview}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openSearchPreview(s)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-md text-sm shadow"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteSearch(s.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm shadow"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Image History Section */}
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-lg font-semibold">Image History</h2>
        {imageHistory.length > 0 && (
          <button
            onClick={() =>
              exportToCSV(formatImageHistory(imageHistory), "image_history.csv")
            }
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm shadow"
          >
            Export CSV
          </button>
        )}
      </div>

      {/* Image History Grid */}
      {imageHistory.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-300">No image history</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {imageHistory.map((img, idx) => (
            <div key={img.id || idx} className="card relative">
              <img
                src={img.image_url || img.url}
                alt="Generated"
                className="rounded-xl"
              />
              <p className="text-sm mt-2">{img.prompt || "No prompt"}</p>
              <button
                onClick={() => handleDeleteImage(img.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs shadow hover:bg-red-600 transition"
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-6 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{previewTitle}</h3>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md shadow"
                onClick={() => setPreviewOpen(false)}
              >
                Close
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
              {previewBody}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}



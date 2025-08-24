import React, { useState, useEffect } from "react";
import { ImageAPI } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function ImageGen() {
  const { token } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await ImageAPI.generate(prompt, token);
      // ✅ Add new generated image at top
      setImages((prev) => [
        {
          id: res.id || Date.now(),
          prompt: res.prompt,
          image_url: res.image_url || res.url,
        },
        ...prev,
      ]);
      setPrompt(""); // clear input
    } catch (err) {
      setError(err.message || "Image generation failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const hist = await ImageAPI.history(token);
        // ✅ API returns { image_history: [...] }
        setImages(Array.isArray(hist?.image_history) ? hist.image_history : []);
      } catch (err) {
        console.error("Error loading history:", err);
      }
    })();
  }, [token]);

  return (
    <div className="p-6 min-h-screen bg-white dark:bg-gray-900 text-black dark:text-gray-100 transition-colors duration-300">
      <h1 className="text-xl font-bold mb-4">Generate Image</h1>

      {/* Prompt input + button */}
      <div className="flex space-x-2">
        <input
          type="text"
          className="input flex-1 dark:bg-gray-800 dark:text-white dark:border-gray-700"
          placeholder="Enter prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {error && (
        <p className="text-red-500 dark:text-red-400 mt-2">{error}</p>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {images.length > 0 ? (
          images.map((img, i) => (
            <div
              key={img.id || i}
              className="card bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow"
            >
              <img
                src={img.image_url || img.url}
                alt={img.prompt || "AI result"}
                className="rounded-xl"
              />
              <p className="text-sm mt-2">{img.prompt || "No prompt"}</p>
            </div>
          ))
        ) : (
          <p className="text-slate-500 dark:text-slate-400 col-span-full">
            No images yet
          </p>
        )}
      </div>
    </div>
  );
}


import React, { useState } from "react";
import { AuthAPI } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await AuthAPI.login(form);
      login(res);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-gray-900 transition-colors">
      <div className="w-96 bg-white dark:bg-gray-800 dark:text-gray-100 shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-indigo-600 dark:text-indigo-400">
          Login
        </h1>

        {error && <p className="text-red-500 dark:text-red-400 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium shadow transition dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register link */}
        <p className="text-sm text-center mt-4 text-slate-600 dark:text-slate-300">
          Don’t have an account?{" "}
          <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

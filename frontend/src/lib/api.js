const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ✅ Unified error handler
async function handle(res) {
  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = {};
    }

    const message = error.detail || "API Error";

    // Auto logout on 401 or expired token
    if (res.status === 401 || message.includes("expired token")) {
      console.warn("⚠️ Session expired. Logging out...");
      localStorage.removeItem("ace_auth"); // ✅ correct storage key
      window.location.href = "/login";
    }

    throw new Error(message);
  }
  return res.json();
}

//
// =================== AUTH ===================
//
export const AuthAPI = {
  async login(data) {
    const res = await fetch(BASE + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handle(res);
  },

  async register(data) {
    const res = await fetch(BASE + "/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handle(res);
  },
};

//
// =================== SEARCH ===================
//
export const SearchAPI = {
  async query(q, token) {
    // ✅ backend expects ?query= not ?q=
    const res = await fetch(BASE + `/search?query=${encodeURIComponent(q)}`, {
      headers: { ...authHeaders(token) },
    });
    return handle(res);
  },

  async history(token) {
    const res = await fetch(BASE + "/search/history", {
      headers: { ...authHeaders(token) },
    });
    return handle(res);
  },

  async delete(id, token) {
    const res = await fetch(BASE + `/search/history/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders(token) },
    });
    return handle(res);
  },
};

//
// =================== IMAGE ===================
//
export const ImageAPI = {
  async generate(prompt, token) {
    const res = await fetch(
      BASE + `/image?prompt=${encodeURIComponent(prompt)}`,
      {
        method: "POST",
        headers: { ...authHeaders(token) },
      }
    );
    return handle(res);
  },

  async history(token) {
    const res = await fetch(BASE + "/image/history", {
      headers: { ...authHeaders(token) },
    });
    return handle(res);
  },

  async delete(id, token) {
    const res = await fetch(BASE + `/image/history/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders(token) },
    });
    return handle(res);
  },
};

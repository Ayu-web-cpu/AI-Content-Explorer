import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const storageKey = "ace_auth";

function readStorage() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || null;
  } catch {
    return null;
  }
}

function writeStorage(data) {
  if (data) {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } else {
    localStorage.removeItem(storageKey); // ✅ agar null hua to clear karo
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStorage());

  useEffect(() => {
    writeStorage(auth);
  }, [auth]);

  const value = useMemo(
    () => ({
      user: auth?.user || null,
      token: auth?.access_token || null,
      role: auth?.user?.role || "user",
      login: (payload) => setAuth(payload),
      logout: () => {
        localStorage.removeItem(storageKey); // ✅ logout pe storage bhi clear
        setAuth(null);
      },
      setUser: (u) => setAuth((a) => ({ ...a, user: u })),
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

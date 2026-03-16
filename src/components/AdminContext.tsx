"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AuthState = { admin: boolean; loggedIn: boolean };

const AdminContext = createContext<AuthState>({ admin: false, loggedIn: false });

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ admin: false, loggedIn: false });

  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((data) => setAuth({ admin: !!data.admin, loggedIn: !!data.user }))
      .catch(() => setAuth({ admin: false, loggedIn: false }));
  }, []);

  return (
    <AdminContext.Provider value={auth}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext).admin;
}

export function useLoggedIn() {
  return useContext(AdminContext).loggedIn;
}

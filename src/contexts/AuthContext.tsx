
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  organization: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [organization, setOrganization] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    const org = localStorage.getItem("organization");
    setIsAuthenticated(authStatus);
    setOrganization(org);
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const emailRegex = /^admin@([a-zA-Z]+)$/;
    const match = email.match(emailRegex);

    if (match && pass === "trichyrs") {
      const org = match[1]; // The city name
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("organization", org);
      setIsAuthenticated(true);
      setOrganization(org);
      return Promise.resolve();
    } else {
      return Promise.reject(new Error("Invalid credentials or email format. Use 'admin@[city]'."));
    }
  };

  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("organization");
    setIsAuthenticated(false);
    setOrganization(null);
    router.push("/login");
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, organization, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

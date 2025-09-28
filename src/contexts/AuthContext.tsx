
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

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
    try {
      const authStatus = localStorage.getItem("isAuthenticated") === "true";
      const org = localStorage.getItem("organization");
      setIsAuthenticated(authStatus);
      setOrganization(org);
    } catch (e) {
      // Local storage is not available or other error
      console.error("Failed to access localStorage:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const emailRegex = /^admin@([a-zA-Z_.-]+)$/;
    const match = email.match(emailRegex);

    if (match) {
      const org = match[1].toLowerCase();
      
      if (pass !== org) {
        return Promise.reject(new Error("Invalid credentials."));
      }

      try {
        const db = getFirestore(app);
        const orgDocRef = doc(db, "organizations", org);
        const orgDoc = await getDoc(orgDocRef);

        if (orgDoc.exists()) {
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("organization", org);
          setIsAuthenticated(true);
          setOrganization(org);
          return Promise.resolve();
        } else {
          return Promise.reject(new Error("Organization not found."));
        }
      } catch (error) {
        console.error("Error during authentication:", error);
        return Promise.reject(new Error("An error occurred during login."));
      }
    }
    
    return Promise.reject(new Error("Invalid email format."));
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

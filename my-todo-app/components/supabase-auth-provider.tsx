"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (userId: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string) => Promise<User>;
  getAllUsers: () => Promise<User[]>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // ローカルストレージからログイン状態を復元
    const loadUser = async () => {
      const savedUserId = localStorage.getItem("currentUserId");
      if (savedUserId) {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", savedUserId)
            .single();

          if (data && !error) {
            setUser(data);
          } else {
            localStorage.removeItem("currentUserId");
          }
        } catch (err) {
          console.error("Error loading user:", err);
          localStorage.removeItem("currentUserId");
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        setUser(data);
        localStorage.setItem("currentUserId", data.id);
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUserId");
  };

  const register = async (name: string, email: string): Promise<User> => {
    try {
      // メールアドレスの重複チェック
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (existingUser) {
        throw new Error("このメールアドレスは既に登録されています");
      }

      // 新しいユーザーを作成
      const { data, error } = await supabase
        .from("users")
        .insert([{ name, email }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setUser(data);
        localStorage.setItem("currentUserId", data.id);
        return data;
      }

      throw new Error("ユーザー登録に失敗しました");
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Get users error:", error);
      return [];
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, register, getAllUsers, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within a SupabaseAuthProvider");
  }
  return context;
}

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  register: (name: string, email: string) => User;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // ローカルストレージからログイン状態を復元
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // 初期ユーザーを作成（存在しない場合）
    const users = localStorage.getItem("users");
    if (!users) {
      const defaultUsers: User[] = [
        { id: "1", name: "田中太郎", email: "tanaka@example.com" },
        { id: "2", name: "佐藤花子", email: "sato@example.com" },
        { id: "3", name: "山田次郎", email: "yamada@example.com" },
      ];
      localStorage.setItem("users", JSON.stringify(defaultUsers));
    }

    setIsLoaded(true);
  }, []);

  const login = (user: User) => {
    setUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  const register = (name: string, email: string): User => {
    const users = getAllUsers();
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
    };
    const updatedUsers = [...users, newUser];
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    login(newUser);
    return newUser;
  };

  const getAllUsers = (): User[] => {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : [];
  };

  // ローカルストレージの読み込みが完了するまで何も表示しない
  if (!isLoaded) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, getAllUsers }}>
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

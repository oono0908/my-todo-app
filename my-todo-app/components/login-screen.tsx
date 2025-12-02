"use client";

import { useState } from "react";
import { useAuth, User } from "./auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UserCircle2, LogIn, UserPlus } from "lucide-react";

export function LoginScreen() {
  const { login, register, getAllUsers } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [showRegister, setShowRegister] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");

  const users = getAllUsers();

  const handleLogin = () => {
    const user = users.find((u) => u.id === selectedUserId);
    if (user) {
      login(user);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerName.trim() && registerEmail.trim()) {
      register(registerName.trim(), registerEmail.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <UserCircle2 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            {showRegister ? "新規登録" : "ログイン"}
          </CardTitle>
          <p className="text-muted-foreground">
            {showRegister
              ? "新しいアカウントを作成"
              : "カンバンボードへようこそ"}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showRegister ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="user-select">ユーザーを選択</Label>
                <select
                  id="user-select"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="">選択してください</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handleLogin}
                disabled={!selectedUserId}
                className="w-full"
                size="lg"
              >
                <LogIn className="mr-2 h-5 w-5" />
                ログイン
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    または
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setShowRegister(true)}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                新規登録
              </Button>
            </>
          ) : (
            <>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">お名前</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="田中太郎"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">メールアドレス</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="tanaka@example.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <UserPlus className="mr-2 h-5 w-5" />
                  登録して始める
                </Button>
              </form>

              <Button
                onClick={() => setShowRegister(false)}
                variant="ghost"
                className="w-full"
              >
                ログイン画面に戻る
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

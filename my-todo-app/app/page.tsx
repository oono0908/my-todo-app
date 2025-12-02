"use client";

import { SupabaseTodoList } from "@/components/supabase-todo-list";
import { SupabaseAuthProvider, useSupabaseAuth } from "@/components/supabase-auth-provider";
import { SupabaseLoginScreen } from "@/components/supabase-login-screen";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

function MainContent() {
  const { user, logout, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return <SupabaseLoginScreen />;
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-8 bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="w-full max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1 space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              カンバンボード
            </h1>
            <p className="text-muted-foreground">
              ようこそ、{user.name}さん
            </p>
          </div>
          <Button onClick={logout} variant="outline" className="flex-shrink-0">
            <LogOut className="mr-2 h-4 w-4" />
            ログアウト
          </Button>
        </div>
        <SupabaseTodoList userId={user.id} userName={user.name} />
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <SupabaseAuthProvider>
      <MainContent />
    </SupabaseAuthProvider>
  );
}

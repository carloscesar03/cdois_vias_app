import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface LoginPageProps {
  onLogin: (user: { nome: string; role: string }) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const user = username.trim().toLowerCase();

    if (user === "admin" && password === "admin") {
      onLogin({ nome: "Carlos", role: "admin" });
    } else if (user === "colab" && password === "123") {
      onLogin({ nome: "Colaborador 01", role: "user" });
    } else {
      setError("Usuário ou senha incorretos.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">CDois Vias</h1>
          <p className="text-muted-foreground">Fiscalização CE-388</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Usuário</label>
            <Input
              type="text"
              placeholder="admin ou colab"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Senha</label>
            <Input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
          </div>

          {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded">{error}</div>}

          <Button type="submit" className="w-full">
            Entrar no Sistema
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          <p className="mb-2">Credenciais de teste:</p>
          <p>Admin: admin / admin</p>
          <p>Colaborador: colab / 123</p>
        </div>
      </Card>
    </div>
  );
}

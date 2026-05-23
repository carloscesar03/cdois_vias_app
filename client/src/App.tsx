import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DiagramaPage from "./pages/DiagramaPage";
import OACPage from "./pages/OACPage";

type PageType = "home" | "diagrama" | "oac";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ nome: string; role: string } | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>("home");

  useEffect(() => {
    // Check if user is already logged in (localStorage)
    const savedUser = localStorage.getItem("usuarioLogado");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (user: { nome: string; role: string }) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem("usuarioLogado", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentPage("home");
    localStorage.removeItem("usuarioLogado");
  };

  if (!isLoggedIn) {
    return (
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <LoginPage onLogin={handleLogin} />
        </TooltipProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen bg-background flex flex-col">
          {/* Header */}
          <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
            <div className="px-4 py-3 flex justify-between items-center">
              <h1 className="text-xl font-bold text-primary">CDois Vias</h1>
              <div className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  {currentUser?.nome}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm font-semibold border border-destructive text-destructive rounded hover:bg-destructive/10 transition"
                >
                  Sair
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 pb-20">
            {currentPage === "home" && <DashboardPage />}
            {currentPage === "diagrama" && <DiagramaPage />}
            {currentPage === "oac" && <OACPage />}
          </main>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around px-4 py-2 z-50">
            <button
              onClick={() => setCurrentPage("home")}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded transition ${
                currentPage === "home"
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-xl">🏠</span>
              <span className="text-xs">Início</span>
            </button>
            <button
              onClick={() => setCurrentPage("diagrama")}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded transition ${
                currentPage === "diagrama"
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-xl">📊</span>
              <span className="text-xs">Diagrama</span>
            </button>
            <button
              onClick={() => setCurrentPage("oac")}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded transition ${
                currentPage === "oac"
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-xl">🕳️</span>
              <span className="text-xs">OACs</span>
            </button>
          </nav>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;

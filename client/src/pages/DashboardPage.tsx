import { Card } from "@/components/ui/card";
import { useRecentLogs } from "@/hooks/useFirebase";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { logs, loading } = useRecentLogs();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Visão Geral da Obra</h2>
        <p className="text-muted-foreground">Trecho: Altaneira - Nova Olinda (12,97 km)</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">12</div>
          <div className="text-xs text-muted-foreground mt-1">Serviços Lançados</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">8</div>
          <div className="text-xs text-muted-foreground mt-1">Concluídos</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">4</div>
          <div className="text-xs text-muted-foreground mt-1">Em Execução</div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Resumo de Inserções Recentes</h3>
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-primary mr-2" />
              <p className="text-muted-foreground">Carregando dados da nuvem...</p>
            </div>
          ) : logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="pb-3 border-b border-border last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">{log.usuario}</p>
                    <p className="text-sm text-muted-foreground">{log.acao}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{log.timestamp}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhum registro encontrado</p>
          )}
        </div>
      </Card>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Dica:</strong> Use o menu inferior para acessar o Diagrama de Avanço ou o Controle de OACs.
        </p>
      </div>
    </div>
  );
}

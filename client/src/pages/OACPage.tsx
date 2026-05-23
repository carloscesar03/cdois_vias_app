import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useOACData, OACRecord } from "@/hooks/useFirebase";
import { Loader2 } from "lucide-react";

export default function OACPage() {
  const { oacs, loading, updateOAC } = useOACData();
  const [selectedOAC, setSelectedOAC] = useState<OACRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    tipo: "Ampliação",
    extensao: "",
    bocas: "",
    redentes: "",
    recravas: "",
    obs: "",
    concluido: false,
  });

  const statusCounts = {
    concluido: oacs.filter((o) => o.status === "concluido").length,
    andamento: oacs.filter((o) => o.status === "andamento").length,
    pendente: oacs.filter((o) => o.status === "pendente").length,
  };

  const handleSelectOAC = (oac: OACRecord) => {
    setSelectedOAC(oac);
    setFormData({
      tipo: oac.categoria || "Ampliação",
      extensao: oac.extensao?.toString() || "",
      bocas: oac.bocas?.toString() || "",
      redentes: oac.redentes?.toString() || "",
      recravas: oac.recravas?.toString() || "",
      obs: oac.obs || "",
      concluido: oac.status === "concluido",
    });
    setIsDialogOpen(true);
  };

  const handleSalvarOAC = async () => {
    if (!selectedOAC) return;

    setIsUpdating(true);
    try {
      const extensao = parseFloat(formData.extensao || "0");
      const bocas = parseInt(formData.bocas || "0");

      let novoStatus: "pendente" | "andamento" | "concluido" = "pendente";
      if (formData.concluido) {
        novoStatus = "concluido";
      } else if (extensao > 0 || bocas > 0) {
        novoStatus = "andamento";
      }

      const usuarioLogado = localStorage.getItem("usuarioLogado");
      const usuario = usuarioLogado ? JSON.parse(usuarioLogado).nome : "Usuário Desconhecido";

      await updateOAC(selectedOAC.id, {
        categoria: formData.tipo,
        extensao,
        bocas,
        redentes: parseFloat(formData.redentes || "0"),
        recravas: parseFloat(formData.recravas || "0"),
        obs: formData.obs,
        concluido: formData.concluido,
        status: novoStatus,
        usuarioModificacao: usuario,
        dataHoraModificacao: new Date().toLocaleString("pt-BR"),
      });

      toast.success("Avanço do bueiro atualizado na nuvem!");
      setIsDialogOpen(false);
      setSelectedOAC(null);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast.error("Erro ao atualizar bueiro");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "concluido":
        return "bg-green-100 text-green-800";
      case "andamento":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "concluido":
        return "Concluído";
      case "andamento":
        return "Andamento";
      default:
        return "Pendente";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Obras D'Arte Correntes</h2>
        <p className="text-muted-foreground">Controle de Bueiros (74 estruturas)</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{statusCounts.concluido}</div>
          <div className="text-xs text-muted-foreground mt-1">Concluídos</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{statusCounts.andamento}</div>
          <div className="text-xs text-muted-foreground mt-1">Andamento</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{statusCounts.pendente}</div>
          <div className="text-xs text-muted-foreground mt-1">Pendentes</div>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-primary mr-2" />
          <p className="text-muted-foreground">Carregando bueiros da nuvem...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {oacs.map((oac) => (
            <Card
              key={oac.id}
              className="p-4 cursor-pointer hover:shadow-md transition"
              onClick={() => handleSelectOAC(oac)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    Bueiro #{oac.numero} - {oac.tipo}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{oac.diretriz}</p>
                  {oac.obs && <p className="text-xs text-muted-foreground mt-1">Obs: {oac.obs}</p>}
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded font-semibold whitespace-nowrap ml-2 ${getStatusBadge(oac.status)}`}
                >
                  {getStatusLabel(oac.status)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Bueiro #{selectedOAC?.numero}</DialogTitle>
            <DialogDescription>Registre o avanço da execução</DialogDescription>
          </DialogHeader>

          {selectedOAC && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-1">Diretriz do Projeto:</p>
                <p className="text-xs text-blue-800">{selectedOAC.diretriz}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Tipo de Projeto</label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ampliação">Ampliação</SelectItem>
                    <SelectItem value="Projetado">Projetado (Novo)</SelectItem>
                    <SelectItem value="Recuperação">Recuperação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Extensão Corpo (m)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.extensao}
                    onChange={(e) => setFormData({ ...formData, extensao: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Bocas Executadas</label>
                  <Input
                    type="number"
                    value={formData.bocas}
                    onChange={(e) => setFormData({ ...formData, bocas: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Prof. Redentes (m)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.redentes}
                    onChange={(e) => setFormData({ ...formData, redentes: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Prof. Recravas (m)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Se capeado"
                    value={formData.recravas}
                    onChange={(e) => setFormData({ ...formData, recravas: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Observações de Execução</label>
                <textarea
                  className="w-full p-2 border border-border rounded text-sm"
                  rows={3}
                  placeholder="Ex: Necessitou substituição total..."
                  value={formData.obs}
                  onChange={(e) => setFormData({ ...formData, obs: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Checkbox
                  checked={formData.concluido}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, concluido: checked as boolean })
                  }
                />
                <label className="text-sm font-semibold cursor-pointer">Bueiro 100% Concluído</label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  onClick={handleSalvarOAC}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Execução"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

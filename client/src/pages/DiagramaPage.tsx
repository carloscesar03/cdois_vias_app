import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useDiagramaData, DiagramaRecord } from "@/hooks/useFirebase";
import { Loader2 } from "lucide-react";

export default function DiagramaPage() {
  const [servico, setServico] = useState("Limpeza/Supressão");
  const [status, setStatus] = useState("Pendente");
  const [estIni, setEstIni] = useState("");
  const [fracIni, setFracIni] = useState("");
  const [estFin, setEstFin] = useState("");
  const [fracFin, setFracFin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { records, loading, addDiagrama } = useDiagramaData();

  const handleSalvar = async () => {
    if (!estIni || !estFin) {
      toast.error("Preencha as estacas inicial e final");
      return;
    }

    setIsLoading(true);
    try {
      const usuarioLogado = localStorage.getItem("usuarioLogado");
      const usuario = usuarioLogado ? JSON.parse(usuarioLogado).nome : "Usuário Desconhecido";

      await addDiagrama({
        servico,
        status,
        estIni: parseInt(estIni),
        fracIni: parseFloat(fracIni || "0"),
        estFin: parseInt(estFin),
        fracFin: parseFloat(fracFin || "0"),
        usuario,
        dataHoraModificacao: new Date().toLocaleString("pt-BR"),
      });

      toast.success("Apontamento salvo com sucesso na nuvem!");

      // Reset form
      setEstIni("");
      setFracIni("");
      setEstFin("");
      setFracFin("");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar apontamento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGerarPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const response = await fetch("/base_diagrama.pdf");
      if (!response.ok) {
        throw new Error('Arquivo "base_diagrama.pdf" não encontrado.');
      }

      const arrayBuffer = await response.arrayBuffer();

      // Dynamically import PDFLib
      const { PDFDocument, rgb } = await import("pdf-lib");

      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      const cores: Record<string, any> = {
        "Limpeza/Supressão": rgb(0.13, 0.55, 0.13),
        Terraplenagem: rgb(0.93, 0.46, 0.0),
        Regularização: rgb(0.55, 0.27, 0.07),
        "Sub Base": rgb(0.2, 0.6, 1.0),
        Base: rgb(0.5, 0.0, 0.5),
        Imprimação: rgb(0.4, 0.4, 0.4),
        TSD: rgb(0.1, 0.1, 0.1),
        "Em Execução": rgb(0.99, 0.82, 0.3),
      };

      const page1 = pages[0];
      const { height } = page1.getSize();
      let legX = 40;
      let legY = height - 30;

      page1.drawText("LEGENDA DE SERVIÇOS (CONCLUÍDOS):", {
        x: legX,
        y: legY + 12,
        size: 9,
        color: rgb(0, 0, 0),
      });

      const desenharLegenda = (texto: string, cor: any, posX: number, posY: number) => {
        page1.drawRectangle({ x: posX, y: posY, width: 10, height: 10, color: cor });
        page1.drawText(texto, { x: posX + 15, y: posY + 2, size: 8 });
      };

      desenharLegenda("Em Execução", cores["Em Execução"], legX, legY - 5);
      desenharLegenda("Limpeza", cores["Limpeza/Supressão"], legX + 80, legY - 5);
      desenharLegenda("Terraplenagem", cores["Terraplenagem"], legX + 140, legY - 5);
      desenharLegenda("Regul.", cores["Regularização"], legX + 230, legY - 5);
      desenharLegenda("Sub Base", cores["Sub Base"], legX + 280, legY - 5);
      desenharLegenda("Base", cores["Base"], legX + 340, legY - 5);
      desenharLegenda("Imprimação", cores["Imprimação"], legX + 390, legY - 5);
      desenharLegenda("TSD", cores["TSD"], legX + 460, legY - 5);

      const roadStatus = new Array(649).fill(null);

      records.forEach((reg) => {
        let inicio = reg.estIni;
        let fim = reg.estFin;
        for (let i = inicio; i <= fim; i++) {
          if (i <= 648) {
            roadStatus[i] = { status: reg.status, servico: reg.servico };
          }
        }
      });

      for (let i = 0; i <= 648; i++) {
        if (roadStatus[i] && roadStatus[i].status !== "Pendente") {
          let corAplicada =
            roadStatus[i].status === "Concluído" ? cores[roadStatus[i].servico] : cores["Em Execução"];
          let pageIndex = 0;
          let rowIndex = 0;
          let posNaLinha = 0;

          if (i <= 120) {
            pageIndex = 0;
            rowIndex = 0;
            posNaLinha = i;
          } else if (i <= 241) {
            pageIndex = 0;
            rowIndex = 1;
            posNaLinha = i - 121;
          } else if (i <= 362) {
            pageIndex = 0;
            rowIndex = 2;
            posNaLinha = i - 242;
          } else if (i <= 483) {
            pageIndex = 1;
            rowIndex = 0;
            posNaLinha = i - 363;
          } else if (i <= 604) {
            pageIndex = 1;
            rowIndex = 1;
            posNaLinha = i - 484;
          } else {
            pageIndex = 1;
            rowIndex = 2;
            posNaLinha = i - 605;
          }

          let paginaAtual = pages[pageIndex];
          if (!paginaAtual) continue;

          let yBase;
          if (rowIndex === 0) yBase = height - 200;
          else if (rowIndex === 1) yBase = height - 370;
          else yBase = height - 540;

          let xBase = 50 + posNaLinha * 6.5;

          paginaAtual.drawRectangle({
            x: xBase,
            y: yBase,
            width: 6.5,
            height: 30,
            color: corAplicada,
            opacity: 0.65,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Planta_Iluminada_CE388_Atualizada.pdf";
      link.click();

      toast.success("PDF gerado e baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF: " + (error instanceof Error ? error.message : "Erro desconhecido"));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Diagrama Iluminado</h2>
        <p className="text-muted-foreground">Lançamento de Avanço Físico</p>
      </div>

      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Serviço Executado</label>
            <Select value={servico} onValueChange={setServico}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Limpeza/Supressão">Limpeza/Supressão Vegetal</SelectItem>
                <SelectItem value="Terraplenagem">Terraplenagem</SelectItem>
                <SelectItem value="Regularização">Regularização do Subleito</SelectItem>
                <SelectItem value="Sub Base">Sub Base</SelectItem>
                <SelectItem value="Base">Base</SelectItem>
                <SelectItem value="Imprimação">Imprimação</SelectItem>
                <SelectItem value="TSD">Tratamento Superficial Duplo (TSD)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Em Execução">Em Execução</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Estaca Inicial</label>
              <Input
                type="number"
                placeholder="Ex: 10"
                value={estIni}
                onChange={(e) => setEstIni(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Fração (+)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 5.50"
                value={fracIni}
                onChange={(e) => setFracIni(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Estaca Final</label>
              <Input
                type="number"
                placeholder="Ex: 12"
                value={estFin}
                onChange={(e) => setEstFin(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Fração (+)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 0.00"
                value={fracFin}
                onChange={(e) => setFracFin(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleSalvar}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Salvando...
              </>
            ) : (
              "Salvar Apontamento"
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <Button
          onClick={handleGerarPDF}
          disabled={isGeneratingPDF}
          variant="outline"
          className="w-full"
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Gerando PDF...
            </>
          ) : (
            "Gerar Planta Iluminada (PDF)"
          )}
        </Button>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-primary mr-2" />
          <p className="text-muted-foreground">Carregando registros...</p>
        </div>
      ) : records.length > 0 ? (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-primary mb-4">Apontamentos Registrados</h3>
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record.id} className="p-3 border border-border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm">{record.servico}</p>
                    <p className="text-xs text-muted-foreground">
                      Est. {record.estIni}+{record.fracIni.toFixed(2)} a {record.estFin}+{record.fracFin.toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded font-semibold ${
                      record.status === "Concluído"
                        ? "bg-green-100 text-green-800"
                        : record.status === "Em Execução"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{record.usuario} - {record.dataHoraModificacao}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

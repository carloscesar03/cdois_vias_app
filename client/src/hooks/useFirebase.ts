import { useEffect, useState } from "react";
import { 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  collection,
  getDocs 
} from "firebase/firestore";
import { db, diagRef, oacRef } from "@/lib/firebase";

export interface DiagramaRecord {
  id: string;
  servico: string;
  status: string;
  estIni: number;
  fracIni: number;
  estFin: number;
  fracFin: number;
  usuario: string;
  dataHoraModificacao: string;
}

export interface OACRecord {
  id: string;
  numero: number;
  tipo: string;
  seção: string;
  diretriz: string;
  status: "pendente" | "andamento" | "concluido";
  categoria?: string;
  extensao?: number;
  bocas?: number;
  redentes?: number;
  recravas?: number;
  obs?: string;
  concluido?: boolean;
  usuarioModificacao?: string;
  dataHoraModificacao?: string;
}

export function useDiagramaData() {
  const [records, setRecords] = useState<DiagramaRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "diagrama"), orderBy("dataHoraModificacao", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DiagramaRecord[];
      setRecords(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addDiagrama = async (record: Omit<DiagramaRecord, "id">) => {
    try {
      await addDoc(diagRef, record);
    } catch (error) {
      console.error("Erro ao adicionar diagrama:", error);
      throw error;
    }
  };

  return { records, loading, addDiagrama };
}

export function useOACData() {
  const [oacs, setOacs] = useState<OACRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "oacs"), orderBy("numero", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as OACRecord[];
      setOacs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateOAC = async (id: string, updates: Partial<OACRecord>) => {
    try {
      const docRef = doc(db, "oacs", id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error("Erro ao atualizar OAC:", error);
      throw error;
    }
  };

  return { oacs, loading, updateOAC };
}

export function useRecentLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // Get recent diagrama entries
        const diagramaSnapshot = await getDocs(
          query(collection(db, "diagrama"), orderBy("dataHoraModificacao", "desc"))
        );
        
        // Get recent OAC updates
        const oacSnapshot = await getDocs(
          query(collection(db, "oacs"), orderBy("dataHoraModificacao", "desc"))
        );

        const diagramaLogs = diagramaSnapshot.docs.slice(0, 3).map((doc) => ({
          tipo: "diagrama",
          usuario: doc.data().usuario,
          acao: `Lançamento de ${doc.data().servico} (Est. ${doc.data().estIni}+${doc.data().fracIni.toFixed(2)} a ${doc.data().estFin}+${doc.data().fracFin.toFixed(2)})`,
          timestamp: doc.data().dataHoraModificacao,
        }));

        const oacLogs = oacSnapshot.docs.slice(0, 3).map((doc) => ({
          tipo: "oac",
          usuario: doc.data().usuarioModificacao || "Sistema",
          acao: `Atualização de Bueiro #${doc.data().numero} (${doc.data().categoria || "Sem categoria"})`,
          timestamp: doc.data().dataHoraModificacao || new Date().toLocaleString("pt-BR"),
        }));

        const allLogs = [...diagramaLogs, ...oacLogs]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);

        setLogs(allLogs);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar logs:", error);
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return { logs, loading };
}

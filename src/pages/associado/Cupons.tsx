import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
const Cupons = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cuponsDisponiveis, setCuponsDisponiveis] = useState<any[]>([]);
  const [meuscupons, setMeuscupons] = useState<any[]>([]);
  const [nomeAssociado, setNomeAssociado] = useState<string>("");
  useEffect(() => {
    checkAuth();
    loadCupons();
  }, []);
  const checkAuth = async () => {
    const {
      data: {
        session
      }
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };
  const loadCupons = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar CPF e nome do associado logado
      const {
        data: associadoData,
        error: assocError
      } = await supabase.from("associado").select("cpf_associado, nom_associado").eq("user_id", user.id).single();
      if (assocError) throw assocError;
      setNomeAssociado(associadoData.nom_associado);

      // Carregar cupons disponíveis
      const {
        data: disponiveis,
        error: erroDisponiveis
      } = await supabase.from("cupom").select("*, comercio(*)").gte("dta_termino_cupom", new Date().toISOString().split("T")[0]);
      if (erroDisponiveis) throw erroDisponiveis;

      // Carregar meus cupons reservados (filtrado por CPF)
      const {
        data: reservados,
        error: erroReservados
      } = await supabase.from("cupom_associado").select("*, cupom(*, comercio(*))").eq("cpf_associado", associadoData.cpf_associado);
      if (erroReservados) throw erroReservados;
      setCuponsDisponiveis(disponiveis || []);
      // Filtrar apenas cupons que retornaram dados completos
      setMeuscupons((reservados || []).filter(r => r.cupom));
    } catch (error: any) {
      toast.error("Erro ao carregar cupons: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  const reservarCupom = async (numCupom: string) => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar CPF do associado logado
      const {
        data: associadoData,
        error: assocError
      } = await supabase.from("associado").select("cpf_associado").eq("user_id", user.id).single();
      if (assocError) throw assocError;
      const {
        error
      } = await supabase.from("cupom_associado").insert({
        num_cupom: numCupom,
        cpf_associado: associadoData.cpf_associado,
        dta_cupom_associado: new Date().toISOString().split("T")[0]
      });
      if (error) throw error;
      toast.success("Cupom reservado com sucesso!");
      loadCupons();
    } catch (error: any) {
      toast.error("Erro ao reservar cupom: " + error.message);
    }
  };
  const removerCupom = async (idCupomAssociado: number) => {
    try {
      const {
        error
      } = await supabase.from("cupom_associado").delete().eq("id_cupom_associado", idCupomAssociado);
      if (error) throw error;
      toast.success("Cupom removido com sucesso!");
      loadCupons();
    } catch (error: any) {
      toast.error("Erro ao remover cupom: " + error.message);
    }
  };
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error: any) {
      toast.error("Erro ao fazer logout: " + error.message);
    }
  };
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Meus Cupons</h1>
          <div className="flex flex-col items-end gap-2">
            <span className="text-sm text-muted-foreground">{nomeAssociado}</span>
            <div className="flex items-center gap-2">
              
              <Button onClick={handleLogout} variant="outline" size="sm">
                SAIR
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Cupons Disponíveis</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cuponsDisponiveis.map(cupom => <Card key={cupom.num_cupom}>
                <CardHeader>
                  <CardTitle>{cupom.tit_cupom}</CardTitle>
                  <CardDescription>{cupom.comercio?.nom_fantasia_comercio}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-lg">{cupom.per_desc_cupom}% OFF</Badge>
                    <p className="text-sm text-muted-foreground">
                      Válido até {new Date(cupom.dta_termino_cupom).toLocaleDateString()}
                    </p>
                    <Button onClick={() => reservarCupom(cupom.num_cupom)} className="w-full">
                      Reservar Cupom
                    </Button>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-semibold">Meus Cupons Reservados</h2>
          {meuscupons.length === 0 ? <Card className="p-8">
              <p className="text-center text-muted-foreground">Você ainda não reservou nenhum cupom</p>
            </Card> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {meuscupons.map(reserva => <Card key={reserva.id_cupom_associado}>
                  <CardHeader>
                    <CardTitle>{reserva.cupom?.tit_cupom || "Cupom Indisponível"}</CardTitle>
                    <CardDescription>{reserva.cupom?.comercio?.nom_fantasia_comercio || "N/A"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {reserva.cupom && <>
                          <Badge variant="secondary" className="text-lg">{reserva.cupom.per_desc_cupom}% OFF</Badge>
                          <p className="text-sm text-muted-foreground">
                            Válido até {new Date(reserva.cupom.dta_termino_cupom).toLocaleDateString()}
                          </p>
                        </>}
                      <p className="text-sm font-mono bg-muted p-2 rounded">{reserva.num_cupom}</p>
                      {reserva.dta_uso_cupom_associado ? <Badge variant="outline">Usado em {new Date(reserva.dta_uso_cupom_associado).toLocaleDateString()}</Badge> : <>
                          <Badge>Disponível para uso</Badge>
                          <Button onClick={() => removerCupom(reserva.id_cupom_associado)} variant="destructive" size="sm" className="w-full">
                            Remover Cupom
                          </Button>
                        </>}
                    </div>
                  </CardContent>
                </Card>)}
            </div>}
        </div>
      </div>
    </div>;
};
export default Cupons;
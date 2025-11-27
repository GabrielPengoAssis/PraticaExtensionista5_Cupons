import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, LogOut } from "lucide-react";

const Cupons = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [meusCupons, setMeusCupons] = useState<any[]>([]);
  const [cuponsReservados, setCuponsReservados] = useState<any[]>([]);
  const [comercioInfo, setComercioInfo] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form states
  const [titulo, setTitulo] = useState("");
  const [percentual, setPercentual] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataTermino, setDataTermino] = useState("");

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Carregar informações do comércio
      const { data: comercio, error: erroComercio } = await supabase
        .from("comercio")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (erroComercio) throw erroComercio;
      setComercioInfo(comercio);

      // Carregar meus cupons
      const { data: cupons, error: erroCupons } = await supabase
        .from("cupom")
        .select("*")
        .eq("cnpj_comercio", comercio.cnpj_comercio);

      if (erroCupons) throw erroCupons;
      setMeusCupons(cupons || []);

      // Carregar cupons reservados
      const { data: reservados, error: erroReservados } = await supabase
        .from("cupom_associado")
        .select("*, cupom!inner(*)")
        .in("num_cupom", (cupons || []).map(c => c.num_cupom));

      if (erroReservados) throw erroReservados;

      // Buscar nomes dos associados
      if (reservados && reservados.length > 0) {
        const cpfs = reservados.map(r => r.cpf_associado);
        const { data: associados } = await supabase
          .from("associado")
          .select("cpf_associado, nom_associado")
          .in("cpf_associado", cpfs);

        // Mapear nomes aos cupons reservados
        const reservadosComNomes = reservados.map(r => ({
          ...r,
          associado: associados?.find(a => a.cpf_associado === r.cpf_associado)
        }));
        setCuponsReservados(reservadosComNomes);
      } else {
        setCuponsReservados([]);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const criarCupom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comercioInfo) return;

    // Validar datas
    const hoje = new Date().toISOString().split("T")[0];
    if (dataInicio < hoje) {
      toast.error("A data de início não pode ser anterior a hoje");
      return;
    }
    if (dataTermino <= dataInicio) {
      toast.error("A data de término deve ser posterior à data de início");
      return;
    }

    try {
      // Gerar código único do cupom (12 caracteres)
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const codigo = (timestamp + random).substring(0, 12);
      
      const { error } = await supabase
        .from("cupom")
        .insert({
          num_cupom: codigo,
          tit_cupom: titulo,
          per_desc_cupom: parseFloat(percentual),
          dta_emissao_cupom: hoje,
          dta_inicio_cupom: dataInicio,
          dta_termino_cupom: dataTermino,
          cnpj_comercio: comercioInfo.cnpj_comercio
        });

      if (error) throw error;

      toast.success("Cupom criado com sucesso!");
      setDialogOpen(false);
      setTitulo("");
      setPercentual("");
      setDataInicio("");
      setDataTermino("");
      loadData();
    } catch (error: any) {
      toast.error("Erro ao criar cupom: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Meus Cupons</h1>
            {comercioInfo && (
              <p className="text-muted-foreground mt-2">{comercioInfo.nom_fantasia_comercio}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {comercioInfo && (
              <span className="text-sm text-muted-foreground">{comercioInfo.nom_fantasia_comercio}</span>
            )}
            <div className="flex gap-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-hero">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Cupom
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Cupom</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do cupom de desconto
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={criarCupom} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título do Cupom</Label>
                      <Input
                        id="titulo"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Ex: Desconto de Verão"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="percentual">Percentual de Desconto (%)</Label>
                      <Input
                        id="percentual"
                        type="number"
                        min="1"
                        max="100"
                        value={percentual}
                        onChange={(e) => setPercentual(e.target.value)}
                        placeholder="Ex: 15"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataInicio">Data de Início</Label>
                      <Input
                        id="dataInicio"
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataTermino">Data de Término</Label>
                      <Input
                        id="dataTermino"
                        type="date"
                        min={dataInicio || new Date().toISOString().split("T")[0]}
                        value={dataTermino}
                        onChange={(e) => setDataTermino(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full gradient-hero">
                      Criar Cupom
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Cupons Ativos</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {meusCupons.map((cupom) => (
              <Card key={cupom.num_cupom}>
                <CardHeader>
                  <CardTitle>{cupom.tit_cupom}</CardTitle>
                  <CardDescription>Código: {cupom.num_cupom}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-lg">{cupom.per_desc_cupom}% OFF</Badge>
                    <p className="text-sm text-muted-foreground">
                      Válido de {new Date(cupom.dta_inicio_cupom).toLocaleDateString()} até {new Date(cupom.dta_termino_cupom).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-semibold">Cupons Reservados por Clientes</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cuponsReservados.map((reserva) => (
              <Card key={reserva.id_cupom_associado}>
                <CardHeader>
                  <CardTitle>{reserva.cupom.tit_cupom}</CardTitle>
                  <CardDescription>
                    Cliente: {reserva.associado?.nom_associado || "N/A"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-lg">{reserva.cupom.per_desc_cupom}% OFF</Badge>
                    <p className="text-sm font-mono bg-muted p-2 rounded">{reserva.num_cupom}</p>
                    <p className="text-sm text-muted-foreground">
                      Reservado em {new Date(reserva.dta_cupom_associado).toLocaleDateString()}
                    </p>
                    {reserva.dta_uso_cupom_associado ? (
                      <Badge variant="outline">Usado em {new Date(reserva.dta_uso_cupom_associado).toLocaleDateString()}</Badge>
                    ) : (
                      <Badge>Aguardando uso</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cupons;

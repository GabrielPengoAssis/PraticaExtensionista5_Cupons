import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ticket } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Cadastro = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tipoInicial = searchParams.get("tipo") === "comerciante" ? "comerciante" : "associado";
  const [loading, setLoading] = useState(false);
  const [categoria, setCategoria] = useState("");

  const handleSubmitAssociado = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const senha = formData.get("senha") as string;
    const confirmaSenha = formData.get("confirma-senha") as string;

    if (senha !== confirmaSenha) {
      toast.error("As senhas não coincidem");
      setLoading(false);
      return;
    }

    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar usuário");

      // Inserir dados do associado
      const { error: insertError } = await supabase
        .from("associado")
        .insert({
          user_id: authData.user.id,
          nom_associado: formData.get("nome") as string,
          cpf_associado: parseInt((formData.get("cpf") as string).replace(/\D/g, "")),
          dta_associado: formData.get("data-nascimento") as string,
          cel_associado: formData.get("telefone") as string,
          email_associado: email,
          end_associado: formData.get("endereco") as string,
          bai_associado: formData.get("bairro") as string,
          cep_associado: formData.get("cep") as string,
          uf_associado: formData.get("uf") as string,
          cid_associado: formData.get("cidade") as string,
          sen_associado: senha
        });

      if (insertError) throw insertError;

      toast.success("Cadastro realizado com sucesso! Você já pode fazer login.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Erro ao realizar cadastro");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComerciante = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const senha = formData.get("senha") as string;
    const confirmaSenha = formData.get("confirma-senha") as string;

    if (senha !== confirmaSenha) {
      toast.error("As senhas não coincidem");
      setLoading(false);
      return;
    }

    if (!categoria) {
      toast.error("Selecione uma categoria");
      setLoading(false);
      return;
    }

    try {
      // Buscar id da categoria
      const { data: categoriaData, error: catError } = await supabase
        .from("categoria")
        .select("id_categoria")
        .eq("nom_categoria", categoria)
        .single();

      if (catError) throw catError;

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar usuário");

      // Inserir dados do comerciante
      const { error: insertError } = await supabase
        .from("comercio")
        .insert({
          user_id: authData.user.id,
          nom_fantasia_comercio: formData.get("nome-fantasia") as string,
          raz_social_comercio: formData.get("razao-social") as string,
          cnpj_comercio: parseInt((formData.get("cnpj") as string).replace(/\D/g, "")),
          id_categoria: categoriaData.id_categoria,
          con_comercio: formData.get("telefone") as string,
          email_comercio: email,
          end_comercio: formData.get("endereco") as string,
          bai_comercio: formData.get("bairro") as string,
          cep_comercio: formData.get("cep") as string,
          uf_comercio: formData.get("uf") as string,
          cid_comercio: formData.get("cidade") as string,
          sen_comercio: senha
        });

      if (insertError) throw insertError;

      toast.success("Cadastro realizado com sucesso! Você já pode fazer login.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Erro ao realizar cadastro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background py-12 px-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Ticket className="h-10 w-10 text-primary" />
            <span className="text-3xl font-display font-bold">Cupom Fácil</span>
          </Link>
          <p className="text-muted-foreground">Crie sua conta</p>
        </div>

        <Card className="p-8 shadow-elevated border-2 border-primary/10 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
          <Tabs defaultValue={tipoInicial} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="associado">Associado</TabsTrigger>
              <TabsTrigger value="comerciante">Comerciante</TabsTrigger>
            </TabsList>

            <TabsContent value="associado">
              <form onSubmit={handleSubmitAssociado} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input name="nome" id="nome" type="text" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input name="cpf" id="cpf" type="text" placeholder="000.000.000-00" required maxLength={14} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data-nascimento">Data de Nascimento *</Label>
                    <Input name="data-nascimento" id="data-nascimento" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input name="telefone" id="telefone" type="tel" placeholder="(00) 00000-0000" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-associado">E-mail *</Label>
                  <Input name="email" id="email-associado" type="email" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço *</Label>
                  <Input name="endereco" id="endereco" type="text" placeholder="Rua, número" required />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input name="bairro" id="bairro" type="text" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP *</Label>
                    <Input name="cep" id="cep" type="text" placeholder="00000-000" required maxLength={9} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uf-associado">UF *</Label>
                    <Input name="uf" id="uf-associado" type="text" maxLength={2} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade-associado">Cidade *</Label>
                  <Input name="cidade" id="cidade-associado" type="text" required />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="senha-associado">Senha *</Label>
                    <Input name="senha" id="senha-associado" type="password" required minLength={6} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirma-senha-associado">Confirmar Senha *</Label>
                    <Input name="confirma-senha" id="confirma-senha-associado" type="password" required minLength={6} />
                  </div>
                </div>

                <Button type="submit" className="w-full gradient-hero" disabled={loading}>
                  {loading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="comerciante">
              <form onSubmit={handleSubmitComerciante} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome-fantasia">Nome Fantasia *</Label>
                    <Input name="nome-fantasia" id="nome-fantasia" type="text" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="razao-social">Razão Social *</Label>
                    <Input name="razao-social" id="razao-social" type="text" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj-cadastro">CNPJ *</Label>
                    <Input name="cnpj" id="cnpj-cadastro" type="text" placeholder="00.000.000/0000-00" required maxLength={18} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select value={categoria} onValueChange={setCategoria} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alimentação">Alimentação</SelectItem>
                        <SelectItem value="Vestuário">Vestuário</SelectItem>
                        <SelectItem value="Saúde e Beleza">Saúde e Beleza</SelectItem>
                        <SelectItem value="Serviços">Serviços</SelectItem>
                        <SelectItem value="Educação">Educação</SelectItem>
                        <SelectItem value="Entretenimento">Entretenimento</SelectItem>
                        <SelectItem value="Automotivo">Automotivo</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone-comercio">Telefone *</Label>
                    <Input name="telefone" id="telefone-comercio" type="tel" placeholder="(00) 00000-0000" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-comercio">E-mail *</Label>
                    <Input name="email" id="email-comercio" type="email" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco-comercio">Endereço *</Label>
                  <Input name="endereco" id="endereco-comercio" type="text" placeholder="Rua, número" required />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bairro-comercio">Bairro *</Label>
                    <Input name="bairro" id="bairro-comercio" type="text" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep-comercio">CEP *</Label>
                    <Input name="cep" id="cep-comercio" type="text" placeholder="00000-000" required maxLength={9} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uf-comercio">UF *</Label>
                    <Input name="uf" id="uf-comercio" type="text" maxLength={2} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade-comercio">Cidade *</Label>
                  <Input name="cidade" id="cidade-comercio" type="text" required />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="senha-comercio">Senha *</Label>
                    <Input name="senha" id="senha-comercio" type="password" required minLength={6} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirma-senha-comercio">Confirmar Senha *</Label>
                    <Input name="confirma-senha" id="confirma-senha-comercio" type="password" required minLength={6} />
                  </div>
                </div>

                <Button type="submit" className="w-full gradient-hero" disabled={loading}>
                  {loading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Fazer login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Cadastro;

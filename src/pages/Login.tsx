import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Verificar se já está logado
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Verificar tipo de usuário e redirecionar
        const { data: associado } = await supabase
          .from("associado")
          .select("cpf_associado")
          .eq("user_id", session.user.id)
          .maybeSingle();
        
        if (associado) {
          navigate("/associado/cupons");
        } else {
          navigate("/comerciante/cupons");
        }
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Verificar tipo de usuário
        const { data: associado } = await supabase
          .from("associado")
          .select("cpf_associado")
          .eq("user_id", data.user.id)
          .maybeSingle();
        
        toast.success("Login realizado com sucesso!");
        
        if (associado) {
          navigate("/associado/cupons");
        } else {
          navigate("/comerciante/cupons");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Ticket className="h-10 w-10 text-primary" />
            <span className="text-3xl font-display font-bold">Cupom Fácil</span>
          </Link>
          <p className="text-muted-foreground">Entre na sua conta</p>
        </div>

        <Card className="p-8 shadow-elevated border-2 border-primary/10 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full gradient-hero" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link to="/cadastro" className="text-primary hover:underline font-medium">
                Cadastre-se
              </Link>
            </p>
            <Button variant="link" className="text-sm text-muted-foreground">
              Esqueci minha senha
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;

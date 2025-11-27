import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Ticket, Store, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-8 w-8 text-primary" />
            <span className="text-2xl font-display font-bold text-foreground">Cupom Fácil</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/cadastro">
              <Button className="gradient-hero">Cadastrar</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Content */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Descontos que Conectam Comunidades
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
          Plataforma que une comerciantes locais e moradores através de cupons de desconto exclusivos
        </p>
        <h3 className="text-2xl font-display font-semibold mb-3">Cadastre-se agora!</h3>
        <div className="flex gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <Link to="/cadastro?tipo=associado">
            <Button size="lg" className="gradient-hero shadow-elevated hover:scale-105 transition-smooth">
              Sou Morador
            </Button>
          </Link>
          <Link to="/cadastro?tipo=comerciante">
            <Button size="lg" variant="outline" className="hover:scale-105 transition-smooth">
              Sou Comerciante
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 shadow-card hover:shadow-elevated transition-smooth border-2 hover:border-primary/50 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-display font-semibold mb-3">Para Associados</h3>
            <p className="text-muted-foreground leading-relaxed">
              Acesse cupons exclusivos de estabelecimentos locais e economize em suas compras diárias
            </p>
          </Card>

          <Card className="p-8 shadow-card hover:shadow-elevated transition-smooth border-2 hover:border-primary/50 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
            <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
              <Store className="h-7 w-7 text-secondary" />
            </div>
            <h3 className="text-2xl font-display font-semibold mb-3">Para Comerciantes</h3>
            <p className="text-muted-foreground leading-relaxed">
              Promova seu negócio, atraia novos clientes e fortaleça sua presença na comunidade
            </p>
          </Card>

          <Card className="p-8 shadow-card hover:shadow-elevated transition-smooth border-2 hover:border-primary/50 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1000">
            <div className="w-14 h-14 rounded-xl bg-success/20 flex items-center justify-center mb-4">
              <TrendingUp className="h-7 w-7 text-success" />
            </div>
            <h3 className="text-2xl font-display font-semibold mb-3">Comércio Local</h3>
            <p className="text-muted-foreground leading-relaxed">
              Fortalecimento da economia local através de conexões diretas entre vizinhos e comércios
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-border">
        <div className="text-center text-muted-foreground">
          <p>© 2025 Cupom Fácil - Projeto Acadêmico UNAERP</p>
          <p className="text-sm mt-2">Prática Extensionista V</p>
          <p className="text-sm mt-1">Gabriel Pengo de Assis - 838389</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

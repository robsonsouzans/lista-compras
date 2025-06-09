
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Mail, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';

const Auth = () => {
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();
  const [authLoading, setAuthLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  // Se o usuário já está logado, redirecionar para a página principal
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        console.error('Erro de login:', error);
        toast({
          title: "Erro no login",
          description: error.message === "Invalid login credentials" 
            ? "Email ou senha incorretos" 
            : "Erro ao fazer login. Verifique suas credenciais.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta!",
        });
        // A navegação será feita automaticamente pelo Navigate acima
      }
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    if (signUpData.password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      setAuthLoading(false);
      return;
    }

    try {
      const { error } = await signUp(signUpData.email, signUpData.password, signUpData.fullName);
      
      if (error) {
        console.error('Erro de cadastro:', error);
        toast({
          title: "Erro no cadastro",
          description: error.message === "User already registered" 
            ? "Este email já está cadastrado" 
            : "Erro ao criar conta. Verifique os dados informados.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar a conta",
        });
        setSignUpData({ email: '', password: '', fullName: '' });
      }
    } catch (error) {
      console.error('Erro inesperado no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Lista de Compras
            </h1>
          </div>
          <p className="text-muted-foreground">
            Organize suas compras de forma prática
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Fazer Login</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        required
                        disabled={authLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10"
                        required
                        disabled={authLoading}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={authLoading}>
                    {authLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Criar Conta</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Seu nome completo"
                        value={signUpData.fullName}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="pl-10"
                        required
                        disabled={authLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        required
                        disabled={authLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10"
                        required
                        minLength={6}
                        disabled={authLoading}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={authLoading}>
                    {authLoading ? "Criando conta..." : "Criar Conta"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;

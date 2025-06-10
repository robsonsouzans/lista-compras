
import { useState } from 'react';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Share2, Trash2, Users, RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const ListManager = () => {
  const {
    lists,
    currentListId,
    setCurrentListId,
    createList,
    deleteList,
    shareList,
    isLoading,
    reloadLists,
  } = useShoppingLists();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedListForShare, setSelectedListForShare] = useState<string | null>(null);
  const [newListForm, setNewListForm] = useState({
    name: '',
    description: '',
  });
  const [shareEmail, setShareEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newListForm.name.trim()) {
      setIsCreating(true);
      try {
        await createList(newListForm.name.trim(), newListForm.description.trim() || undefined);
        setNewListForm({ name: '', description: '' });
        setIsCreateDialogOpen(false);
      } catch (error) {
        console.error('Erro ao criar lista:', error);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleShareList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedListForShare && shareEmail.trim()) {
      setIsSharing(true);
      try {
        await shareList(selectedListForShare, shareEmail.trim());
        setShareEmail('');
        setIsShareDialogOpen(false);
        setSelectedListForShare(null);
      } catch (error) {
        console.error('Erro ao compartilhar lista:', error);
      } finally {
        setIsSharing(false);
      }
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta lista? Esta ação não pode ser desfeita.')) {
      await deleteList(listId);
    }
  };

  const currentList = lists.find(list => list.id === currentListId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Carregando Listas...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando suas listas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Minhas Listas
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={reloadLists}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {lists.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Você ainda não possui nenhuma lista. Crie sua primeira lista para começar!
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Seletor de Lista Atual */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Lista Atual:</label>
                <Select value={currentListId || ''} onValueChange={setCurrentListId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma lista" />
                  </SelectTrigger>
                  <SelectContent>
                    {lists.map(list => (
                      <SelectItem key={list.id} value={list.id}>
                        <div className="flex items-center gap-2">
                          <span>{list.name}</span>
                          {list.isShared && (
                            <Badge variant="secondary" className="text-xs">
                              Compartilhada
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Informações da Lista Atual */}
              {currentList && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h3 className="font-medium">{currentList.name}</h3>
                  {currentList.description && (
                    <p className="text-sm text-muted-foreground">{currentList.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {currentList.isShared ? (
                      <Badge variant="secondary">Compartilhada comigo</Badge>
                    ) : (
                      <Badge variant="default">Minha lista</Badge>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Ações */}
          <div className="flex gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Lista
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Lista</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateList} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome da Lista</label>
                    <Input
                      value={newListForm.name}
                      onChange={(e) => setNewListForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Lista do Mercado, Churrasco..."
                      required
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descrição (opcional)</label>
                    <Input
                      value={newListForm.description}
                      onChange={(e) => setNewListForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição da lista..."
                      disabled={isCreating}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)} 
                      className="flex-1"
                      disabled={isCreating}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        'Criar'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {currentList && !currentList.isShared && (
              <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedListForShare(currentList.id)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Compartilhar Lista</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleShareList} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Email ou nome do usuário</label>
                      <Input
                        type="text"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        placeholder="Digite o email ou nome do usuário"
                        required
                        disabled={isSharing}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        O usuário deve estar registrado no sistema
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsShareDialogOpen(false)} 
                        className="flex-1"
                        disabled={isSharing}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="flex-1" disabled={isSharing}>
                        {isSharing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Compartilhando...
                          </>
                        ) : (
                          'Compartilhar'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            {currentList && !currentList.isShared && (
              <Button 
                variant="outline"
                size="icon"
                onClick={() => handleDeleteList(currentList.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

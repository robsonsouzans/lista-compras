
import { useState } from 'react';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Share2, Trash2, Users } from 'lucide-react';

export const ListManager = () => {
  const {
    lists,
    currentListId,
    setCurrentListId,
    createList,
    deleteList,
    shareList,
  } = useShoppingLists();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedListForShare, setSelectedListForShare] = useState<string | null>(null);
  const [newListForm, setNewListForm] = useState({
    name: '',
    description: '',
  });
  const [shareEmail, setShareEmail] = useState('');

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newListForm.name.trim()) {
      await createList(newListForm.name.trim(), newListForm.description.trim() || undefined);
      setNewListForm({ name: '', description: '' });
      setIsCreateDialogOpen(false);
    }
  };

  const handleShareList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedListForShare && shareEmail.trim()) {
      await shareList(selectedListForShare, shareEmail.trim());
      setShareEmail('');
      setIsShareDialogOpen(false);
      setSelectedListForShare(null);
    }
  };

  const currentList = lists.find(list => list.id === currentListId);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Minhas Listas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descrição (opcional)</label>
                    <Input
                      value={newListForm.description}
                      onChange={(e) => setNewListForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição da lista..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1">
                      Criar
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
                      <label className="text-sm font-medium">Email do usuário</label>
                      <Input
                        type="email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        placeholder="usuario@email.com"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsShareDialogOpen(false)} className="flex-1">
                        Cancelar
                      </Button>
                      <Button type="submit" className="flex-1">
                        Compartilhar
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
                onClick={() => deleteList(currentList.id)}
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

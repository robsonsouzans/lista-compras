
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { UserMenu } from '@/components/UserMenu';
import { ShoppingListItem } from '@/components/ShoppingListItem';
import { AddItemForm } from '@/components/AddItemForm';
import { ShoppingStats } from '@/components/ShoppingStats';
import { ListManager } from '@/components/ListManager';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import { useShoppingListSupabaseV2 } from '@/hooks/useShoppingListSupabaseV2';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCheck } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const { currentListId, lists } = useShoppingLists();
  const {
    items,
    isLoading: itemsLoading,
    addItem,
    toggleItem,
    removeItem,
    updateItem,
    clearCompleted,
    clearAll,
    getStats,
  } = useShoppingListSupabaseV2(currentListId);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const stats = getStats();
  const currentList = lists.find(list => list.id === currentListId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Lista de Compras
            </h1>
            {currentList && (
              <p className="text-muted-foreground">
                {currentList.name}
                {currentList.isShared && " (Compartilhada)"}
              </p>
            )}
          </div>
          <UserMenu />
        </div>

        {/* Gerenciador de Listas */}
        <ListManager />

        {currentListId ? (
          <>
            {/* Estatísticas */}
            <ShoppingStats stats={stats} />

            {/* Formulário de Adicionar Item */}
            <AddItemForm onAddItem={addItem} />

            {/* Ações da Lista */}
            {items.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={clearCompleted}
                  disabled={stats.completedItems === 0}
                  className="flex-1"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Limpar Comprados ({stats.completedItems})
                </Button>
                <Button
                  variant="outline"
                  onClick={clearAll}
                  className="flex-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Tudo
                </Button>
              </div>
            )}

            {/* Lista de Itens */}
            <div className="space-y-3">
              {itemsLoading ? (
                <LoadingSkeleton />
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    Sua lista está vazia. Adicione alguns itens para começar!
                  </p>
                </div>
              ) : (
                items.map(item => (
                  <ShoppingListItem
                    key={item.id}
                    item={item}
                    onToggle={toggleItem}
                    onRemove={removeItem}
                    onUpdate={updateItem}
                  />
                ))
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Crie uma nova lista para começar a adicionar itens!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

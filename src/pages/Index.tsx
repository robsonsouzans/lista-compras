
import { useAuth } from '@/hooks/useAuth';
import { useShoppingListSupabase } from '@/hooks/useShoppingListSupabase';
import { ShoppingStats } from '@/components/ShoppingStats';
import { ShoppingListItem } from '@/components/ShoppingListItem';
import { AddItemForm } from '@/components/AddItemForm';
import { UserMenu } from '@/components/UserMenu';
import { ShoppingListSkeleton, StatsSkeleton } from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Trash2, CheckCircle, Filter } from 'lucide-react';
import { useState } from 'react';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    items,
    isLoading,
    addItem,
    toggleItem,
    removeItem,
    updateItem,
    clearCompleted,
    clearAll,
    getStats,
  } = useShoppingListSupabase();

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Redirecionar para login se não autenticado
  if (!authLoading && !user) {
    window.location.href = '/auth';
    return null;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="h-10 w-64 bg-muted rounded-lg mx-auto animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded mx-auto animate-pulse" />
          </div>
          <StatsSkeleton />
          <ShoppingListSkeleton />
        </div>
      </div>
    );
  }

  const stats = getStats();

  const filteredItems = items.filter(item => {
    if (filter === 'pending') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });

  const remainingValue = stats.totalValue - stats.completedValue;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8 animate-fade-in">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1" />
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Lista de Compras
              </h1>
              <p className="text-muted-foreground text-lg">
                Organize suas compras de forma prática e eficiente
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <ShoppingStats stats={stats} />

        {/* Add Item Form */}
        <AddItemForm onAddItem={addItem} />

        {/* Total Estimado */}
        {stats.totalItems > 0 && (
          <Card className="bg-gradient-to-r from-card to-muted/20 border-primary/20">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">Resumo da Compra</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>Total estimado: R$ {stats.totalValue.toFixed(2)}</span>
                    <span>Já gasto: R$ {stats.completedValue.toFixed(2)}</span>
                    <span>Restante: R$ {remainingValue.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {stats.completedItems > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={clearCompleted}
                      className="text-success hover:bg-success/10"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Limpar Comprados
                    </Button>
                  )}
                  {stats.totalItems > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={clearAll}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpar Tudo
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        {stats.totalItems > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filtrar:</span>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'Todos', count: stats.totalItems },
                { key: 'pending', label: 'Pendentes', count: stats.totalItems - stats.completedItems },
                { key: 'completed', label: 'Comprados', count: stats.completedItems }
              ].map((filterOption) => (
                <Button
                  key={filterOption.key}
                  variant={filter === filterOption.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(filterOption.key as typeof filter)}
                  className="gap-2"
                >
                  {filterOption.label}
                  <Badge variant="secondary" className="text-xs">
                    {filterOption.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Shopping List */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card className="border-dashed border-2 border-muted-foreground/25">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  {items.length === 0 
                    ? "Sua lista está vazia" 
                    : `Nenhum item ${filter === 'pending' ? 'pendente' : 'comprado'}`
                  }
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  {items.length === 0 
                    ? "Comece adicionando alguns itens à sua lista de compras!"
                    : `Altere o filtro para ver ${filter === 'pending' ? 'itens comprados' : 'itens pendentes'}.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {filteredItems.map((item) => (
                <ShoppingListItem
                  key={item.id}
                  item={item}
                  onToggle={toggleItem}
                  onRemove={removeItem}
                  onUpdate={updateItem}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Feito com ♥ para facilitar suas compras
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;

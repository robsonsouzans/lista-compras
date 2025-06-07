
import { useState, useEffect } from 'react';
import { ShoppingItem, ShoppingListStats } from '@/types/shopping';
import { useToast } from '@/hooks/use-toast';

export const useShoppingList = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Simular carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const addItem = (name: string, quantity: number, price: number) => {
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name,
      quantity,
      price,
      completed: false,
      createdAt: new Date(),
    };

    setItems(prev => [...prev, newItem]);
    toast({
      title: "Item adicionado!",
      description: `${name} foi adicionado à sua lista.`,
    });
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = {
          ...item,
          completed: !item.completed,
          completedAt: !item.completed ? new Date() : undefined,
        };
        
        toast({
          title: updated.completed ? "Item marcado!" : "Item desmarcado!",
          description: updated.completed 
            ? `${item.name} foi marcado como comprado.`
            : `${item.name} foi desmarcado.`,
        });
        
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    const item = items.find(item => item.id === id);
    setItems(prev => prev.filter(item => item.id !== id));
    
    if (item) {
      toast({
        title: "Item removido!",
        description: `${item.name} foi removido da lista.`,
        variant: "destructive",
      });
    }
  };

  const updateItem = (id: string, updates: Partial<ShoppingItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const clearCompleted = () => {
    const completedCount = items.filter(item => item.completed).length;
    setItems(prev => prev.filter(item => !item.completed));
    
    toast({
      title: "Lista limpa!",
      description: `${completedCount} itens comprados foram removidos.`,
    });
  };

  const clearAll = () => {
    setItems([]);
    toast({
      title: "Lista limpa!",
      description: "Todos os itens foram removidos da lista.",
    });
  };

  const getStats = (): ShoppingListStats => {
    const totalItems = items.length;
    const completedItems = items.filter(item => item.completed).length;
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const completedValue = items
      .filter(item => item.completed)
      .reduce((sum, item) => sum + (item.quantity * item.price), 0);

    return {
      totalItems,
      completedItems,
      totalValue,
      completedValue,
    };
  };

  return {
    items,
    isLoading,
    addItem,
    toggleItem,
    removeItem,
    updateItem,
    clearCompleted,
    clearAll,
    getStats,
  };
};

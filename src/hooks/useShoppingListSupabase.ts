
import { useState, useEffect } from 'react';
import { ShoppingItem, ShoppingListStats } from '@/types/shopping';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useShoppingListSupabase = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [defaultListId, setDefaultListId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Criar ou obter lista padrão do usuário
  const ensureDefaultList = async () => {
    if (!user) return null;

    try {
      // Verificar se já existe uma lista para o usuário
      const { data: existingLists, error: fetchError } = await supabase
        .from('shopping_lists')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (fetchError) {
        console.error('Erro ao buscar listas:', fetchError);
        return null;
      }

      if (existingLists && existingLists.length > 0) {
        return existingLists[0].id;
      }

      // Criar lista padrão se não existir
      const { data: newList, error: createError } = await supabase
        .from('shopping_lists')
        .insert({
          user_id: user.id,
          name: 'Minha Lista de Compras',
          description: 'Lista padrão'
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Erro ao criar lista:', createError);
        return null;
      }

      return newList.id;
    } catch (error) {
      console.error('Erro ao gerenciar lista padrão:', error);
      return null;
    }
  };

  // Carregar itens do usuário
  const loadItems = async () => {
    if (!user) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      const listId = await ensureDefaultList();
      if (!listId) {
        setIsLoading(false);
        return;
      }

      setDefaultListId(listId);

      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('list_id', listId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar itens:', error);
        toast({
          title: "Erro ao carregar lista",
          description: "Não foi possível carregar seus itens",
          variant: "destructive",
        });
      } else {
        const formattedItems: ShoppingItem[] = data.map(item => ({
          id: item.id,
          name: item.name,
          quantity: Number(item.quantity || 1),
          unit: (item.unit as 'unidade' | 'kg') || 'unidade',
          price: Number(item.price || 0),
          completed: item.completed || false,
          createdAt: new Date(item.created_at || Date.now()),
          completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
        }));
        setItems(formattedItems);
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      toast({
        title: "Erro ao carregar lista",
        description: "Não foi possível carregar seus itens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [user]);

  const addItem = async (name: string, quantity: number, unit: 'unidade' | 'kg', price: number) => {
    if (!user || !defaultListId) return;

    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .insert({
          user_id: user.id,
          list_id: defaultListId,
          name,
          quantity,
          unit,
          price,
          completed: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar item:', error);
        toast({
          title: "Erro ao adicionar item",
          description: "Não foi possível adicionar o item",
          variant: "destructive",
        });
      } else {
        const newItem: ShoppingItem = {
          id: data.id,
          name: data.name,
          quantity: Number(data.quantity || 1),
          unit: (data.unit as 'unidade' | 'kg') || 'unidade',
          price: Number(data.price || 0),
          completed: data.completed || false,
          createdAt: new Date(data.created_at || Date.now()),
        };
        
        setItems(prev => [newItem, ...prev]);
        toast({
          title: "Item adicionado!",
          description: `${name} foi adicionado à sua lista.`,
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "Erro ao adicionar item",
        description: "Não foi possível adicionar o item",
        variant: "destructive",
      });
    }
  };

  const toggleItem = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (!item) return;

    const newCompleted = !item.completed;
    const completedAt = newCompleted ? new Date().toISOString() : null;

    try {
      const { error } = await supabase
        .from('shopping_items')
        .update({ 
          completed: newCompleted,
          completed_at: completedAt,
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar item:', error);
        toast({
          title: "Erro ao atualizar item",
          description: "Não foi possível atualizar o item",
          variant: "destructive",
        });
      } else {
        setItems(prev => prev.map(item => {
          if (item.id === id) {
            return {
              ...item,
              completed: newCompleted,
              completedAt: newCompleted ? new Date() : undefined,
            };
          }
          return item;
        }));

        toast({
          title: newCompleted ? "Item marcado!" : "Item desmarcado!",
          description: newCompleted 
            ? `${item.name} foi marcado como comprado.`
            : `${item.name} foi desmarcado.`,
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: "Erro ao atualizar item",
        description: "Não foi possível atualizar o item",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (!item) return;

    try {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover item:', error);
        toast({
          title: "Erro ao remover item",
          description: "Não foi possível remover o item",
          variant: "destructive",
        });
      } else {
        setItems(prev => prev.filter(item => item.id !== id));
        toast({
          title: "Item removido!",
          description: `${item.name} foi removido da lista.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast({
        title: "Erro ao remover item",
        description: "Não foi possível remover o item",
        variant: "destructive",
      });
    }
  };

  const updateItem = async (id: string, updates: Partial<ShoppingItem>) => {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .update({
          name: updates.name,
          quantity: updates.quantity,
          unit: updates.unit,
          price: updates.price,
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar item:', error);
        toast({
          title: "Erro ao atualizar item",
          description: "Não foi possível atualizar o item",
          variant: "destructive",
        });
      } else {
        setItems(prev => prev.map(item => 
          item.id === id ? { ...item, ...updates } : item
        ));
        toast({
          title: "Item atualizado!",
          description: "As alterações foram salvas.",
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: "Erro ao atualizar item",
        description: "Não foi possível atualizar o item",
        variant: "destructive",
      });
    }
  };

  const clearCompleted = async () => {
    if (!defaultListId) return;

    const completedItems = items.filter(item => item.completed);
    const completedIds = completedItems.map(item => item.id);

    if (completedIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .in('id', completedIds);

      if (error) {
        console.error('Erro ao limpar itens:', error);
        toast({
          title: "Erro ao limpar lista",
          description: "Não foi possível remover os itens comprados",
          variant: "destructive",
        });
      } else {
        setItems(prev => prev.filter(item => !item.completed));
        toast({
          title: "Lista limpa!",
          description: `${completedItems.length} itens comprados foram removidos.`,
        });
      }
    } catch (error) {
      console.error('Erro ao limpar itens:', error);
      toast({
        title: "Erro ao limpar lista",
        description: "Não foi possível remover os itens comprados",
        variant: "destructive",
      });
    }
  };

  const clearAll = async () => {
    if (!user || !defaultListId) return;

    try {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('list_id', defaultListId);

      if (error) {
        console.error('Erro ao limpar todos os itens:', error);
        toast({
          title: "Erro ao limpar lista",
          description: "Não foi possível limpar a lista",
          variant: "destructive",
        });
      } else {
        setItems([]);
        toast({
          title: "Lista limpa!",
          description: "Todos os itens foram removidos da lista.",
        });
      }
    } catch (error) {
      console.error('Erro ao limpar todos os itens:', error);
      toast({
        title: "Erro ao limpar lista",
        description: "Não foi possível limpar a lista",
        variant: "destructive",
      });
    }
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

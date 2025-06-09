
import { useState, useEffect } from 'react';
import { ShoppingList, ListShare } from '@/types/shoppingList';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useShoppingLists = () => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar todas as listas do usuário (próprias e compartilhadas)
  const loadLists = async () => {
    if (!user) {
      setLists([]);
      setCurrentListId(null);
      setIsLoading(false);
      return;
    }

    try {
      console.log('Carregando listas para o usuário:', user.id);
      
      // Buscar listas próprias
      const { data: ownLists, error: ownListsError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ownListsError) {
        console.error('Erro ao carregar listas próprias:', ownListsError);
        throw ownListsError;
      }

      console.log('Listas próprias carregadas:', ownLists);

      // Buscar listas compartilhadas
      const { data: sharedListsData, error: sharedListsError } = await supabase
        .from('list_shared_users')
        .select(`
          list_id,
          shopping_lists!inner (
            id,
            name,
            description,
            user_id,
            created_at
          )
        `)
        .eq('shared_with', user.id);

      if (sharedListsError) {
        console.error('Erro ao carregar listas compartilhadas:', sharedListsError);
        // Não falhar se não conseguir carregar listas compartilhadas
      }

      console.log('Listas compartilhadas carregadas:', sharedListsData);

      // Formatar listas próprias
      const formattedOwnLists: ShoppingList[] = (ownLists || []).map(list => ({
        id: list.id,
        name: list.name,
        description: list.description,
        user_id: list.user_id,
        created_at: new Date(list.created_at),
        isShared: false,
      }));

      // Formatar listas compartilhadas
      const formattedSharedLists: ShoppingList[] = (sharedListsData || []).map(item => ({
        id: item.shopping_lists.id,
        name: item.shopping_lists.name,
        description: item.shopping_lists.description,
        user_id: item.shopping_lists.user_id,
        created_at: new Date(item.shopping_lists.created_at),
        isShared: true,
        sharedBy: item.shopping_lists.user_id,
      }));

      const allLists = [...formattedOwnLists, ...formattedSharedLists];
      console.log('Todas as listas formatadas:', allLists);
      
      setLists(allLists);

      // Se não há lista atual selecionada, selecionar a primeira
      if (!currentListId && allLists.length > 0) {
        setCurrentListId(allLists[0].id);
        console.log('Lista atual definida para:', allLists[0].id);
      }

    } catch (error) {
      console.error('Erro ao carregar listas:', error);
      toast({
        title: "Erro ao carregar listas",
        description: "Não foi possível carregar suas listas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadLists();
    } else {
      setLists([]);
      setCurrentListId(null);
      setIsLoading(false);
    }
  }, [user]);

  const createList = async (name: string, description?: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar uma lista",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Criando nova lista:', { name, description, user_id: user.id });
      
      const { data, error } = await supabase
        .from('shopping_lists')
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description?.trim() || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar lista:', error);
        toast({
          title: "Erro ao criar lista",
          description: "Não foi possível criar a lista. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      console.log('Lista criada com sucesso:', data);

      const newList: ShoppingList = {
        id: data.id,
        name: data.name,
        description: data.description,
        user_id: data.user_id,
        created_at: new Date(data.created_at),
        isShared: false,
      };

      setLists(prev => [newList, ...prev]);
      setCurrentListId(newList.id);
      
      toast({
        title: "Lista criada!",
        description: `"${name}" foi criada com sucesso.`,
      });

      return newList.id;
    } catch (error) {
      console.error('Erro inesperado ao criar lista:', error);
      toast({
        title: "Erro ao criar lista",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const deleteList = async (listId: string) => {
    if (!user) return;

    try {
      console.log('Excluindo lista:', listId);
      
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', listId)
        .eq('user_id', user.id); // Garantir que só pode excluir próprias listas

      if (error) {
        console.error('Erro ao excluir lista:', error);
        toast({
          title: "Erro ao excluir lista",
          description: "Não foi possível excluir a lista. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      console.log('Lista excluída com sucesso');
      
      setLists(prev => prev.filter(list => list.id !== listId));
      
      if (currentListId === listId) {
        const remainingLists = lists.filter(list => list.id !== listId);
        setCurrentListId(remainingLists.length > 0 ? remainingLists[0].id : null);
      }

      toast({
        title: "Lista excluída!",
        description: "A lista foi excluída com sucesso.",
      });
    } catch (error) {
      console.error('Erro inesperado ao excluir lista:', error);
      toast({
        title: "Erro ao excluir lista",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const shareList = async (listId: string, userEmail: string) => {
    if (!user) return;

    try {
      console.log('Compartilhando lista:', { listId, userEmail });
      
      // Primeiro, buscar o usuário pelo email no auth.users
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error('Erro ao buscar usuários:', userError);
        toast({
          title: "Erro",
          description: "Não foi possível verificar o usuário",
          variant: "destructive",
        });
        return;
      }

      const targetUser = userData.users.find(u => u.email === userEmail);
      
      if (!targetUser) {
        toast({
          title: "Usuário não encontrado",
          description: "Não foi possível encontrar um usuário com esse email",
          variant: "destructive",
        });
        return;
      }

      // Verificar se a lista já não está compartilhada com este usuário
      const { data: existingShare } = await supabase
        .from('list_shared_users')
        .select('id')
        .eq('list_id', listId)
        .eq('shared_with', targetUser.id)
        .single();

      if (existingShare) {
        toast({
          title: "Lista já compartilhada",
          description: "Esta lista já está compartilhada com este usuário",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('list_shared_users')
        .insert({
          list_id: listId,
          shared_with: targetUser.id,
        });

      if (error) {
        console.error('Erro ao compartilhar lista:', error);
        toast({
          title: "Erro ao compartilhar lista",
          description: "Não foi possível compartilhar a lista. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      console.log('Lista compartilhada com sucesso');
      
      toast({
        title: "Lista compartilhada!",
        description: `A lista foi compartilhada com ${userEmail}.`,
      });
    } catch (error) {
      console.error('Erro inesperado ao compartilhar lista:', error);
      toast({
        title: "Erro ao compartilhar lista",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const unshareList = async (listId: string, userId: string) => {
    if (!user) return;

    try {
      console.log('Removendo compartilhamento:', { listId, userId });
      
      const { error } = await supabase
        .from('list_shared_users')
        .delete()
        .eq('list_id', listId)
        .eq('shared_with', userId);

      if (error) {
        console.error('Erro ao remover compartilhamento:', error);
        toast({
          title: "Erro ao remover compartilhamento",
          description: "Não foi possível remover o compartilhamento. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      console.log('Compartilhamento removido com sucesso');
      
      toast({
        title: "Compartilhamento removido!",
        description: "O compartilhamento foi removido com sucesso.",
      });
      
      // Recarregar listas para atualizar a interface
      await loadLists();
    } catch (error) {
      console.error('Erro inesperado ao remover compartilhamento:', error);
      toast({
        title: "Erro ao remover compartilhamento",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return {
    lists,
    currentListId,
    isLoading,
    setCurrentListId,
    createList,
    deleteList,
    shareList,
    unshareList,
    reloadLists: loadLists,
  };
};

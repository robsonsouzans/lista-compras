
import { useState } from 'react';
import { ShoppingItem } from '@/types/shopping';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit, Package, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShoppingListItemProps {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ShoppingItem>) => void;
}

export const ShoppingListItem = ({ item, onToggle, onRemove, onUpdate }: ShoppingListItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: item.name,
    quantity: item.quantity,
    price: item.price,
  });

  const totalItemPrice = item.quantity * item.price;

  const handleSaveEdit = () => {
    onUpdate(item.id, editForm);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    });
    setIsEditing(false);
  };

  return (
    <Card className={cn(
      "transition-all duration-300 animate-fade-in hover:shadow-lg",
      item.completed && "bg-muted/50 border-success/30"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={item.completed}
            onCheckedChange={() => onToggle(item.id)}
            className="data-[state=checked]:bg-success data-[state=checked]:border-success"
          />
          
          <div className="flex-1 space-y-1">
            <h3 className={cn(
              "font-medium transition-all duration-200",
              item.completed && "line-through text-muted-foreground"
            )}>
              {item.name}
            </h3>
            
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                <span>{item.quantity}x</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>R$ {item.price.toFixed(2)} cada</span>
              </div>
            </div>
          </div>

          <div className="text-right space-y-1">
            <Badge variant={item.completed ? "secondary" : "default"} className="font-bold">
              R$ {totalItemPrice.toFixed(2)}
            </Badge>
            {item.completed && item.completedAt && (
              <p className="text-xs text-muted-foreground">
                Comprado em {item.completedAt.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex gap-1">
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Editar Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium">Nome do Item</label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do item"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Quantidade</label>
                      <Input
                        type="number"
                        value={editForm.quantity}
                        onChange={(e) => setEditForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Preço (R$)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveEdit}>
                      Salvar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onRemove(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

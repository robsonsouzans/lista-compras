
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, ShoppingCart } from 'lucide-react';

interface AddItemFormProps {
  onAddItem: (name: string, quantity: number, unit: 'unidade' | 'kg', price: number) => void;
}

export const AddItemForm = ({ onAddItem }: AddItemFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    quantity: 1,
    unit: 'unidade' as 'unidade' | 'kg',
    price: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.name.trim() && form.quantity > 0 && form.price >= 0) {
      onAddItem(form.name.trim(), form.quantity, form.unit, form.price);
      setForm({ name: '', quantity: 1, unit: 'unidade', price: 0 });
      setIsOpen(false);
    }
  };

  const totalPrice = form.quantity * form.price;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Item
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Adicionar Novo Item
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium text-foreground">Nome do Item</label>
            <Input
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Leite, Pão, Banana..."
              required
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Quantidade</label>
              <Input
                type="number"
                step={form.unit === 'kg' ? '0.1' : '1'}
                value={form.quantity}
                onChange={(e) => setForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                min={form.unit === 'kg' ? '0.1' : '1'}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Unidade</label>
              <Select value={form.unit} onValueChange={(value: 'unidade' | 'kg') => setForm(prev => ({ ...prev, unit: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unidade">Unidade(s)</SelectItem>
                  <SelectItem value="kg">Kg</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Preço {form.unit === 'kg' ? 'por Kg' : 'Unitário'} (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                min="0"
                required
                className="mt-1"
                placeholder="0.00"
              />
            </div>
          </div>

          {form.name && form.quantity > 0 && form.price >= 0 && (
            <div className="bg-muted/50 p-3 rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total do Item:</span>
                <span className="text-lg font-bold text-primary">
                  R$ {totalPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {form.quantity}{form.unit === 'kg' ? 'kg' : 'x'} R$ {form.price.toFixed(2)}
                {form.unit === 'kg' ? '/kg' : ''}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-primary to-primary/80"
            >
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

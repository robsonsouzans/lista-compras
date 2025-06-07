
import { ShoppingListStats } from '@/types/shopping';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, CheckCircle, DollarSign, Target } from 'lucide-react';

interface ShoppingStatsProps {
  stats: ShoppingListStats;
}

export const ShoppingStats = ({ stats }: ShoppingStatsProps) => {
  const completionPercentage = stats.totalItems > 0 
    ? Math.round((stats.completedItems / stats.totalItems) * 100) 
    : 0;

  const remainingValue = stats.totalValue - stats.completedValue;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Itens</p>
              <p className="text-2xl font-bold text-primary">{stats.totalItems}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Comprados</p>
              <p className="text-2xl font-bold text-success">{stats.completedItems}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Gasto</p>
              <p className="text-2xl font-bold text-blue-600">
                R$ {stats.completedValue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Progresso</p>
              <p className="text-2xl font-bold text-orange-600">{completionPercentage}%</p>
            </div>
            <Target className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

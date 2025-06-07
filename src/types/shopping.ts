
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface ShoppingListStats {
  totalItems: number;
  completedItems: number;
  totalValue: number;
  completedValue: number;
}

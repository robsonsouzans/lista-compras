
export interface ShoppingList {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: Date;
  isShared?: boolean;
  sharedBy?: string;
}

export interface ListShare {
  id: string;
  list_id: string;
  shared_with: string;
  created_at: Date;
}

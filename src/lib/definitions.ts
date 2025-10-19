export type Category = {
  id: string;
  name: string;
};

export type Brand = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  model: string;
  price: number;
  unsoldStock: number;
  depotStock: number;
  depotLocation: string;
  notes: string;
  imageUrl: string;
  imageHint: string;
  category: string;
  brand: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type OrderItem = {
  productId: string;
  quantity: number;
};

export type Order = {
  id: string;
  customer: Customer;
  items: OrderItem[];
  status: 'Sipariş Alındı' | 'Kargoya Verildi';
  createdAt: string;
  notes: string;
};

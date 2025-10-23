
import type { Product, Customer, Order, Category, Brand } from './definitions';
import { PlaceHolderImages } from './placeholder-images';
import { User } from '@/context/auth-context';

export const categories: Category[] = [
  { id: 'cat_1', name: 'T-Shirt' },
  { id: 'cat_2', name: 'Gömlek' },
  { id: 'cat_3', name: 'Pantolon' },
  { id: 'cat_4', name: 'Aksesuar' },
];

export const brands: Brand[] = [
  { id: 'brand_1', name: 'Marka A' },
  { id: 'brand_2', name: 'Marka B' },
  { id: 'brand_3', name: 'Marka C' },
];

export const products: Product[] = PlaceHolderImages.map((img, index) => {
  const categoryIndex = index % categories.length;
  const brandIndex = index % brands.length;
  const basePrice = 20 + (index * 5) % 100;
  const unsold = 10 + (index * 15) % 190;
  const depot = 50 + (index * 25) % 150;
  
  return {
    id: img.id,
    name: img.description,
    model: `M-${1000 + index}`,
    price: parseFloat(basePrice.toFixed(2)),
    unsoldStock: unsold,
    depotStock: depot,
    depotLocation: `Raf ${String.fromCharCode(65 + (index % 5))}-${(index % 10) + 1}`,
    notes: 'Standart kalite kontrolü yapıldı.',
    imageUrl: img.imageUrl,
    imageHint: img.imageHint,
    category: categories[categoryIndex].name,
    brand: brands[brandIndex].name,
  }
});

export const customers: Customer[] = [
  { id: 'cus_1', name: 'Moda Evi A.Ş.', email: 'info@modaevi.com', phone: '0212 123 4567' },
  { id: 'cus_2', name: 'Tekstil Dünyası Ltd.', email: 'contact@tekstildunyasi.net', phone: '0216 987 6543' },
  { id: 'cus_3', name: 'Giyim Merkezi', email: 'siparis@giyimmerkezi.com', phone: '0312 555 8899' },
  { id: 'cus_4', name: 'Butik Zade', email: 'destek@butikzade.com', phone: '0232 444 1122' },
];

export const orders: Omit<Order, 'id'>[] = [
  {
    customerId: customers[0].id,
    items: [
      { productId: products[0].id, quantity: 10 },
      { productId: products[2].id, quantity: 25 },
    ],
    status: 'Kargoya Verildi',
    createdAt: '2024-05-20T10:30:00Z',
    notes: 'Acil gönderim talep edildi.',
  },
  {
    customerId: customers[1].id,
    items: [
      { productId: products[1].id, quantity: 50 },
    ],
    status: 'Sipariş Alındı',
    createdAt: '2024-05-22T14:00:00Z',
    notes: '',
  },
  {
    customerId: customers[2].id,
    items: [
      { productId: products[4].id, quantity: 5 },
      { productId: products[5].id, quantity: 5 },
      { productId: products[6].id, quantity: 10 },
    ],
    status: 'Sipariş Alındı',
    createdAt: '2024-05-23T09:15:00Z',
    notes: 'Hediye paketi yapılacak.',
  },
    {
    customerId: customers[3].id,
    items: [
      { productId: products[8].id, quantity: 12 },
    ],
    status: 'Kargoya Verildi',
    createdAt: '2024-05-19T16:45:00Z',
    notes: '',
  },
];

export const users: User[] = [
  { id: 'user_ahmet', name: 'Ahmet', email: 'ahmet@khsayem.tekstil', role: 'depo_muduru', language: 'tr' },
  { id: 'user_ayse', name: 'Ayşe', email: 'ayse@khsayem.tekstil', role: 'satis_elemani', language: 'tr' },
  { id: 'user_fatma', name: 'Fatma', email: 'fatma@khsayem.tekstil', role: 'muhasebeci', language: 'tr' },
  { id: 'user_admin', name: 'Admin', email: 'admin@khsayem.tekstil', role: 'genel_mudur', language: 'en' },
];

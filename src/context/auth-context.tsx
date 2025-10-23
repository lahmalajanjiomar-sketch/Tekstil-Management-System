
'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  categories as mockCategories,
  brands as mockBrands,
  products as mockProducts,
  customers as mockCustomers,
  orders as mockOrdersData,
  users as mockUsers
} from '@/lib/mock-data';
import type { Product, Order, Customer, Category, Brand, OrderItem } from '@/lib/definitions';
import { useI18n, Language } from './i18n-context';
import { User as FirebaseUser } from 'firebase/auth';
import { Firestore, collection, doc, onSnapshot, writeBatch, getDoc, setDoc, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useFirebase, useAuth as useFirebaseAuth } from '@/firebase';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';

export type UserRole = 'genel_mudur' | 'depo_muduru' | 'satis_elemani' | 'muhasebeci';

export const ALL_ROLES: UserRole[] = ['genel_mudur', 'depo_muduru', 'satis_elemani', 'muhasebeci'];

export interface CartItem {
  productId: string;
  quantity: number;
  productName: string;
  price: number;
  imageUrl: string;
  model: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  language: Language;
}

export type ActivityLogItemType = 'user' | 'product' | 'order' | 'customer';

export interface ActivityLogItem {
  id: string;
  type: ActivityLogItemType;
  description: string;
  deletedAt: string;
  data: any;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  users: User[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  categories: Category[];
  brands: Brand[];
  cart: CartItem[];
  activityLog: ActivityLogItem[];
  appTheme: string;
  isLoading: boolean;
  logout: () => void;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setAppTheme: (theme: string) => void;
  addUser: (name: string, role: UserRole, password?: string) => void;
  deleteUser: (userId: string) => void;
  updateUser: (userId: string, newName: string, newRole: UserRole, password?: string) => void;
  updateUserPreferences: (userId: string, preferences: { language?: Language }) => void;
  updateOrderStatus: (orderId: string, status: 'Sipariş Alındı' | 'Kargoya Verildi') => void;
  updateProductStock: (productId: string, quantity: number) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addCategory: (name: string) => void;
  addBrand: (name: string) => void;
  addCustomer: (name: string, email: string, phone: string) => void;
  deleteCustomer: (customerId: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'> & { customerId: string | null; customerName: string; customerContact: string; }) => void;
  deleteOrder: (orderId: string) => void;
  restoreItem: (logId: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultAdminUser: User = {
  id: 'user_admin',
  name: 'Admin',
  email: 'admin@khsayem.tekstil',
  role: 'genel_mudur',
  language: 'en',
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { firestore, auth } = useFirebase();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(defaultAdminUser);
  const [role, setRole] = useState<UserRole | null>(defaultAdminUser.role);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appTheme, setAppThemeState] = useState<string>('theme-default');

  const { setLang } = useI18n();

  const seedDatabase = useCallback(async (db: Firestore) => {
    console.log("Checking database seed status...");
    const seededRef = doc(db, 'internal', 'seeded');
    const seededSnap = await getDoc(seededRef).catch(() => null);

    if (seededSnap && seededSnap.exists()) {
      console.log("Database already seeded.");
      return;
    }

    console.log("Performing initial database seed...");
    const batch = writeBatch(db);

    mockUsers.forEach(user => {
        const docRef = doc(db, 'users', user.id);
        batch.set(docRef, user);
    });
    mockCategories.forEach(category => {
        const docRef = doc(db, 'categories', category.id);
        batch.set(docRef, category);
    });
    mockBrands.forEach(brand => {
        const docRef = doc(db, 'brands', brand.id);
        batch.set(docRef, brand);
    });
    mockProducts.forEach(product => {
        const docRef = doc(db, 'products', product.id);
        batch.set(docRef, product);
    });
    mockCustomers.forEach(customer => {
        const docRef = doc(db, 'customers', customer.id);
        batch.set(docRef, customer);
    });
    mockOrdersData.forEach((order, index) => {
        const orderId = `order_${index + 1}`;
        const docRef = doc(db, 'orders', orderId);
        batch.set(docRef, { ...order, id: orderId });
    });
    
    batch.set(seededRef, { isSeeded: true, seededAt: new Date().toISOString() });

    try {
        await batch.commit();
        console.log("Database seeded successfully.");
    } catch (e) {
        console.error("Error seeding database:", e);
    }
  }, []);

   useEffect(() => {
    if (!firestore ) return;
    seedDatabase(firestore);
  }, [firestore, seedDatabase]);

   useEffect(() => {
    if (!firestore) return;
    const unsubscribers = [
      onSnapshot(collection(firestore, 'users'), snapshot => setUsers(snapshot.docs.map(doc => ({ ...doc.data() as Omit<User, 'id'>, id: doc.id })))),
      onSnapshot(collection(firestore, 'products'), snapshot => setProducts(snapshot.docs.map(doc => ({ ...doc.data() as Omit<Product, 'id'>, id: doc.id })))),
      onSnapshot(collection(firestore, 'customers'), snapshot => setCustomers(snapshot.docs.map(doc => ({ ...doc.data() as Omit<Customer, 'id'>, id: doc.id })))),
      onSnapshot(collection(firestore, 'categories'), snapshot => setCategories(snapshot.docs.map(doc => ({ ...doc.data() as Omit<Category, 'id'>, id: doc.id })))),
      onSnapshot(collection(firestore, 'brands'), snapshot => setBrands(snapshot.docs.map(doc => ({ ...doc.data() as Omit<Brand, 'id'>, id: doc.id })))),
      onSnapshot(collection(firestore, 'activityLog'), snapshot => setActivityLog(snapshot.docs.map(doc => ({ ...doc.data() as Omit<ActivityLogItem, 'id'>, id: doc.id })).sort((a,b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()))),
      onSnapshot(collection(firestore, 'orders'), (snapshot) => {
          const fetchedOrders = snapshot.docs.map(doc => ({ ...doc.data() as Order, id: doc.id }));
          setOrders(fetchedOrders);
      }),
    ];
    return () => unsubscribers.forEach(unsub => unsub());
  }, [firestore]);
  
  useEffect(() => {
    const essentialDataLoaded = users.length > 0 && products.length > 0 && customers.length > 0 && orders.length > 0 && categories.length > 0 && brands.length > 0;
    
    if (essentialDataLoaded) {
        setIsLoading(false);
        if (user) {
            setLang(user.language);
        }
    }
  }, [users, products, customers, orders, categories, brands, user, setLang]);


  const logout = () => {
    if (auth) {
      auth.signOut();
    }
    setUser(null);
    setRole(null);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('app_theme');
      if (storedTheme) setAppThemeState(storedTheme);
    }
  }, []);

  const setAppTheme = (theme: string) => {
    setAppThemeState(theme);
    if (typeof window !== 'undefined') localStorage.setItem('app_theme', theme);
  };
  
  const logActivity = (type: ActivityLogItemType, description: string, data: any) => {
    if (!firestore) return;
    const newLog: Omit<ActivityLogItem, 'id'> = {
      type,
      description,
      deletedAt: new Date().toISOString(),
      data,
    };
    addDoc(collection(firestore, 'activityLog'), newLog);
  };

  const addUser = (name: string, role: UserRole, password = 'password') => {
    if (!firestore) return;
    const newUser: Omit<User, 'id'> = {
      name,
      email: `${name.toLowerCase().replace(/\s/g, '.')}@khsayem.tekstil`,
      role,
      language: 'tr',
    };
    addDoc(collection(firestore, 'users'), newUser);
  };

  const deleteUser = (userId: string) => {
    if (!firestore) return;
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete) {
      logActivity('user', `${userToDelete.name} (${userToDelete.role})`, userToDelete);
      deleteDoc(doc(firestore, 'users', userId));
    }
  };
  
  const updateUser = (userId: string, newName: string, newRole: UserRole) => {
     if (!firestore) return;
     updateDoc(doc(firestore, 'users', userId), { name: newName, role: newRole });
  };
  
  const updateUserPreferences = (userId: string, preferences: { language?: Language }) => {
     if (!firestore) return;
     updateDoc(doc(firestore, 'users', userId), preferences);
  };
  
  const updateOrderStatus = (orderId: string, status: 'Sipariş Alındı' | 'Kargoya Verildi') => {
    if (!firestore) return;
    const orderRef = doc(firestore, 'orders', orderId);
    
    updateDoc(orderRef, { status }).then(() => {
        if (status === 'Kargoya Verildi') {
            const order = orders.find(o => o.id === orderId);
            if (order) {
                const batch = writeBatch(firestore);
                order.items.forEach(item => {
                    const product = products.find(p => p.id === item.productId);
                    if (product) {
                        const productRef = doc(firestore, 'products', product.id);
                        const newUnsoldStock = Math.max(0, product.unsoldStock - item.quantity);
                        const newDepotStock = Math.max(0, product.depotStock - item.quantity);
                        batch.update(productRef, { unsoldStock: newUnsoldStock, depotStock: newDepotStock });
                    }
                });
                batch.commit();
            }
        }
    });
  };

  const updateProductStock = (productId: string, quantity: number) => {
      if (!firestore) return;
      const product = products.find(p => p.id === productId);
      if (product) {
          const newStock = product.depotStock + quantity;
          updateDoc(doc(firestore, 'products', productId), { depotStock: newStock });
      }
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
      if (!firestore) return;
      addDoc(collection(firestore, 'products'), product);
  };
  
  const updateProduct = (product: Product) => {
      if (!firestore) return;
      const { id, ...productData } = product;
      setDoc(doc(firestore, 'products', id), productData);
  };
  
  const deleteProduct = (productId: string) => {
      if (!firestore) return;
      const productToDelete = products.find(p => p.id === productId);
      if (productToDelete) {
        logActivity('product', `${productToDelete.name} - ${productToDelete.model}`, productToDelete);
        deleteDoc(doc(firestore, 'products', productId));
      }
  };

  const addCategory = (name: string) => {
      if (!firestore) return;
      addDoc(collection(firestore, 'categories'), { name });
  };

  const addBrand = (name: string) => {
      if (!firestore) return;
      addDoc(collection(firestore, 'brands'), { name });
  };

  const addCustomer = (name: string, email: string, phone: string) => {
      if (!firestore) return;
      addDoc(collection(firestore, 'customers'), { name, email, phone });
  };

  const deleteCustomer = (customerId: string) => {
    if (!firestore) return;
    const customerToDelete = customers.find(c => c.id === customerId);
    if (customerToDelete) {
      logActivity('customer', customerToDelete.name, customerToDelete);
      deleteDoc(doc(firestore, 'customers', customerId));
    }
  };

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'status'> & { customerId: string | null, customerName: string, customerContact: string }) => {
      if (!firestore) return;
      
      let finalCustomerId: string;
      if (order.customerId) {
          finalCustomerId = order.customerId;
      } else {
          let email = order.customerContact.includes('@') ? order.customerContact : '';
          let phone = !order.customerContact.includes('@') ? order.customerContact : '';
          const newCustomerData = { name: order.customerName, email, phone };
          const newCustomerRef = await addDoc(collection(firestore, 'customers'), newCustomerData);
          finalCustomerId = newCustomerRef.id;
      }
      
      const newOrderData = {
          customerId: finalCustomerId,
          items: order.items,
          status: 'Sipariş Alındı',
          createdAt: new Date().toISOString(),
          notes: order.notes,
      };

      await addDoc(collection(firestore, 'orders'), newOrderData);

      const batch = writeBatch(firestore);
      order.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
              const productRef = doc(firestore, 'products', product.id);
              const newUnsoldStock = Math.max(0, product.unsoldStock - item.quantity);
              batch.update(productRef, { unsoldStock: newUnsoldStock });
          }
      });
      await batch.commit();
      setCart([]);
  };

  const deleteOrder = (orderId: string) => {
      if (!firestore) return;
      const orderToDelete = orders.find(o => o.id === orderId);
      if (orderToDelete) {
        const customer = customers.find(c => c.id === orderToDelete.customerId);
        logActivity('order', `Sipariş #${orderToDelete.id.slice(-6)} - ${customer?.name || 'Bilinmeyen Müşteri'}`, orderToDelete);
        deleteDoc(doc(firestore, 'orders', orderId));
      }
  };

  const restoreItem = (logId: string) => {
      if (!firestore) return;
      const logItem = activityLog.find(log => log.id === logId);
      if (!logItem) return;

      const { type, data } = logItem;
      const collectionName = `${type}s`;
      const itemRef = doc(firestore, collectionName, data.id);
      
      setDoc(itemRef, data).then(() => {
          deleteDoc(doc(firestore, 'activityLog', logId));
      });
  };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Loading application data...</p>
            </div>
        );
    }

  const contextValue: AuthContextType = {
    user,
    role,
    users,
    products,
    orders,
    customers,
    categories,
    brands,
    cart,
    activityLog,
    appTheme,
    isLoading,
    logout,
    setCart,
    setAppTheme,
    addUser,
    deleteUser,
    updateUser,
    updateUserPreferences,
    updateOrderStatus,
    updateProductStock,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    addBrand,
    addCustomer,
    deleteCustomer,
    addOrder,
    deleteOrder,
    restoreItem,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

    
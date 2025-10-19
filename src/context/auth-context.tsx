
"use client"

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    products as initialProducts,
    orders as initialOrders,
    customers as initialCustomers,
    categories as initialCategories,
    brands as initialBrands
} from '@/lib/mock-data';
import type { Product, Order, Customer, Category, Brand } from '@/lib/definitions';
import { useI18n } from './i18n-context';


export type UserRole = 'genel_mudur' | 'depo_muduru' | 'satis_elemani' | 'muhasebeci';
export type Language = 'tr' | 'en' | 'ar';

export interface CartItem {
  productId: string;
  quantity: number;
  productName: string;
  price: number;
  imageUrl: string;
  model: string;
}

export const ALL_ROLES: UserRole[] = ['genel_mudur', 'depo_muduru', 'satis_elemani', 'muhasebeci'];

export interface User {
    id: string;
    name: string;
    role: UserRole;
    language: Language;
    password?: string;
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
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
    setAppTheme: (theme: string) => void;
    login: (userId: string, password?: string) => boolean;
    logout: () => void;
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
    addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'customer'> & { customerId: string | null, customerName: string, customerContact: string }) => void;
    deleteOrder: (orderId: string) => void;
    restoreItem: (logId: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


const protectedRoutes: Record<UserRole, string[]> = {
    'genel_mudur': ['/', '/orders', '/products', '/customers', '/depot', '/depot/list', '/settings', '/personnel', '/history'],
    'depo_muduru': ['/depot', '/depot/list', '/settings', '/products'],
    'satis_elemani': ['/', '/orders', '/products', '/customers', '/settings'],
    'muhasebeci': ['/', '/orders', '/products', '/depot/list', '/settings', '/customers'],
};

const defaultRoutes: Record<UserRole, string> = {
    'genel_mudur': '/',
    'depo_muduru': '/depot/list',
    'satis_elemani': '/',
    'muhasebeci': '/',
}

const initialUsers: User[] = [
    { id: 'user_1', name: 'Salah', role: 'genel_mudur', language: 'en', password: '123' }
];

const getSanitizedUsers = (storedUsers: any): User[] => {
    let users: User[] = [];

    try {
        if (storedUsers) {
            const parsed = JSON.parse(storedUsers);
            if (Array.isArray(parsed)) {
                users = parsed;
            }
        }
    } catch (e) {
        console.error("Could not parse users from localStorage", e);
    }
    
    const defaultUserInCode = initialUsers.find(u => u.id === 'user_1');
    if (!defaultUserInCode) return users; // Should not happen

    const defaultUserIndex = users.findIndex(u => u.id === 'user_1');

    if (defaultUserIndex > -1) {
        users[defaultUserIndex] = {
            ...users[defaultUserIndex], 
            name: defaultUserInCode.name, 
            role: defaultUserInCode.role,
            password: defaultUserInCode.password,
        };
    } else {
        users.unshift(defaultUserInCode);
    }
    
    return users;
};

// Helper hook for using localStorage
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            if (item === null) return initialValue;

            // If initialValue is a string, we don't need to parse it.
            if (typeof initialValue === 'string') {
                 return item as T;
            }
            return JSON.parse(item);

        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (typeof storedValue === 'string') {
                 window.localStorage.setItem(key, storedValue);
            } else {
                 window.localStorage.setItem(key, JSON.stringify(storedValue));
            }
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { t } = useI18n() || {}; // I18n might not be ready yet
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [appTheme, setAppTheme] = useLocalStorage<string>('app_theme', 'theme-default');

    const [users, setUsers] = useState<User[]>(() => {
        if (typeof window !== 'undefined') {
            const storedUsersRaw = localStorage.getItem('app_users');
            return getSanitizedUsers(storedUsersRaw);
        }
        return initialUsers;
    });

     useEffect(() => {
        if (typeof window !== 'undefined') {
             const storedUsersRaw = localStorage.getItem('app_users');
             const usersOnDisk = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
             const defaultUser = usersOnDisk.find(u => u.id === 'user_1');
             
             if (!defaultUser || defaultUser.password !== '123' || defaultUser.role !== 'genel_mudur') {
                const newUsers = getSanitizedUsers(storedUsersRaw);
                setUsers(newUsers);
             }
        }
    }, []);

    
    // App data states with localStorage persistence
    const [products, setProducts] = useLocalStorage<Product[]>('app_products', initialProducts);
    const [orders, setOrders] = useLocalStorage<Order[]>('app_orders', initialOrders);
    const [customers, setCustomers] = useLocalStorage<Customer[]>('app_customers', initialCustomers);
    const [categories, setCategories] = useLocalStorage<Category[]>('app_categories', initialCategories);
    const [brands, setBrands] = useLocalStorage<Brand[]>('app_brands', initialBrands);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [activityLog, setActivityLog] = useLocalStorage<ActivityLogItem[]>('app_activity_log', []);


    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('app_users', JSON.stringify(users));
        }
    }, [users]);
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const body = document.body;
            body.classList.remove('theme-default', 'theme-earth', 'theme-corporate', 'theme-ocean', 'theme-forest', 'theme-purple');
            body.classList.add(appTheme);
        }
    }, [appTheme]);


    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const storedUserId = localStorage.getItem('userId');
            if (storedUserId) {
                const foundUser = users.find(u => u.id === storedUserId);
                if (foundUser) {
                    setUser(foundUser);
                    setRole(foundUser.role);
                } else {
                    localStorage.removeItem('userId');
                    setUser(null);
                    setRole(null);
                }
            }
        } catch (e) {
            console.error("Failed to process user from storage", e);
            localStorage.removeItem('userId');
            setUser(null);
            setRole(null);
        } finally {
            setIsLoading(false);
        }
    }, [users]); 

    useEffect(() => {
        if (isLoading) {
            return;
        }

        const isLoginPage = pathname === '/login';

        if (!user) {
            if (!isLoginPage) {
                router.replace('/login');
            }
            return;
        }
        
        if (!user.role) {
             logout();
             return;
        }

        if (isLoginPage) {
            const targetRoute = defaultRoutes[user.role];
            if (targetRoute) {
                router.replace(targetRoute);
            } else {
                logout(); 
            }
            return;
        }

        const allowedRoutes = protectedRoutes[user.role];
        
        if (!allowedRoutes) {
            const targetRoute = defaultRoutes[user.role];
            if(targetRoute) {
              router.replace(targetRoute);
            } else {
              logout();
            }
            return;
        }

        const isAllowed = allowedRoutes.some(route => pathname === route || (route !== '/' && pathname.startsWith(route)));

        if (!isAllowed) {
            const targetRoute = defaultRoutes[user.role];
            if (targetRoute) {
               router.replace(targetRoute);
            } else {
               logout(); 
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, role, pathname, isLoading, router]);


    const login = (userId: string, password?: string): boolean => {
        const userToLogin = users.find(u => u.id === userId);

        if (userToLogin && userToLogin.password === password) {
            localStorage.setItem('userId', userToLogin.id);
            setUser(userToLogin);
            setRole(userToLogin.role);
            
            const targetRoute = defaultRoutes[userToLogin.role] || '/';
            router.replace(targetRoute);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('userId');
        setUser(null);
        setRole(null);
        router.replace('/login');
    };

    const logActivity = (type: ActivityLogItemType, description: string, data: any) => {
        const logEntry: ActivityLogItem = {
            id: `log_${Date.now()}`,
            type,
            description,
            deletedAt: new Date().toISOString(),
            data,
        };
        setActivityLog(prev => [logEntry, ...prev]);
    };

    const addUser = useCallback((name: string, role: UserRole, password?: string) => {
        const newUser: User = {
            id: `user_${Date.now()}`,
            name,
            role,
            language: 'en',
            password: password || '123'
        };
        setUsers(prevUsers => [...prevUsers, newUser]);
    }, [setUsers]);

    const deleteUser = useCallback((userId: string) => {
        const userToDelete = users.find(u => u.id === userId);
        if (userToDelete && t) {
            logActivity('user', `${userToDelete.name} (${t(`role_${userToDelete.role}` as any)})`, userToDelete);
            setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
            if (user?.id === userId) {
                logout();
            }
        }
    }, [users, setUsers, user?.id, t, logout]);

    const updateUser = useCallback((id: string, name: string, role: UserRole, password?: string) => {
        setUsers(prevUsers =>
            prevUsers.map(u => {
                if (u.id === id) {
                    const updatedUser = { ...u, name, role };
                    if (password) {
                        updatedUser.password = password;
                    }
                    if (user?.id === id) {
                        setUser(updatedUser);
                        setRole(role);
                    }
                    return updatedUser;
                }
                return u;
            })
        );
    }, [user?.id, setUsers]);

    const updateUserPreferences = useCallback((userId: string, preferences: { language?: Language }) => {
        let updatedUser: User | null = null;
        setUsers(prevUsers =>
            prevUsers.map(u => {
                 if (u.id === userId) {
                    updatedUser = { ...u, ...preferences };
                    return updatedUser;
                }
                return u;
            })
        );
        
        if (user?.id === userId && updatedUser) {
            setUser(updatedUser);
        }
    }, [user?.id, setUsers]);

    const updateOrderStatus = useCallback((orderId: string, status: 'Sipariş Alındı' | 'Kargoya Verildi') => {
        let orderToUpdate: Order | undefined;
        
        setOrders(prevOrders => {
            const newOrders = prevOrders.map(o => {
                if (o.id === orderId) {
                    orderToUpdate = { ...o, status };
                    return orderToUpdate;
                }
                return o;
            });
            
            if (orderToUpdate && status === 'Kargoya Verildi') {
                setProducts(prevProducts => {
                    const newProducts = [...prevProducts];
                    orderToUpdate?.items.forEach(item => {
                        const productIndex = newProducts.findIndex(p => p.id === item.productId);
                        if (productIndex !== -1) {
                            const updatedProduct = { ...newProducts[productIndex] };
                            updatedProduct.depotStock -= item.quantity;
                            newProducts[productIndex] = updatedProduct;
                        }
                    });
                    return newProducts;
                });
            }
            
            return newOrders;
        });

    }, [setOrders, setProducts]);

    const updateProductStock = useCallback((productId: string, quantity: number) => {
        setProducts(prevProducts =>
            prevProducts.map(p =>
                p.id === productId
                    ? { ...p, depotStock: p.depotStock + quantity }
                    : p
            )
        );
    }, [setProducts]);

    const addProduct = useCallback((product: Omit<Product, 'id'>) => {
        const newProduct: Product = {
            id: `prod_${Date.now()}`,
            ...product
        };
        setProducts(prev => [newProduct, ...prev]);
    }, [setProducts]);

    const updateProduct = useCallback((product: Product) => {
        setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    }, [setProducts]);

    const deleteProduct = useCallback((productId: string) => {
        const productToDelete = products.find(p => p.id === productId);
        if (productToDelete && t) {
            logActivity('product', `${productToDelete.name} - ${productToDelete.model}`, productToDelete);
            setProducts(prev => prev.filter(p => p.id !== productId));
        }
    }, [products, setProducts, t]);

    const addCategory = useCallback((name: string) => {
        const newCategory: Category = {
            id: `cat_${Date.now()}`,
            name
        };
        setCategories(prev => [...prev, newCategory]);
    }, [setCategories]);

    const addBrand = useCallback((name: string) => {
        const newBrand: Brand = {
            id: `brand_${Date.now()}`,
            name
        };
        setBrands(prev => [...prev, newBrand]);
    }, [setBrands]);
    
    const addCustomer = useCallback((name: string, email: string, phone: string) => {
        const newCustomer: Customer = {
            id: `cus_${Date.now()}`,
            name,
            email,
            phone
        };
        setCustomers(prev => [newCustomer, ...prev]);
}, [setCustomers]);

    const deleteCustomer = useCallback((customerId: string) => {
        const customerToDelete = customers.find(c => c.id === customerId);
        if (customerToDelete && t) {
            logActivity('customer', `${customerToDelete.name}`, customerToDelete);
            setCustomers(prev => prev.filter(c => c.id !== customerId));
        }
    }, [customers, setCustomers, t]);

    const addOrder = useCallback((order: Omit<Order, 'id' | 'createdAt' | 'customer'> & { customerId: string | null, customerName: string, customerContact: string }) => {
        let customer: Customer;
        if (order.customerId) {
            customer = customers.find(c => c.id === order.customerId)!;
        } else {
            let email = '';
            let phone = '';
            if (order.customerContact.includes('@')) {
                email = order.customerContact;
            } else {
                phone = order.customerContact;
            }
            const newCustomer: Customer = {
                id: `cus_${Date.now()}`,
                name: order.customerName,
                email,
                phone
            };
            setCustomers(prev => [newCustomer, ...prev]);
            customer = newCustomer;
        }

        const newOrder: Order = {
            id: `ord_${Date.now()}`,
            customer: customer,
            items: order.items,
            status: 'Sipariş Alındı',
            createdAt: new Date().toISOString(),
            notes: order.notes
        };
        
        setOrders(prev => [newOrder, ...prev]);

        // Decrease unsold stock
        setProducts(prevProducts => {
            const newProducts = [...prevProducts];
            order.items.forEach(item => {
                const productIndex = newProducts.findIndex(p => p.id === item.productId);
                if (productIndex !== -1) {
                    const updatedProduct = { ...newProducts[productIndex] };
                    updatedProduct.unsoldStock -= item.quantity;
                    newProducts[productIndex] = updatedProduct;
                }
            });
            return newProducts;
        });

        setCart([]);
    }, [customers, setCustomers, setOrders, setProducts, setCart]);

    const deleteOrder = useCallback((orderId: string) => {
        const orderToDelete = orders.find(o => o.id === orderId);
        if (orderToDelete && t) {
            logActivity('order', `${t('sidebar_orders')} #${orderToDelete.id.split('_')[1]} - ${orderToDelete.customer.name}`, orderToDelete);
            setOrders(prev => prev.filter(o => o.id !== orderId));
        }
    }, [orders, setOrders, t]);

    const restoreItem = useCallback((logId: string) => {
        const logItem = activityLog.find(log => log.id === logId);
        if (!logItem) return;

        switch (logItem.type) {
            case 'user':
                setUsers(prev => [logItem.data, ...prev]);
                break;
            case 'product':
                setProducts(prev => [logItem.data, ...prev]);
                break;
            case 'order':
                setOrders(prev => [logItem.data, ...prev]);
                break;
            case 'customer':
                setCustomers(prev => [logItem.data, ...prev]);
                break;
        }

        setActivityLog(prev => prev.filter(log => log.id !== logId));

    }, [activityLog, setActivityLog, setUsers, setProducts, setOrders, setCustomers]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Yükleniyor...</p>
            </div>
        );
    }

    const contextValue = { user, role, users, login, logout, addUser, deleteUser, updateUser, updateUserPreferences, products, orders, customers, categories, brands, updateOrderStatus, cart, setCart, updateProductStock, addProduct, updateProduct, deleteProduct, addCategory, addBrand, addCustomer, deleteCustomer, addOrder, deleteOrder, activityLog, restoreItem, appTheme, setAppTheme, isLoading };
    
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

"use client"

import { useContext, useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from 'next/navigation'
import Image from "next/image"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AuthContext, CartItem } from "@/context/auth-context"
import { useI18n } from "@/context/i18n-context"
import { X } from "lucide-react"
import { Combobox } from "@/components/ui/combobox"
import { Textarea } from "@/components/ui/textarea"

function NewOrderContent() {
  const auth = useContext(AuthContext)
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const router = useRouter()

  const { products, cart, setCart, customers, addOrder } = auth || {}
  const [currentCart, setCurrentCart] = useState<CartItem[]>([]);

  const [customerType, setCustomerType] = useState<'existing' | 'new'>('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerContact, setNewCustomerContact] = useState('');
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    const cartParam = searchParams.get('cart')
    if (cartParam) {
      try {
        const parsedCart = JSON.parse(decodeURIComponent(cartParam));
        setCurrentCart(parsedCart);
      } catch (e) {
        console.error("Failed to parse cart from URL", e);
        if (cart) setCurrentCart(cart);
      }
    } else if (cart) {
      setCurrentCart(cart);
    }
  }, [searchParams, cart])
  
  if(!auth || auth.isLoading) return null

  const handleRemoveFromCart = (productId: string) => {
    const newCart = currentCart.filter(item => item.productId !== productId)
    setCurrentCart(newCart)
    if (setCart) {
        setCart(newCart)
    }
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
      if (quantity < 1) return;
      const newCart = currentCart.map(item => item.productId === productId ? {...item, quantity} : item);
      setCurrentCart(newCart);
      if (setCart) {
        setCart(newCart);
      }
  }
  
  const totalAmount = currentCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const customerOptions = customers.map(c => ({ value: c.id, label: c.name }));

  const handleCreateOrder = () => {
    const isNewCustomerValid = customerType === 'new' && newCustomerName && newCustomerContact;
    const isExistingCustomerValid = customerType === 'existing' && selectedCustomerId;

    if (currentCart.length > 0 && (isNewCustomerValid || isExistingCustomerValid)) {
      addOrder({
        customerId: customerType === 'existing' ? selectedCustomerId : null,
        customerName: newCustomerName,
        customerContact: newCustomerContact,
        items: currentCart.map(item => ({ productId: item.productId, quantity: item.quantity })),
        notes: notes,
      });
      router.push('/orders');
    }
  };

  return (
    <AppLayout>
      <PageHeader title={t('new_order')} />
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 grid gap-8 auto-rows-max">
          <Card>
            <CardHeader>
              <CardTitle>{t('order_contents')}</CardTitle>
              <CardDescription>{t('new_order_contents_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {currentCart.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('table_product')}</TableHead>
                      <TableHead className="w-[120px]">{t('quantity_placeholder')}</TableHead>
                      <TableHead className="text-end">{t('unit_price')}</TableHead>
                      <TableHead className="text-end">{t('table_total')}</TableHead>
                      <TableHead className="w-12"><span className="sr-only">Remove</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentCart.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                           <div className="flex items-center gap-4">
                              <Image
                                alt={item.productName}
                                className="aspect-square rounded-md object-cover"
                                height="64"
                                src={item.imageUrl}
                                width="64"
                              />
                              <div>
                                <p className="font-medium">{item.productName}</p>
                                <p className="text-sm text-muted-foreground">{item.model}</p>
                              </div>
                            </div>
                        </TableCell>
                        <TableCell>
                          <Input 
                              type="number" 
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value, 10))}
                              min="1"
                              className="w-24"
                          />
                        </TableCell>
                        <TableCell className="text-end">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-end">${(item.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveFromCart(item.productId)}>
                              <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">{t('empty_cart_message')}</p>
              )}
            </CardContent>
            {currentCart.length > 0 && (
              <CardFooter className="justify-end gap-4 font-semibold text-lg">
                  <span>{t('table_total')}:</span>
                  <span>${totalAmount.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
              </CardFooter>
            )}
          </Card>
        </div>

        <div className="grid gap-8 auto-rows-max">
          <Card>
            <CardHeader>
              <CardTitle>{t('customer_info_title')}</CardTitle>
              <CardDescription>{t('new_order_customer_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex gap-2">
                    <Button variant={customerType === 'existing' ? 'default' : 'outline'} onClick={() => setCustomerType('existing')}>Mevcut Müşteri</Button>
                    <Button variant={customerType === 'new' ? 'default' : 'outline'} onClick={() => setCustomerType('new')}>Yeni Müşteri</Button>
                </div>

                {customerType === 'existing' ? (
                     <div className="grid gap-2">
                        <Label htmlFor="customer-select">{t('table_customer')}</Label>
                        <Combobox
                          options={customerOptions}
                          value={selectedCustomerId}
                          onChange={setSelectedCustomerId}
                          placeholder="Müşteri ara..."
                          emptyText="Müşteri bulunamadı."
                        />
                    </div>
                ) : (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="customer-name">{t('customer_name_placeholder')}</Label>
                            <Input id="customer-name" placeholder="Moda Evi A.Ş." value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="customer-contact">{t('customer_contact_label')}</Label>
                            <Input id="customer-contact" placeholder="info@modaevi.com" value={newCustomerContact} onChange={(e) => setNewCustomerContact(e.target.value)} />
                        </div>
                    </>
                )}
                 <div className="grid gap-2">
                      <Label htmlFor="notes">{t('order_notes')}</Label>
                      <Textarea id="notes" placeholder={t('order_notes_placeholder')} value={notes} onChange={(e) => setNotes(e.target.value)} />
                 </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full" onClick={handleCreateOrder} disabled={currentCart.length === 0 || (customerType === 'existing' && !selectedCustomerId) || (customerType === 'new' && (!newCustomerName || !newCustomerContact))}>{t('create_order_button')}</Button>
            </CardFooter>
          </Card>
        </div>

      </div>
    </AppLayout>
  )
}

export default function NewOrderPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewOrderContent />
        </Suspense>
    )
}

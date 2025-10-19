
"use client"

import { useContext, useEffect, useState, Suspense } from "react"
import { useSearchParams } from 'next/navigation'
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
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/context/i18n-context"
import { X } from "lucide-react"

function NewOrderContent() {
  const auth = useContext(AuthContext)
  const { t } = useI18n()
  const searchParams = useSearchParams()

  const { products, cart, setCart, customers } = auth || {}
  const [currentCart, setCurrentCart] = useState<CartItem[]>([]);

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
  
  if(!auth) return null

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

  return (
    <AppLayout>
      <PageHeader title={t('new_order')} />
      <form>
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
                  <div className="grid gap-2">
                    <Label htmlFor="customer-name">{t('table_customer')}</Label>
                    <Input id="customer-name" placeholder={t('customer_name_placeholder')} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="customer-contact">{t('customer_contact_label')}</Label>
                    <Input id="customer-contact" placeholder={t('customer_contact_placeholder')} />
                  </div>
                   <div className="grid gap-2">
                        <Label htmlFor="notes">{t('order_notes')}</Label>
                        <Input id="notes" placeholder={t('order_notes_placeholder')} />
                   </div>
              </CardContent>
              <CardFooter>
                <Button size="lg" className="w-full" disabled={currentCart.length === 0}>{t('create_order_button')}</Button>
              </CardFooter>
            </Card>
          </div>

        </div>
      </form>
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

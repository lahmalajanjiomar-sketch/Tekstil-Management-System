
"use client"

import { useContext } from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AuthContext } from "@/context/auth-context"
import { format } from "date-fns"
import { Truck, User, Mail, Phone, Home } from "lucide-react"
import { useI18n } from "@/context/i18n-context"

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const auth = useContext(AuthContext)
  const { t } = useI18n()
  if (!auth) return null
  const { orders, products, updateOrderStatus } = auth

  const order = orders.find((o) => o.id === params.id)

  if (!order) {
    notFound()
  }

  const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0)
  const orderTotal = order.items.reduce((acc, item) => {
    const product = products.find((p) => p.id === item.productId)
    return acc + (product?.price || 0) * item.quantity
  }, 0)

  return (
    <AppLayout>
      <PageHeader
        title={`${t('sidebar_orders')} #${order.id.split('_')[1]}`}
        actions={
          order.status === "Sipariş Alındı" && (
            <Button onClick={() => updateOrderStatus(order.id, "Kargoya Verildi")}>
              <Truck className="me-2" />
              {t('mark_as_shipped')}
            </Button>
          )
        }
      />

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 grid gap-8 auto-rows-max">
          <Card>
            <CardHeader>
              <CardTitle>{t('order_details')}</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{t('table_date')}</span>
                <span className="font-medium">{format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{t('table_status')}</span>
                <Badge variant={order.status === "Kargoya Verildi" ? "secondary" : "default"} className="w-fit">
                  {t(order.status === "Kargoya Verildi" ? 'order_status_shipped' : 'order_status_received')}
                </Badge>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{t('table_amount')}</span>
                <span className="font-medium">${orderTotal.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('order_contents')}</CardTitle>
              <CardDescription>{t('order_contents_desc', { count: totalItems })}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table_product')}</TableHead>
                    <TableHead className="text-center">{t('item_unit')}</TableHead>
                    <TableHead className="text-end">{t('unit_price')}</TableHead>
                    <TableHead className="text-end">{t('table_total')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item, index) => {
                    const product = products.find((p) => p.id === item.productId)
                    if (!product) return null
                    const itemTotal = product.price * item.quantity
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              width={64}
                              height={64}
                              className="rounded-md object-cover"
                              data-ai-hint={product.imageHint}
                            />
                            <div className="grid gap-0.5">
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.model}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-end">${product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-end">${itemTotal.toFixed(2)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
             <CardFooter className="flex justify-end gap-2 p-4 text-lg font-semibold">
                <span>{t('table_total')}:</span>
                <span>${orderTotal.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
            </CardFooter>
          </Card>
        </div>

        <div className="grid gap-8 auto-rows-max">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                 <User className="h-8 w-8"/>
                 <CardTitle>{t('table_customer')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                 <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{order.customer.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${order.customer.email}`} className="text-sm hover:underline">{order.customer.email}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{order.customer.phone}</span>
                  </div>
              </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>{t('order_notes')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {order.notes ? (
                        <p className="text-sm italic">"{order.notes}"</p>
                    ) : (
                        <p className="text-sm text-muted-foreground">{t('order_notes_none')}</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </AppLayout>
  )
}


"use client"

import { useContext, useMemo } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { notFound, useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { Mail, Phone, ShoppingCart, DollarSign } from "lucide-react"
import { AuthContext } from "@/context/auth-context"
import { useI18n } from "@/context/i18n-context"
import { Order } from "@/lib/definitions"

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const auth = useContext(AuthContext)
  const { t } = useI18n()
  
  if (!auth || auth.isLoading) return null // or a loading skeleton

  const { customers, orders, products } = auth

  const customer = customers.find((c) => c.id === params.id)

  const customerOrders = useMemo(() => {
    if (!orders || !customer) return [];
    return orders.filter((o) => o.customerId === customer.id);
  }, [orders, customer]);

  const calculateOrderTotal = (order: Order) => {
    if (!order.items || !products) return 0;
    return order.items.reduce((itemAcc, item) => {
        const product = products.find(p => p.id === item.productId)
        return itemAcc + (product?.price || 0) * item.quantity
    }, 0)
  }

  const totalSpent = useMemo(() => {
    return customerOrders.reduce((acc, order) => {
       return acc + calculateOrderTotal(order)
    }, 0);
  }, [customerOrders, products]);


  if (!customer) {
    notFound()
  }

  const handleOrderClick = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  return (
    <AppLayout>
      <PageHeader title={customer.name} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t('customer_info_title')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${customer.email}`} className="text-sm hover:underline">
                  {customer.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{customer.phone}</span>
              </div>
               <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{customerOrders.length} {t('order_unit')}</span>
              </div>
               <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                    {t('total_spent_label')}: ${totalSpent.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('order_history_title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('order_id_label')}</TableHead>
                    <TableHead>{t('table_date')}</TableHead>
                    <TableHead>{t('table_status')}</TableHead>
                    <TableHead className="text-end">{t('table_amount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerOrders.length > 0 ? (
                    customerOrders.map((order) => {
                       const orderTotal = calculateOrderTotal(order)
                      return (
                        <TableRow key={order.id} onClick={() => handleOrderClick(order.id)} className="cursor-pointer">
                          <TableCell className="font-mono text-xs">#{order.id.slice(-6)}</TableCell>
                          <TableCell>{format(parseISO(order.createdAt), "dd/MM/yyyy")}</TableCell>
                          <TableCell>
                            <Badge variant={order.status === "Kargoya Verildi" ? "secondary" : "default"}>
                              {t(order.status === "Kargoya Verildi" ? 'order_status_shipped' : 'order_status_received')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-end">
                             ${orderTotal.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">{t('no_orders_yet')}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

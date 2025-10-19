
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { DollarSign, Package, ShoppingCart, Users, CalendarDays, Truck } from "lucide-react"
import { format, isThisMonth } from "date-fns"
import Link from "next/link"
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { useI18n } from "@/context/i18n-context";


export default function Dashboard() {
  const auth = useContext(AuthContext);
  const { t } = useI18n();

  if (!auth) {
    return null; // Or a loading indicator
  }

  const { orders, products, customers, role } = auth;
  const recentOrders = orders.slice(0, 5)

  const totalRevenue = orders.reduce((acc, order) => {
    const orderTotal = order.items.reduce((itemAcc, item) => {
      const product = products.find(p => p.id === item.productId)
      return itemAcc + (product?.price || 0) * item.quantity
    }, 0)
    return acc + orderTotal
  }, 0)
  
  const monthlyRevenue = orders
    .filter(order => isThisMonth(new Date(order.createdAt)))
    .reduce((acc, order) => {
      const orderTotal = order.items.reduce((itemAcc, item) => {
        const product = products.find(p => p.id === item.productId);
        return itemAcc + (product?.price || 0) * item.quantity;
      }, 0);
      return acc + orderTotal;
    }, 0);

  const ordersToShipCount = orders.filter(o => o.status === "Sipariş Alındı").length

  const CardGrid = () => {
    switch (role) {
        case 'genel_mudur':
            return (
                <>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard_total_revenue')}</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</div>
                            <p className="text-xs text-muted-foreground">{t('dashboard_total_revenue_desc')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard_monthly_revenue')}</CardTitle>
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${monthlyRevenue.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</div>
                            <p className="text-xs text-muted-foreground">{t('dashboard_monthly_revenue_desc')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard_total_orders')}</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{orders.length}</div>
                            <p className="text-xs text-muted-foreground">{t('dashboard_total_orders_desc')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard_low_stock')}</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{products.filter(p => p.unsoldStock < 10).length}</div>
                            <p className="text-xs text-muted-foreground">{t('dashboard_low_stock_desc')}</p>
                        </CardContent>
                    </Card>
                </>
            );
        case 'muhasebeci':
            return (
                 <>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard_total_revenue')}</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</div>
                            <p className="text-xs text-muted-foreground">{t('dashboard_total_revenue_desc')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard_monthly_revenue')}</CardTitle>
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${monthlyRevenue.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</div>
                            <p className="text-xs text-muted-foreground">{t('dashboard_monthly_revenue_desc')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard_total_customers')}</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{customers.length}</div>
                            <p className="text-xs text-muted-foreground">{t('dashboard_total_customers_desc')}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard_low_stock')}</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{products.filter(p => p.depotStock < 10).length}</div>
                            <p className="text-xs text-muted-foreground">{t('dashboard_low_stock_desc')}</p>
                        </CardContent>
                    </Card>
                </>
            );
        case 'satis_elemani':
            return (
                 <>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard_total_orders')}</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{orders.length}</div>
                            <p className="text-xs text-muted-foreground">{t('dashboard_total_orders_desc')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard_total_customers')}</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{customers.length}</div>
                            <p className="text-xs text-muted-foreground">{t('dashboard_total_customers_desc')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard_orders_to_ship')}</CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{ordersToShipCount}</div>
                            <p className="text-xs text-muted-foreground">{t('dashboard_orders_to_ship_desc')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard_low_stock')}</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{products.filter(p => p.unsoldStock < 10).length}</div>
                            <p className="text-xs text-muted-foreground">{t('dashboard_low_stock_desc')}</p>
                        </CardContent>
                    </Card>
                 </>
            );
        case 'depo_muduru':
             return (
                  <>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard_orders_to_ship')}</CardTitle>
                            <Truck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{ordersToShipCount}</div>
                            <p className="text-xs text-muted-foreground">{t('dashboard_orders_to_ship_desc')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard_low_stock')}</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{products.filter(p => p.depotStock < 10).length}</div>
                            <p className="text-xs text-muted-foreground">{t('dashboard_low_stock_desc')}</p>
                        </CardContent>
                    </Card>
                </>
             )
        default:
            return null;
    }
  }

  return (
    <AppLayout>
      <PageHeader title={t('dashboard_title')} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardGrid />
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('dashboard_recent_orders')}</CardTitle>
          <CardDescription>{t('dashboard_recent_orders_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table_customer')}</TableHead>
                <TableHead>{t('table_date')}</TableHead>
                <TableHead>{t('table_status')}</TableHead>
                <TableHead className="text-end">{t('table_amount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => {
                const orderTotal = order.items.reduce((acc, item) => {
                  const product = products.find(p => p.id === item.productId)
                  return acc + (product?.price || 0) * item.quantity
                }, 0)
                return (
                  <TableRow key={order.id} className="group">
                    <TableCell>
                      <Link href={`/orders/${order.id}`} className="hover:underline">
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                      </Link>
                    </TableCell>
                    <TableCell>{format(new Date(order.createdAt), "dd/MM/yyyy")}</TableCell>
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
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  )
}

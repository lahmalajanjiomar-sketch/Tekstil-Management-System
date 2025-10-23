
"use client"
import Link from "next/link"
import { useContext, useState, useMemo } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { PlusCircle, MoreHorizontal, Truck, Trash2, Search } from "lucide-react"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Badge } from "@/components/ui/badge"
import { AuthContext } from "@/context/auth-context"
import { format, parseISO } from "date-fns"
import { useI18n } from "@/context/i18n-context"
import type { Order } from "@/lib/definitions"

function OrderTable({ status, searchQuery, sortOrder }: { status?: 'Sipariş Alındı' | 'Kargoya Verildi', searchQuery: string, sortOrder: string }) {
  const auth = useContext(AuthContext)
  const { t } = useI18n();

  if (!auth || auth.isLoading) return null
  const { orders, products, updateOrderStatus, deleteOrder, role, customers } = auth

  const calculateOrderTotal = (order: Order) => {
    if (!order.items) return 0;
    return order.items.reduce((acc, item) => {
        const product = products.find(p => p.id === item.productId)
        return acc + (product?.price || 0) * item.quantity
    }, 0)
  }

  const filteredAndSortedOrders = useMemo(() => {
    let filteredOrders = status ? orders.filter(o => o.status === status) : [...orders];
    
    if (searchQuery) {
        filteredOrders = filteredOrders.filter(order => {
            const customer = customers.find(c => c.id === order.customerId);
            return customer?.name.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }

    switch (sortOrder) {
      case 'date-desc':
        filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'date-asc':
        filteredOrders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'amount-desc':
        filteredOrders.sort((a, b) => calculateOrderTotal(b) - calculateOrderTotal(a));
        break;
      case 'amount-asc':
        filteredOrders.sort((a, b) => calculateOrderTotal(a) - calculateOrderTotal(b));
        break;
      default:
        filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return filteredOrders;
  }, [orders, status, searchQuery, sortOrder, products, customers]);


  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('table_customer')}</TableHead>
          <TableHead>{t('table_date')}</TableHead>
          <TableHead>{t('table_status')}</TableHead>
          <TableHead>{t('table_item_count')}</TableHead>
          <TableHead className="text-end">{t('table_amount')}</TableHead>
          <TableHead>
            <span className="sr-only">{t('table_actions')}</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredAndSortedOrders.map((order) => {
          const customer = customers.find(c => c.id === order.customerId);
          if (!customer) return null;
          const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0)
          const orderTotal = calculateOrderTotal(order);
          
          return (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>{order.createdAt ? format(parseISO(order.createdAt), "dd/MM/yyyy") : '...'}</TableCell>
              <TableCell>
                <Badge variant={order.status === "Kargoya Verildi" ? "secondary" : "default"}>
                  {t(order.status === "Kargoya Verildi" ? 'order_status_shipped' : 'order_status_received')}
                </Badge>
              </TableCell>
              <TableCell>{totalItems} {t('item_unit')}</TableCell>
              <TableCell className="text-end">
                ${orderTotal.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">{t('open_menu')}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={`/orders/${order.id}`}>{t('order_details')}</Link>
                    </DropdownMenuItem>
                    {order.status === 'Sipariş Alındı' && (
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Kargoya Verildi')}>
                            <Truck className="me-2 h-4 w-4"/>
                            {t('mark_as_shipped')}
                        </DropdownMenuItem>
                    )}
                    {role === 'genel_mudur' && (
                      <>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10">
                                <Trash2 className="me-2 h-4 w-4"/>
                                {t('delete')}
                             </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>{t('confirm_delete_title')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      {t('confirm_delete_order_desc', { id: order.id.slice(-6) })}
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteOrder(order.id)}>
                                      {t('confirm_delete_yes')}
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}


export default function OrdersPage() {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("date-desc");

  return (
    <AppLayout>
      <PageHeader
        title={t('sidebar_orders')}
        actions={
          <Link href="/orders/new">
            <Button>
              <PlusCircle className="me-2 h-4 w-4" />
              {t('new_order')}
            </Button>
          </Link>
        }
      />
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">{t('tabs_all')}</TabsTrigger>
          <TabsTrigger value="received">{t('order_status_received')}</TabsTrigger>
          <TabsTrigger value="shipped">{t('order_status_shipped')}</TabsTrigger>
        </TabsList>
        <div className="flex flex-col sm:flex-row gap-4 my-4">
            <div className="relative flex-1">
                <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder={t('history_search_placeholder')}
                    className="w-full ps-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="w-full sm:w-[240px]">
                <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('sıralama_placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="date-desc">{t('sıralama_tarih_yeni')}</SelectItem>
                        <SelectItem value="date-asc">{t('sıralama_tarih_eski')}</SelectItem>
                        <SelectItem value="amount-desc">{t('sıralama_tutar_yuksek')}</SelectItem>
                        <SelectItem value="amount-asc">{t('sıralama_tutar_dusuk')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <Card>
          <CardContent className="p-0">
            <TabsContent value="all" className="mt-0">
                <OrderTable searchQuery={searchQuery} sortOrder={sortOrder} />
            </TabsContent>
            <TabsContent value="received" className="mt-0">
                <OrderTable status="Sipariş Alındı" searchQuery={searchQuery} sortOrder={sortOrder} />
            </TabsContent>
            <TabsContent value="shipped" className="mt-0">
                <OrderTable status="Kargoya Verildi" searchQuery={searchQuery} sortOrder={sortOrder} />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </AppLayout>
  )
}

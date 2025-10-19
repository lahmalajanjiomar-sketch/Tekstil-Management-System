
"use client"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useContext, useState, useMemo, useCallback } from "react"
import { AuthContext } from "@/context/auth-context"
import { useI18n } from "@/context/i18n-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Trash2 } from "lucide-react"
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

export default function CustomersPage() {
  const auth = useContext(AuthContext)
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');

  if (!auth) return null
  const { customers, orders, products, addCustomer, deleteCustomer, role } = auth

  const customerData = useMemo(() => {
    return customers
    .filter(customer => 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(customer => {
      const customerOrders = orders.filter(order => order.customer.id === customer.id);
      const totalSpent = customerOrders.reduce((acc, order) => {
          const orderTotal = order.items.reduce((itemAcc, item) => {
              const product = products.find(p => p.id === item.productId)
              return itemAcc + (product?.price || 0) * item.quantity
          }, 0)
          return acc + orderTotal
      }, 0)
      return {
        ...customer,
        orderCount: customerOrders.length,
        totalSpent
      }
    });
  }, [customers, orders, products, searchQuery])

  const handleAddCustomer = useCallback(() => {
    if (name && contact) {
        let email = '';
        let phone = '';
        if (contact.includes('@')) {
            email = contact;
        } else {
            phone = contact;
        }
        addCustomer(name, email, phone);
        setName('');
        setContact('');
    }
  }, [name, contact, addCustomer]);


  return (
    <AppLayout>
      <PageHeader title={t('sidebar_customers')} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 order-2 lg:order-1">
            <Card>
                <CardHeader>
                  <CardTitle>{t('sidebar_customers')}</CardTitle>
                   <div className="relative">
                        <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder={t('history_search_placeholder')}
                            className="w-full ps-8 mt-2"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>{t('table_customer')}</TableHead>
                        <TableHead>{t('table_order_count')}</TableHead>
                        <TableHead>{t('table_total_spent')}</TableHead>
                        {role === 'genel_mudur' && <TableHead className="text-end">{t('table_actions')}</TableHead>}
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {customerData.map((customer) => (
                        <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                            <Link href={`/customers/${customer.id}`} className="hover:underline">
                                {customer.name}
                            </Link>
                            <div className="text-sm text-muted-foreground">{customer.email || customer.phone}</div>
                        </TableCell>
                        <TableCell>{customer.orderCount} {t('order_unit')}</TableCell>
                        <TableCell>
                            ${customer.totalSpent.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                        </TableCell>
                         {role === 'genel_mudur' && (
                            <TableCell className="text-end">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{t('confirm_delete_title')}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {t('confirm_delete_customer_desc', { name: customer.name })}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteCustomer(customer.id)}>
                                                {t('confirm_delete_yes')}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                         )}
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
        <div className="order-1 lg:order-2">
            <Card>
                <CardHeader>
                    <CardTitle>{t('new_order_customer_desc')}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="customer-name">{t('customer_info_title')}</Label>
                        <Input id="customer-name" placeholder={t('customer_name_placeholder')} value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="customer-contact">{t('customer_contact_label')}</Label>
                        <Input id="customer-contact" placeholder={t('customer_contact_placeholder')} value={contact} onChange={(e) => setContact(e.target.value)} />
                    </div>
                </CardContent>
                <CardContent>
                     <Button className="w-full" onClick={handleAddCustomer} disabled={!name || !contact}>
                        {t('personnel_add_button')}
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </AppLayout>
  )
}

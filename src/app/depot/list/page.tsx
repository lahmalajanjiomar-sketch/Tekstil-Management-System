
"use client"

import Link from "next/link"
import { useContext } from "react"
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthContext } from "@/context/auth-context"
import { Search } from "lucide-react"
import { useI18n } from "@/context/i18n-context"

export default function DepotListPage() {
  const auth = useContext(AuthContext)
  const { t } = useI18n();

  if(!auth) return null
  const { products } = auth

  return (
    <AppLayout>
      <PageHeader title={t('depot_list_title')} actions={<Link href="/depot"><Button>{t('depot_add_new_product')}</Button></Link>} />
       <Card>
            <CardHeader>
              <CardTitle>{t('depot_list_stock_products')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative mb-4">
                    <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={t('depot_list_search_placeholder')}
                        className="w-full ps-8"
                    />
                </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('table_product')}</TableHead>
                      <TableHead>{t('table_brand')}</TableHead>
                      <TableHead>{t('table_category')}</TableHead>
                      <TableHead>{t('table_depot_stock')}</TableHead>
                      <TableHead>{t('table_unsold_stock')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <Link href={`/depot/${product.id}`} className="hover:underline">
                              {product.name}
                          </Link>
                          <div className="text-sm text-muted-foreground">{product.model}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.brand}</Badge>
                        </TableCell>
                         <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.depotStock < 20 ? "destructive" : "outline"}>
                            {product.depotStock} {t('item_unit')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                           <Badge variant={product.unsoldStock < 20 ? "destructive" : "outline"}>
                            {product.unsoldStock} {t('item_unit')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
    </AppLayout>
  )
}

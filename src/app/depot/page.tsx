
"use client"

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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useContext } from "react"
import { AuthContext } from "@/context/auth-context"
import { PlusCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/context/i18n-context"

export default function DepotPage() {
  const auth = useContext(AuthContext)
  const { t } = useI18n();

  if(!auth) return null
  const { categories, brands } = auth

  return (
    <AppLayout>
      <PageHeader title={t('sidebar_depot_management')} actions={<Link href="/depot/list"><Button variant="outline">{t('depot_view_stock_list')}</Button></Link>} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
               <Card>
                  <CardHeader>
                    <CardTitle>{t('depot_add_new_product')}</CardTitle>
                    <CardDescription>{t('depot_add_new_product_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="product-name">{t('depot_product_name')}</Label>
                            <Input id="product-name" placeholder={t('depot_product_name_placeholder')} />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="product-model">{t('depot_product_model')}</Label>
                            <Input id="product-model" placeholder={t('depot_product_model_placeholder')} />
                         </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="category">{t('table_category')}</Label>
                            <Select>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder={t('depot_select_category')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(category => (
                                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="brand">{t('table_brand')}</Label>
                            <Select>
                                <SelectTrigger id="brand">
                                    <SelectValue placeholder={t('depot_select_brand')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {brands.map(brand => (
                                        <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="product-price">{t('depot_price')}</Label>
                          <Input id="product-price" type="number" placeholder="99.99" />
                        </div>
                         <div className="grid gap-2">
                          <Label htmlFor="depot-stock">{t('table_depot_stock')}</Label>
                          <Input id="depot-stock" type="number" placeholder="100" />
                        </div>
                     </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="unsold-stock">{t('table_unsold_stock')}</Label>
                          <Input id="unsold-stock" type="number" placeholder="100" />
                        </div>
                     </div>
                      <div className="grid gap-2">
                          <Label htmlFor="depot-location">{t('depot_location')}</Label>
                          <Textarea id="depot-location" placeholder={t('depot_location_placeholder')} required />
                      </div>
                  </CardContent>
                  <CardFooter>
                    <Button>{t('depot_save_product')}</Button>
                  </CardFooter>
                </Card>
          </div>
          <div className="grid gap-8 auto-rows-max">
              <Card>
                  <CardHeader>
                      <CardTitle>{t('table_categories')}</CardTitle>
                      <CardDescription>{t('depot_categories_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                      <div className="flex items-center gap-2">
                          <Input id="new-category" placeholder={t('depot_new_category_placeholder')}/>
                          <Button size="icon"><PlusCircle/></Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                          {categories.map(category => (
                              <Badge key={category.id} variant="secondary">{category.name}</Badge>
                          ))}
                      </div>
                  </CardContent>
              </Card>
               <Card>
                  <CardHeader>
                      <CardTitle>{t('table_brands')}</CardTitle>
                      <CardDescription>{t('depot_brands_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                      <div className="flex items-center gap-2">
                          <Input id="new-brand" placeholder={t('depot_new_brand_placeholder')}/>
                          <Button size="icon"><PlusCircle/></Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                          {brands.map(brand => (
                              <Badge key={brand.id} variant="secondary">{brand.name}</Badge>
                          ))}
                      </div>
                  </CardContent>
              </Card>
          </div>
      </div>
    </AppLayout>
  )
}


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
import { useContext, useState } from "react"
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
import { useRouter } from "next/navigation"

export default function DepotPage() {
  const auth = useContext(AuthContext)
  const { t } = useI18n();
  const router = useRouter();

  const [newProduct, setNewProduct] = useState({
    name: '',
    model: '',
    category: '',
    brand: '',
    price: 0,
    depotStock: 0,
    unsoldStock: 0,
    depotLocation: '',
    imageUrl: 'https://picsum.photos/seed/new_product/400/400',
    imageHint: 'new product',
    notes: ''
  });
  const [newCategory, setNewCategory] = useState('');
  const [newBrand, setNewBrand] = useState('');

  if(!auth || auth.isLoading) return null
  const { categories, brands, addProduct, addCategory, addBrand } = auth

  const handleInputChange = (field: string, value: any) => {
    setNewProduct(prev => ({...prev, [field]: value}));
  }

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.model && newProduct.category && newProduct.brand) {
      addProduct(newProduct);
      router.push('/depot/list');
    }
  }

  const handleAddCategory = () => {
    if (newCategory) {
      addCategory(newCategory);
      setNewCategory('');
    }
  }

  const handleAddBrand = () => {
    if (newBrand) {
      addBrand(newBrand);
      setNewBrand('');
    }
  }

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
                            <Input id="product-name" placeholder={t('depot_product_name_placeholder')} value={newProduct.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="product-model">{t('depot_product_model')}</Label>
                            <Input id="product-model" placeholder={t('depot_product_model_placeholder')} value={newProduct.model} onChange={(e) => handleInputChange('model', e.target.value)} />
                         </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="category">{t('table_category')}</Label>
                            <Select onValueChange={(value) => handleInputChange('category', value)}>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder={t('depot_select_category')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(category => (
                                        <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="brand">{t('table_brand')}</Label>
                            <Select onValueChange={(value) => handleInputChange('brand', value)}>
                                <SelectTrigger id="brand">
                                    <SelectValue placeholder={t('depot_select_brand')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {brands.map(brand => (
                                        <SelectItem key={brand.id} value={brand.name}>{brand.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="product-price">{t('depot_price')}</Label>
                          <Input id="product-price" type="number" placeholder="99.99" value={newProduct.price} onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)} />
                        </div>
                         <div className="grid gap-2">
                          <Label htmlFor="depot-stock">{t('table_depot_stock')}</Label>
                          <Input id="depot-stock" type="number" placeholder="100" value={newProduct.depotStock} onChange={(e) => handleInputChange('depotStock', parseInt(e.target.value) || 0)} />
                        </div>
                     </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="unsold-stock">{t('table_unsold_stock')}</Label>
                          <Input id="unsold-stock" type="number" placeholder="100" value={newProduct.unsoldStock} onChange={(e) => handleInputChange('unsoldStock', parseInt(e.target.value) || 0)} />
                        </div>
                     </div>
                      <div className="grid gap-2">
                          <Label htmlFor="depot-location">{t('depot_location')}</Label>
                          <Textarea id="depot-location" placeholder={t('depot_location_placeholder')} required value={newProduct.depotLocation} onChange={(e) => handleInputChange('depotLocation', e.target.value)} />
                      </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleAddProduct}>{t('depot_save_product')}</Button>
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
                          <Input id="new-category" placeholder={t('depot_new_category_placeholder')} value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                          <Button size="icon" onClick={handleAddCategory}><PlusCircle/></Button>
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
                          <Input id="new-brand" placeholder={t('depot_new_brand_placeholder')} value={newBrand} onChange={(e) => setNewBrand(e.target.value)} />
                          <Button size="icon" onClick={handleAddBrand}><PlusCircle/></Button>
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

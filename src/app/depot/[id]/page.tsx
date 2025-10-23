
"use client"

import { useContext, useState, useEffect } from "react"
import { AuthContext } from "@/context/auth-context"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"
import { notFound, useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useI18n } from "@/context/i18n-context"
import type { Product } from "@/lib/definitions"

export default function ProductEditPage({ params }: { params: { id: string } }) {
  const auth = useContext(AuthContext)
  const { t } = useI18n()
  const router = useRouter()
  const [productData, setProductData] = useState<Partial<Product>>({})

  if(!auth || auth.isLoading) return null
  const { products, categories, brands, updateProduct } = auth
  
  const product = products.find((p) => p.id === params.id)

  useEffect(() => {
    if (product) {
      setProductData(product)
    }
  }, [product])

  if (!product) {
    return (
      <AppLayout>
        <PageHeader title="Product not found" />
      </AppLayout>
    )
  }

  const handleChange = (field: keyof Product, value: string | number) => {
    setProductData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(productData.id) {
        updateProduct(productData as Product);
        router.push('/depot/list');
    }
  }


  return (
    <AppLayout>
      <PageHeader title={t('depot_edit_product_title', { name: product.name })} />
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('depot_product_info')}</CardTitle>
                <CardDescription>
                  {t('depot_product_info_desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">{t('depot_product_name')}</Label>
                    <Input id="name" value={productData.name || ''} onChange={e => handleChange('name', e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="model">{t('depot_product_model')}</Label>
                    <Input id="model" value={productData.model || ''} onChange={e => handleChange('model', e.target.value)} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="category">{t('table_category')}</Label>
                        <Select value={productData.category || ''} onValueChange={value => handleChange('category', value)}>
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
                        <Select value={productData.brand || ''} onValueChange={value => handleChange('brand', value)}>
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
                        <Label htmlFor="price">{t('depot_price')} ($)</Label>
                        <Input
                        id="price"
                        type="number"
                        value={productData.price || 0}
                        onChange={e => handleChange('price', parseFloat(e.target.value))}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="depotStock">{t('table_depot_stock')}</Label>
                    <Input
                      id="depotStock"
                      type="number"
                      value={productData.depotStock || 0}
                      onChange={e => handleChange('depotStock', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unsoldStock">{t('table_unsold_stock')}</Label>
                    <Input
                      id="unsoldStock"
                      type="number"
                      value={productData.unsoldStock || 0}
                       onChange={e => handleChange('unsoldStock', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="depot-location">{t('depot_location')}</Label>
                  <Textarea
                    id="depot-location"
                    value={productData.depotLocation || ''}
                    onChange={e => handleChange('depotLocation', e.target.value)}
                    placeholder={t('depot_location_placeholder')}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">{t('table_notes')}</Label>
                  <Textarea
                    id="notes"
                    value={productData.notes || ''}
                    onChange={e => handleChange('notes', e.target.value)}
                    placeholder={t('depot_notes_placeholder')}
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-2">
                  <Button variant="outline" type="button" onClick={() => router.back()}>{t('cancel')}</Button>
                  <Button type="submit">{t('save_changes')}</Button>
              </CardFooter>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t('depot_product_image')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Image
                  alt={product.name}
                  className="aspect-square w-full rounded-md object-cover"
                  height="300"
                  src={product.imageUrl}
                  width="300"
                  data-ai-hint={product.imageHint}
                />
                <Input id="picture" type="file" />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AppLayout>
  )
}

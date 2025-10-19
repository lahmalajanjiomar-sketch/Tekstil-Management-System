
"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useMemo, useContext } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ShoppingCart, Check, CheckCircle, Search, Trash2 } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Product } from "@/lib/definitions"
import { AuthContext } from "@/context/auth-context"
import { useI18n } from "@/context/i18n-context"
import { useToast } from "@/hooks/use-toast"

function StockEntryDialog({
  product,
  open,
  onOpenChange,
  onStockUpdate
}: {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStockUpdate: (productId: string, quantity: number) => void
}) {
  const { t } = useI18n();
  const [quantity, setQuantity] = useState(1)

  if (!product) return null

  const handleAddStock = () => {
    onStockUpdate(product.id, quantity)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('stock_entry_title')}: {product.name}</DialogTitle>
          <DialogDescription>
            {t('stock_entry_desc', { stock: product.depotStock })}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-end">
              {t('item_unit')}
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
              min="1"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {t('cancel')}
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleAddStock}>
            {t('update_stock_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type CartItem = {
  productId: string;
  quantity: number;
  productName: string;
}

export default function ProductsPage() {
  const auth = useContext(AuthContext)
  const { toast } = useToast()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isStockEntryOpen, setIsStockEntryOpen] = useState(false)
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null)
  const [currentQuantity, setCurrentQuantity] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedBrand, setSelectedBrand] = useState("all")
  const { t } = useI18n()

  const role = auth?.role;
  if (!auth) return null
  const { products, categories, brands, cart, setCart, updateProductStock, deleteProduct } = auth

  const handleOpenStockEntry = (product: Product) => {
    setSelectedProduct(product)
    setIsStockEntryOpen(true)
  }
  
  const handleStockUpdate = (productId: string, quantity: number) => {
    updateProductStock(productId, quantity);
    toast({
        title: "Stok Güncellendi",
        description: `${products.find(p => p.id === productId)?.name} ürününe ${quantity} adet eklendi.`,
    });
  };

  const handleAddToCartClick = (productId: string) => {
    setEditingQuantity(productId)
    setCurrentQuantity(1)
  }

  const handleConfirmAddToCart = (product: Product) => {
    if (currentQuantity > 0) {
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.productId === product.id)
        if (existingItem) {
          return prevCart.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + currentQuantity }
              : item
          )
        } else {
          return [...prevCart, { productId: product.id, quantity: currentQuantity, productName: product.name, price: product.price, imageUrl: product.imageUrl, model: product.model }]
        }
      })
    }
    setEditingQuantity(null)
  }

  const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0)
  
  const cartQueryString = useMemo(() => {
    return encodeURIComponent(JSON.stringify(cart));
  }, [cart]);


  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesBrand = selectedBrand === "all" || product.brand === selectedBrand;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.model.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesBrand && matchesSearch;
    });
  }, [searchQuery, selectedCategory, selectedBrand, products]);
  
  const canAddToCart = role && role !== 'muhasebeci'

  return (
    <AppLayout>
      <PageHeader title={t('sidebar_products')} />

       <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('product_search_placeholder')}
            className="w-full ps-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="w-full sm:w-[200px]">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t('select_category_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_categories')}</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-[200px]">
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder={t('select_brand_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_brands')}</SelectItem>
                  {brands.map(brand => (
                    <SelectItem key={brand.id} value={brand.name}>{brand.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {canAddToCart && totalItemsInCart > 0 && (
                <Link href={`/orders/new?cart=${cartQueryString}`}>
                    <Button className="w-full sm:w-auto">
                        <ShoppingCart className="me-2 h-4 w-4" />
                        ({totalItemsInCart})
                    </Button>
                </Link>
            )}
        </div>
    </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const itemInCart = canAddToCart ? cart.find(item => item.productId === product.id) : null;

          return (
          <Card key={product.id} className="flex flex-col">
            <CardHeader className="relative p-0">
               <div className="absolute top-2 start-2 z-10 flex gap-2">
                <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm hover:bg-white/95">{product.category}</Badge>
                <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm hover:bg-white/95">{product.brand}</Badge>
               </div>
              <div className="absolute top-2 end-2 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-haspopup="true"
                      size="icon"
                      variant="ghost"
                      className="bg-white/50 hover:bg-white/80"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">{t('open_menu')}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/depot/${product.id}`}>{t('edit')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenStockEntry(product)}>
                      {t('stock_entry')}
                    </DropdownMenuItem>
                    {role === 'genel_mudur' && (
                        <>
                            <DropdownMenuSeparator />
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive-foreground">
                                        <Trash2 className="me-2 h-4 w-4"/>
                                        {t('delete')}
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('confirm_delete_title')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t('confirm_delete_product_desc', { name: product.name })}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteProduct(product.id)}>
                                            {t('confirm_delete_yes')}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Image
                alt={product.name}
                className="aspect-square w-full rounded-t-lg object-cover"
                height="300"
                src={product.imageUrl}
                width="300"
                data-ai-hint={product.imageHint}
              />
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">{product.model}</CardDescription>
              <p className="text-sm text-muted-foreground mt-2 truncate">{product.notes}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col items-center justify-center p-2 rounded-md bg-secondary">
                <span className="font-semibold">{t('stock_abbr_unsold')}</span>
                <Badge variant={product.unsoldStock < 20 ? "destructive" : "outline"} className="mt-1">
                  {product.unsoldStock}
                </Badge>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-md bg-secondary">
                <span className="font-semibold">{t('stock_abbr_depot')}</span>
                <Badge variant={product.depotStock < 20 ? "destructive" : "outline"} className="mt-1">
                  {product.depotStock}
                </Badge>
              </div>
            </CardFooter>
            {canAddToCart && (
              <CardFooter className="p-4 pt-0">
                {editingQuantity === product.id ? (
                  <div className="w-full flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={currentQuantity}
                      onChange={(e) => setCurrentQuantity(parseInt(e.target.value, 10) || 1)}
                      className="w-full"
                      placeholder={t('quantity_placeholder')}
                    />
                    <Button onClick={() => handleConfirmAddToCart(product)} size="icon">
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : itemInCart ? (
                  <Button variant="outline" className="w-full" onClick={() => handleAddToCartClick(product.id)}>
                      <CheckCircle className="me-2 text-green-500"/>
                      {t('added_to_cart', { quantity: itemInCart.quantity })}
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => handleAddToCartClick(product.id)}>
                    <ShoppingCart className="me-2" />
                    {t('add_to_cart')}
                  </Button>
                )}
              </CardFooter>
            )}
          </Card>
        )})}
      </div>
      <StockEntryDialog
        product={selectedProduct}
        open={isStockEntryOpen}
        onOpenChange={setIsStockEntryOpen}
        onStockUpdate={handleStockUpdate}
      />
    </AppLayout>
  )
}

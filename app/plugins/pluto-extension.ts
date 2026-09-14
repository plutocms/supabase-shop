import NavbarAdminActions from '../components/NavbarAdminActions.vue'
import PlutoProductAvailabilityField from '../components/PlutoProductAvailabilityField.vue'
import PlutoProductCategoryField from '../components/PlutoProductCategoryField.vue'
import PlutoProductIsCustomField from '../components/PlutoProductIsCustomField.vue'
import PlutoProductMediaField from '../components/PlutoProductMediaField.vue'
import PlutoProductPriceField from '../components/PlutoProductPriceField.vue'
import PlutoProductStockField from '../components/PlutoProductStockField.vue'

export default defineNuxtPlugin(() => {
  definePlutoExtension({
    id: 'supabase-shop',
    capabilities: [
      { id: 'products-manage', key: 'products:manage', label: 'Create and edit products' },
      { id: 'products-delete', key: 'products:delete', label: 'Delete products' },
      {
        id: 'shop-manage-taxonomy',
        key: 'shop:manage_taxonomy',
        label: 'Manage product categories and availability',
      },
    ],
    navbarActions: [{ id: 'product-actions', component: NavbarAdminActions }],
    nav: [
      {
        id: 'products',
        order: 300,
        label: 'Products',
        icon: 'lucide:box',
        to: '/admin/products',
        defaultOpen: true,
        children: [
          { label: 'Create new product', to: '/admin/product/new' },
          { label: 'All products', to: '/admin/products' },
        ],
      },
      {
        id: 'product-media',
        order: 310,
        label: 'Product Medias',
        icon: 'lucide:images',
        to: '/admin/product-media',
      },
    ],
    pages: [
      { id: 'products', path: '/admin/products', title: 'Products', icon: 'lucide:box' },
      { id: 'product-new', path: '/admin/product/new', title: 'New product', parent: 'supabase-shop:products' },
      { id: 'product-media', path: '/admin/product-media', title: 'Product Medias', icon: 'lucide:images' },
    ],
    contentTypes: [{ id: 'product', type: productType }],
    // Registered by `widget:` name only, never bare `fieldType:` — a
    // `fieldType`-keyed entry becomes the app-wide default for every
    // layer's fields of that type, which would hijack blog's (or any
    // other layer's) fields of the same type.
    contentFieldWidgets: [
      { id: 'product-media', widget: 'product-media', component: PlutoProductMediaField },
      { id: 'product-price', widget: 'product-price', component: PlutoProductPriceField },
      { id: 'product-is-custom', widget: 'product-is-custom', component: PlutoProductIsCustomField },
      { id: 'product-availability', widget: 'product-availability', component: PlutoProductAvailabilityField },
      { id: 'product-stock', widget: 'product-stock', component: PlutoProductStockField },
      { id: 'product-category', widget: 'product-category', component: PlutoProductCategoryField },
    ],
  })
})

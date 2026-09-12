import NavbarAdminActions from '../components/NavbarAdminActions.vue'

export default defineNuxtPlugin(() => {
  definePlutoExtension({
    id: 'supabase-shop',
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
  })
})

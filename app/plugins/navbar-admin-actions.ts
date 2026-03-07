import NavbarAdminActions from '../components/NavbarAdminActions.vue'

const sidebarActions = [
  {
    label: 'Products',
    href: '/admin/products',
    icon: 'lucide:box',
    onSelect: () => {
      navigateTo('/admin/products')
    },
    defaultOpen: true,
    children: [
      {
        label: 'Create new product',
        href: '/admin/product/new',
      },

      {
        label: 'All products',
        href: '/admin/products',
      },
    ],
  },

  {
    label: 'Product Medias',
    href: '/admin/product-media',
    icon: 'lucide:images',
  },
]

export default defineNuxtPlugin(() => {
  const { addAction: addNavbarAdminActions } = useNavbarAdminActions()
  const { addAction: addSidebarAdminActions } = useSidebarAdminActions()

  addNavbarAdminActions(markRaw(NavbarAdminActions))
  addSidebarAdminActions(sidebarActions)
})

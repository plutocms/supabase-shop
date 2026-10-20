<script setup lang="ts">
// The navbar actions of this layer. Each one uses the core PlutoNavbarButton,
// so it looks like every other action in the admin navbar.
interface NavbarAction {
  label: string
  icon: string
  to: string
  show: boolean
}

const route = useRoute()
const { t } = usePlutoI18n()
const { can } = usePlutoPermissions()

const items = computed<NavbarAction[]>(() => [
  {
    label: t('supabase-shop.navbar.addProduct'),
    icon: 'lucide:plus',
    to: '/admin/product/new',
    // This hides the button only. It is a UI convenience, not a
    // security check. The server route still enforces
    // products:manage on its own.
    show: !route.path.startsWith('/admin/product/new') && can('products:manage'),
  },

  {
    label: t('supabase-shop.navbar.editProduct'),
    icon: 'lucide:pen-line',
    to: `/admin/product/edit/${
      ('id' in route.params && route.params.id) ||
      ('slug' in route.params && route.params.slug) ||
      ''
    }`,
    show: route.path.startsWith('/product/'),
  },
])
</script>

<template>
  <template v-for="item in items" :key="item.label">
    <PlutoNavbarButton
      v-if="item.show"
      :label="item.label"
      :icon="item.icon"
      :to="item.to"
    />
  </template>
</template>

<script setup lang="tsx">
import type { TableColumn } from '@nuxt/ui'
import { NuxtLink, UButton, ULink } from '#components'

useHead({
  title: 'All products',
})

const { products, refresh, pending } = useProduct()

function formatProductPrice(price: number) {
  return formatCurrency(price, {
    currency: 'BRL',
    spaceBetween: true,
  })
}

const columns = ref<TableColumn<ProductItem>[]>([
  {
    accessorKey: 'id',
    header: '#',
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div class="flex flex-col gap-y-1">
        <div>
          <ULink to={`/admin/product/edit/${row.getValue('id')}`}>
            {row.getValue('name')}
          </ULink>
        </div>

        <div class="opacity-0 group-hover:opacity-100">
          <div class="flex gap-x-3">
            <NuxtLink
              to={`/admin/product/edit/${row.getValue('id')}`}
              class="text-info cursor-pointer px-0 py-0.5 hover:underline"
            >
              Edit
            </NuxtLink>

            <a
              class="text-error cursor-pointer px-0 py-0.5 hover:underline"
              onClick={(event: Event) => {
                event.preventDefault()
                openRemoveProductModal(row.getValue('id'))
              }}
            >
              Remove
            </a>
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) =>
      formatCurrency(row.getValue('price'), {
        currency: 'BRL',
        spaceBetween: true,
      }),
  },
  {
    accessorKey: 'product_category.label',
    header: 'Category',
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
  },
  {
    accessorKey: 'created_at',
    header: 'Created at',
    cell: ({ row }) => new Date(row.getValue('created_at')).toLocaleString(),
  },
])

const currentProductId = ref<number | null>(null)
const isDeleteProductModalOpen = ref<boolean>(false)

function openRemoveProductModal(productId: number | null) {
  if (!productId) {
    return
  }

  currentProductId.value = productId

  isDeleteProductModalOpen.value = true
}

function closeRemoveProductModal() {
  currentProductId.value = null

  isDeleteProductModalOpen.value = false
}

async function deleteProduct(productId: number | null) {
  if (!productId) {
    return
  }

  try {
    await $fetch(`/api/product/delete/${productId}`, {
      method: 'DELETE',
    })

    refresh()

    closeRemoveProductModal()
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div>
    <Modal v-model="isDeleteProductModalOpen" :custom-size="680">
      <ModalHeader @close="closeRemoveProductModal">Remove product</ModalHeader>

      <ModalContent>
        <p>Do you really want to remove this item?</p>
      </ModalContent>

      <ModalFooter>
        <div class="flex items-center gap-4">
          <UButton
            icon="lucide:x"
            variant="ghost"
            color="neutral"
            @click="closeRemoveProductModal"
          >
            Cancel
          </UButton>

          <UButton
            icon="lucide:trash"
            color="error"
            @click="deleteProduct(currentProductId)"
          >
            Remove
          </UButton>
        </div>
      </ModalFooter>
    </Modal>

    <AdminView>
      <div
        class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <hgroup
          class="flex items-center justify-between gap-x-3 lg:justify-start"
        >
          <h1 class="text-3xl font-bold lg:text-4xl">All products</h1>

          <UButton
            :loading="pending"
            icon="lucide:refresh-ccw"
            variant="ghost"
            title="Refresh"
            square
            @click="refresh()"
          />
        </hgroup>

        <div class="flex lg:shrink-0">
          <UButton
            icon="lucide:plus"
            as="NuxtLink"
            to="/admin/product/new"
            class="flex-1 justify-center lg:flex-none"
          >
            Add product
          </UButton>
        </div>
      </div>

      <div class="grid gap-3 lg:hidden">
        <UCard v-for="product in products" :key="product.id">
          <div class="flex flex-col gap-4">
            <div class="min-w-0">
              <NuxtLink
                :to="`/admin/product/edit/${product.id}`"
                class="block truncate text-lg font-semibold hover:underline"
              >
                {{ product.name }}
              </NuxtLink>
              <p class="mt-1 truncate text-sm text-muted">
                /{{ product.slug }}
              </p>
            </div>

            <dl class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt class="text-muted">Price</dt>
                <dd class="font-medium">
                  {{ formatProductPrice(product.price) }}
                </dd>
              </div>
              <div>
                <dt class="text-muted">Category</dt>
                <dd class="font-medium">
                  {{ product.product_category?.label || 'Uncategorized' }}
                </dd>
              </div>
            </dl>

            <div class="flex gap-2 border-t border-default pt-3">
              <UButton
                :to="`/admin/product/edit/${product.id}`"
                icon="lucide:pen-line"
                color="neutral"
                variant="soft"
                class="flex-1 justify-center"
              >
                Edit
              </UButton>
              <UButton
                icon="lucide:trash"
                color="error"
                variant="soft"
                class="flex-1 justify-center"
                @click="openRemoveProductModal(product.id)"
              >
                Remove
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <UCard :ui="{ body: 'sm:p-0 p-0' }" class="hidden lg:block">
        <div class="overflow-x-auto">
          <UTable
            :data="products"
            :columns="columns"
            :meta="{
              class: {
                tr: 'group',
                // td: 'py-1!',
              },
            }"
            :loading="pending"
          />
        </div>
      </UCard>
    </AdminView>
  </div>
</template>

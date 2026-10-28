<script setup lang="ts">
// The `product.media` field widget — the virtual field that carries the
// product's gallery through the generic form. It shows the photos as a main
// image plus a thumbnail strip. It shows the 3D model (`.glb`) as its own
// tile. It reuses UploadProductMedia.vue as the picker. See the
// shop-products skill.
//
// Because `media` is virtual, `item.media` is always undefined when the
// form first loads (see `mapColumnsToFields` in `@plutocms/pluto`) — this
// widget loads its own starting gallery in `onMounted`, from the
// `GET /api/_pluto/shop/products/:id/media` route, which returns the
// `product_media` rows with public URLs. A brand-new product (no route id)
// skips that fetch entirely and starts with an empty gallery.
//
// The widget never writes to the database. It sends `{ items, removedIds }`
// to the form, and the server hook applies it on save. A product keeps at
// most one 3D model: a new model puts the id of the old one in `removedIds`.
defineProps<{
  field: PlutoMediaField
  modelValue: unknown
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [
    value: { items: MediaWithSaved[]; removedIds: number[] },
  ]
}>()

const route = useRoute()
const { t } = usePlutoI18n()

const productId = computed<number | undefined>(() => {
  // A consumer app with typed pages types `params` as a union of every
  // route's params. Some members have no `id`, so narrow with `in` first.
  const raw = 'id' in route.params ? route.params.id : undefined
  const id = Array.isArray(raw) ? raw[0] : raw
  return id ? Number(id) : undefined
})

const items = ref<MediaWithSaved[]>([])
const removedIds = ref<number[]>([])
const currentSelectedImage = ref(0)
const isMediaModalOpen = ref(false)
const pickerStartTab = ref<'gallery' | 'models'>('gallery')
const hasChanges = ref(false)
const loadStatus = ref<'pending' | 'error' | 'ready'>(
  productId.value ? 'pending' : 'ready'
)

/** Photos only. A 3D model is never a photo, so it never becomes the main image. */
const images = computed(() =>
  items.value.filter((entry) => !isProductMediaModel(entry))
)
const model = computed(() =>
  items.value.find((entry) => isProductMediaModel(entry))
)

const mainImage = computed(() => images.value[currentSelectedImage.value])

function emitUpdate() {
  hasChanges.value = true
  emit('update:modelValue', {
    items: [...items.value],
    removedIds: [...removedIds.value],
  })
}

function markRemoved(entry: MediaWithSaved) {
  if (entry.id && !removedIds.value.includes(entry.id)) {
    removedIds.value.push(entry.id)
  }
}

async function loadMedia() {
  if (!productId.value) {
    return
  }

  loadStatus.value = 'pending'

  try {
    const { data } = await $fetch<{ data: MediaWithSaved[] }>(
      `/api/_pluto/shop/products/${productId.value}/media`
    )

    items.value = data.map((entry) => ({ ...entry, is_saved: true }))
    loadStatus.value = 'ready'
  } catch {
    loadStatus.value = 'error'
  }
}

onMounted(loadMedia)

function openPicker(tab: 'gallery' | 'models') {
  pickerStartTab.value = tab
  isMediaModalOpen.value = true
}

function closeMediaModal() {
  isMediaModalOpen.value = false
}

function removeImage(entry: MediaWithSaved | undefined) {
  if (!entry) {
    return
  }

  const index = images.value.indexOf(entry)

  markRemoved(entry)
  items.value = items.value.filter((item) => item !== entry)

  if (index < currentSelectedImage.value) {
    currentSelectedImage.value -= 1
  }

  currentSelectedImage.value = Math.max(
    0,
    Math.min(currentSelectedImage.value, images.value.length - 1)
  )

  emitUpdate()
}

function removeModel() {
  const current = model.value

  if (!current) {
    return
  }

  markRemoved(current)
  items.value = items.value.filter((item) => item !== current)

  emitUpdate()
}

function handleInsertMedia(event: MediaWithSaved | MediaWithSaved[] | null) {
  const incoming = Array.isArray(event) ? event : event ? [event] : []

  // An item that comes back must not stay in the removed list.
  for (const entry of incoming) {
    const removedIndex = entry.id ? removedIds.value.indexOf(entry.id) : -1

    if (removedIndex !== -1) {
      removedIds.value.splice(removedIndex, 1)
    }
  }

  // Only one 3D model at a time. A new model replaces the old one, and the
  // old one is detached on save through `removedIds`.
  const newModel = incoming.findLast((entry) => isProductMediaModel(entry))

  if (newModel) {
    for (const old of items.value) {
      if (isProductMediaModel(old) && old.id !== newModel.id) {
        markRemoved(old)
      }
    }

    items.value = items.value.filter((entry) => !isProductMediaModel(entry))
    items.value.push(newModel)
  }

  const knownIds = new Set(items.value.map((entry) => entry.id).filter(Boolean))
  const newImages = incoming.filter(
    (entry) =>
      !isProductMediaModel(entry) && !(entry.id && knownIds.has(entry.id))
  )

  if (newImages.length > 0) {
    items.value.push(...newImages)
    currentSelectedImage.value = images.value.length - 1
  }

  emitUpdate()
  closeMediaModal()
}
</script>

<template>
  <UFormField :label="field.label" :description="field.description">
    <div class="flex flex-col gap-4">
      <UAlert
        v-if="loadStatus === 'error'"
        :title="t('supabase-shop.mediaField.loadFailed')"
        :description="t('supabase-shop.mediaField.loadFailedDescription')"
        :actions="[
          {
            label: t('supabase-shop.mediaField.retry'),
            icon: 'lucide:refresh-cw',
            color: 'error',
            variant: 'outline',
            onClick: loadMedia,
          },
        ]"
        color="error"
        variant="subtle"
        icon="lucide:circle-alert"
      />

      <div
        v-if="loadStatus === 'pending'"
        :aria-label="t('supabase-shop.mediaField.loading')"
        class="flex flex-col items-stretch gap-4 lg:flex-row lg:items-start"
        aria-busy="true"
      >
        <USkeleton class="aspect-square w-full max-w-96 shrink-0 rounded-md" />
        <div class="flex gap-2 lg:flex-col">
          <USkeleton v-for="n in 3" :key="n" class="size-14 rounded-md" />
        </div>
      </div>

      <div
        v-else-if="loadStatus === 'ready'"
        class="flex flex-col items-stretch gap-4 lg:flex-row lg:items-start"
      >
        <!-- Main image -->
        <div
          class="aspect-square w-full max-w-96 shrink-0 self-center lg:self-start"
        >
          <button
            v-if="images.length === 0"
            :disabled="disabled"
            :aria-label="t('supabase-shop.mediaField.add')"
            type="button"
            class="group grid size-full cursor-pointer place-items-center rounded-md bg-muted transition-colors hover:bg-accented focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
            @click="openPicker('gallery')"
          >
            <span
              class="flex flex-col items-center gap-2 text-muted group-hover:text-default"
            >
              <Icon name="lucide:image-plus" class="text-5xl" />
              <span class="text-sm">{{
                t('supabase-shop.mediaField.add')
              }}</span>
            </span>
          </button>

          <div
            v-else
            class="relative size-full overflow-hidden rounded-md bg-elevated"
          >
            <img
              v-if="mainImage?.name"
              :src="mainImage.url ?? ''"
              :alt="mainImage.alt || mainImage.name"
              class="size-full object-contain"
            />

            <div class="absolute right-0 bottom-0 p-3">
              <UButton
                :disabled="disabled"
                :aria-label="t('supabase-shop.mediaField.remove')"
                :title="t('supabase-shop.mediaField.remove')"
                icon="lucide:trash"
                variant="soft"
                color="error"
                square
                @click="removeImage(mainImage)"
              />
            </div>
          </div>
        </div>

        <!-- Thumbnails and the 3D model tile -->
        <div
          class="flex flex-row flex-wrap items-start gap-2 lg:flex-col lg:flex-nowrap"
        >
          <button
            v-for="(image, index) in images"
            :key="image.id ?? `new-${index}`"
            :class="[
              currentSelectedImage === index && 'ring-2 ring-primary',
              !image.is_saved && 'opacity-50',
            ]"
            :title="
              !image.is_saved ? t('supabase-shop.mediaField.unsaved') : ''
            "
            :aria-label="
              t('supabase-shop.mediaField.select', { index: index + 1 })
            "
            :aria-pressed="currentSelectedImage === index"
            type="button"
            class="size-14 shrink-0 cursor-pointer overflow-hidden rounded-md bg-elevated transition-colors hover:bg-accented focus-visible:outline-2 focus-visible:outline-primary"
            @click="currentSelectedImage = index"
          >
            <img
              v-if="image.name"
              :src="image.url ?? ''"
              :alt="image.alt || image.name"
              class="size-full object-cover"
            />
          </button>

          <button
            v-if="images.length > 0"
            :disabled="disabled"
            :aria-label="t('supabase-shop.mediaField.add')"
            :title="t('supabase-shop.mediaField.add')"
            type="button"
            class="grid size-14 shrink-0 cursor-pointer place-items-center rounded-md bg-muted text-muted transition-colors hover:bg-accented hover:text-default focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
            @click="openPicker('gallery')"
          >
            <Icon name="lucide:plus" class="text-2xl" />
          </button>

          <!-- 3D model: its own tile, with its own buttons -->
          <div
            v-if="model"
            class="flex w-full min-w-0 items-center gap-2 rounded-md bg-elevated p-2 lg:w-56"
          >
            <Icon
              name="lucide:rotate-3d"
              class="shrink-0 text-2xl text-muted"
            />

            <div class="min-w-0 grow">
              <div class="text-xs text-muted">
                {{ t('supabase-shop.mediaField.model') }}
              </div>
              <div :title="model.name ?? ''" class="truncate text-sm">
                {{ model.name }}
              </div>
            </div>

            <UButton
              :disabled="disabled"
              :aria-label="t('supabase-shop.mediaField.manage3d')"
              :title="t('supabase-shop.mediaField.manage3d')"
              icon="lucide:replace"
              variant="ghost"
              color="neutral"
              square
              @click="openPicker('models')"
            />

            <UButton
              :disabled="disabled"
              :aria-label="t('supabase-shop.mediaField.remove3d')"
              :title="t('supabase-shop.mediaField.remove3d')"
              icon="lucide:trash"
              variant="ghost"
              color="error"
              square
              @click="removeModel"
            />
          </div>

          <UButton
            v-else
            :disabled="disabled"
            icon="lucide:rotate-3d"
            variant="outline"
            color="neutral"
            size="sm"
            @click="openPicker('models')"
          >
            {{ t('supabase-shop.mediaField.add3d') }}
          </UButton>
        </div>
      </div>

      <p v-if="hasChanges" class="text-sm text-muted">
        {{ t('supabase-shop.mediaField.applyOnSave') }}
      </p>

      <UploadProductMedia
        v-model="isMediaModalOpen"
        :product-id="productId"
        :start-tab="pickerStartTab"
        @insert="handleInsertMedia"
      />
    </div>
  </UFormField>
</template>

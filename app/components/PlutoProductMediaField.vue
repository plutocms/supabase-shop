<script setup lang="ts">
// The `product.media` field widget — the virtual field that carries the
// product's gallery through the generic form. Ports the thumbnail strip,
// main image, remove button, and .glb 3D-model handling from the old
// Post.vue, reusing UploadProductMedia.vue unchanged as the picker. See
// the shop-products skill.
//
// Because `media` is virtual, `item.media` is always undefined when the
// form first loads (see `mapColumnsToFields` in `@plutocms/pluto`) — this
// widget loads its own starting gallery in `onMounted`, from the
// hand-written `GET /api/product/get/:id` route, which still returns
// `product_media` with public URLs. A brand-new product (no route id)
// skips that fetch entirely and starts with an empty gallery.
defineProps<{
  field: PlutoMediaField
  modelValue: unknown
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: { items: MediaWithSaved[], removedIds: number[] }]
}>()

const route = useRoute()

const productId = computed<number | undefined>(() => {
  const raw = route.params.id
  const id = Array.isArray(raw) ? raw[0] : raw
  return id ? Number(id) : undefined
})

const items = ref<MediaWithSaved[]>([])
const removedIds = ref<number[]>([])
const currentSelectedImage = ref(0)
const isMediaModalOpen = ref(false)

const lastImageIndex = computed(() => items.value.length - 1)

function is3d(entry: MediaWithSaved | MediaWithSaved[] | null) {
  if (Array.isArray(entry)) {
    return entry.some((item) => item.name?.endsWith('.glb'))
  }

  return entry?.name?.endsWith('.glb')
}

function emitUpdate() {
  emit('update:modelValue', { items: items.value, removedIds: removedIds.value })
}

onMounted(async () => {
  if (!productId.value) {
    return
  }

  const { data } = await $fetch<{ data: { product_media: MediaWithSaved[] | null } }>(
    `/api/product/get/${productId.value}`
  )

  const media = (data.product_media ?? []).map((entry) => ({ ...entry, is_saved: true }))

  // Move .glb media to the end, matching the old edit page.
  const glb = media.filter((entry) => entry.name?.toLowerCase().endsWith('.glb'))
  const rest = media.filter((entry) => !entry.name?.toLowerCase().endsWith('.glb'))

  items.value = [...rest, ...glb]
})

const toast = useToast()

function openMediaModal() {
  isMediaModalOpen.value = true
}

function closeMediaModal() {
  isMediaModalOpen.value = false
}

function removeMedia(index: number) {
  const removed = items.value[index]

  if (removed?.id) {
    removedIds.value.push(removed.id)
  }

  items.value.splice(index, 1)

  if (currentSelectedImage.value === index) {
    currentSelectedImage.value = 0
  } else if (currentSelectedImage.value > index) {
    currentSelectedImage.value -= 1
  }

  emitUpdate()

  toast.add({
    title: 'Media removed',
    description: 'The selected media has been removed.',
    color: 'info',
  })
}

function handleInsertMedia(event: MediaWithSaved | MediaWithSaved[] | null) {
  // Remove any previous .glb media before inserting a new one — only one
  // 3D model at a time, matching the old edit page.
  items.value = items.value.filter((item) => !item.name?.endsWith('.glb'))

  if (Array.isArray(event)) {
    items.value.push(...event)
  } else if (event) {
    items.value.push(event)
  }

  currentSelectedImage.value = lastImageIndex.value

  emitUpdate()

  toast.add({
    title: 'Media added',
    description: 'The selected media has been added.',
    color: 'success',
  })

  closeMediaModal()
}
</script>

<template>
  <UFormField :label="field.label" :description="field.description">
    <div class="flex flex-col items-stretch gap-4 lg:flex-row lg:items-start">
      <!-- Media Gallery -->
      <div class="flex flex-row items-center gap-4 lg:flex-col lg:items-start">
        <ScrollArea class="w-full rounded-2xl p-2 lg:w-24">
          <div class="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            <template v-if="items.length > 0">
              <button
                v-for="(image, index) in items"
                :key="index"
                :class="[
                  currentSelectedImage === index && 'ring-2 ring-green-400',
                  !image.is_saved && 'opacity-50',
                  is3d(image) ? 'hidden' : '',
                ]"
                :title="!image.is_saved ? 'Unsaved' : ''"
                :aria-label="`Select media ${index + 1}`"
                type="button"
                class="h-14 w-14 overflow-hidden rounded-2xl bg-black/10 hover:bg-black/20 cursor-pointer transition-all"
                @click="currentSelectedImage = index"
              >
                <img v-if="image.name" :src="image.url ?? ''" class="h-full w-full object-cover" />
              </button>
            </template>

            <div class="flex shrink-0 gap-2 lg:mt-2 lg:flex-col">
              <button
                v-if="items.find((m) => is3d(m))"
                :disabled="disabled"
                type="button"
                aria-label="Manage 3D model"
                class="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl dark:bg-black/90 light:bg-white/90 hover:dark:bg-black/80 hover:light:bg-white/80 cursor-pointer"
                @click="openMediaModal"
              >
                <Icon name="lucide:rotate-3d" class="text-2xl" />
              </button>

              <button
                :disabled="disabled"
                type="button"
                aria-label="Add media"
                class="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl dark:bg-black/90 light:bg-white/90 hover:dark:bg-black/80 hover:light:bg-white/80 cursor-pointer"
                @click="openMediaModal"
              >
                <Icon name="lucide:plus" class="text-2xl" />
              </button>
            </div>
          </div>
        </ScrollArea>

        <UploadProductMedia v-model="isMediaModalOpen" :product-id="productId" @insert="handleInsertMedia" />
      </div>

      <!-- Main Image -->
      <div class="aspect-square w-full max-w-96 shrink-0 self-center">
        <div
          :class="[items.length > 0 ? 'bg-black' : 'bg-black/10 hover:bg-black/20']"
          class="group relative h-full overflow-hidden rounded-3xl shadow-lg"
        >
          <label
            v-if="items.length === 0"
            for="main-image"
            class="absolute top-0 left-0 h-full w-full cursor-pointer"
            @click="openMediaModal"
          />

          <div class="absolute right-0 bottom-0 p-3">
            <UButton
              v-if="items.length > 0"
              :disabled="disabled"
              variant="soft"
              color="error"
              title="Remove media"
              square
              @click="removeMedia(currentSelectedImage)"
            >
              <Icon name="lucide:trash" class="text-2xl" />
            </UButton>
          </div>

          <div
            v-if="items.length === 0"
            class="pointer-events-none absolute top-0 left-0 grid h-full w-full place-items-center"
          >
            <Icon name="lucide:plus" class="text-5xl opacity-20 transition-opacity group-hover:opacity-100" />
          </div>

          <img
            v-if="!!items[currentSelectedImage]?.name"
            :src="items[currentSelectedImage]?.url ?? ''"
            class="h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  </UFormField>
</template>

<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const props = defineProps<{
  productId?: number
}>()

const emit = defineEmits<{
  insert: [value: EmitValue | EmitValue[] | null]
}>()

const isMediaModalOpen = defineModel<boolean>({
  default: false,
})

const { mediaList, refreshMediaList, mediaStatus } = useProductMedia()

const imageList = computed(() => {
  return mediaList.value?.data.filter((item) => !item.name?.endsWith('.glb'))
})

const threeDModelList = computed(() => {
  return mediaList.value?.data.filter((item) => item.name?.endsWith('.glb'))
})

function closeMediaModal() {
  isMediaModalOpen.value = false
}

const currentTab = ref<'0' | '1' | '2'>('0')

watch(currentTab, () => {
  resetAll()

  if (currentTab.value === '0') {
    refreshMediaList()
  }
})

const tabs = ref<TabsItem[]>([
  {
    label: 'Gallery',
    icon: 'lucide:blocks',
    slot: 'gallery',
  },
  {
    label: '3D Models',
    icon: 'lucide:rotate-3d',
    slot: 'three-dimensional',
  },
  {
    label: 'Upload',
    icon: 'lucide:upload',
    slot: 'upload',
  },
])

interface Form {
  alt: string
}

const form = ref<Form>({
  alt: '',
})

const selectedFile = ref<File | null>(null)
/** Why the last file could not be uploaded, for the user. */
const uploadError = ref<string | null>(null)

// The same rules the upload route applies, so the picker rejects a file
// before it sends it.
watch(selectedFile, (file) => {
  if (!file) {
    return
  }
  const problem = productMediaUploadProblem(file)
  uploadError.value = problem?.message ?? null
  if (problem) {
    selectedFile.value = null
  }
})

// UFileUpload emits `reject` for dropped files that do not match `accept`.
function onReject(rejected: File[]) {
  uploadError.value = rejected
    .map((file) => productMediaUploadProblem(file)?.message
      ?? `"${file.name}" is not a supported file type. Upload a JPEG, PNG, WebP, GIF, or AVIF image, or a .glb 3D model.`)
    .join(' ')
}

/** The upload route's own message (413, 415, ...), in words for the user. */
function uploadErrorMessage(error: unknown): string {
  const failure = error as { statusCode?: number, statusMessage?: string, data?: { statusMessage?: string, message?: string } }
  if (failure?.statusCode === 403) {
    return 'You do not have permission to upload product media.'
  }
  return failure?.data?.statusMessage || failure?.data?.message || failure?.statusMessage || 'The upload failed. Try again.'
}

const isUploaded = ref<boolean>(false)
const isUploading = ref<boolean>(false)

const uploadedMedia = ref<ProductMedia | null>(null)

async function hydrateUploadedMediaUrl() {
  const id = uploadedMedia.value?.id

  if (!id || uploadedMedia.value?.url) {
    return
  }

  await refreshMediaList()

  const mediaWithUrl = mediaList.value?.data.find((item) => item.id === id)

  if (!mediaWithUrl?.url) {
    return
  }

  uploadedMedia.value = {
    ...uploadedMedia.value,
    ...mediaWithUrl,
    product_id: props.productId ?? null,
  }
}

watch(isUploaded, async (value) => {
  if (!value) {
    return
  }

  await hydrateUploadedMediaUrl()
})

async function uploadMedia() {
  let response
  const file = selectedFile.value

  const formData = new FormData()

  if (!file) {
    return
  }

  formData.append('media_file', file)
  formData.append('name', file.name)
  formData.append('alt', form.value.alt)

  try {
    isUploading.value = true
    uploadError.value = null

    response = await $fetch('/api/product-media/new', {
      method: 'POST',
      body: formData,
    })

    if (response) {
      isUploaded.value = true

      uploadedMedia.value = response.data
    }
  } catch (error) {
    uploadError.value = uploadErrorMessage(error)
  } finally {
    isUploading.value = false
  }
}

function removeImage() {
  selectedFile.value = null
  uploadError.value = null
}

const selectedMedia = ref<number[]>([])

function isSelected(id: number) {
  return selectedMedia.value.includes(id)
}

function selectMedia(id: number) {
  if (selectedMedia.value.includes(id)) {
    const index = selectedMedia.value.indexOf(id)

    selectedMedia.value.splice(index, 1)

    return
  }

  selectedMedia.value.push(id)
}

function selectSingleMedia(id: number) {
  selectedMedia.value = [id]
}

type EmitValue = ProductMedia

const transformedSelectedMedia = computed<EmitValue[]>(() => {
  const value = selectedMedia.value
    .map((item) => {
      if (!mediaList.value) {
        return undefined
      }

      const mediaItem = mediaList.value.data.find(
        (dataItem) => item === dataItem.id
      )

      if (!mediaItem) {
        return undefined
      }

      const transformedMediaItem: EmitValue = {
        ...mediaItem,
        product_id: props.productId ?? null,
      }

      return transformedMediaItem
    })
    .filter((item): item is EmitValue => item !== undefined)

  return value
})

function insertMedia() {
  if (currentTab.value === '0' || currentTab.value === '1') {
    if (!transformedSelectedMedia.value) {
      return
    }

    emit('insert', transformedSelectedMedia.value)
  } else {
    if (!uploadedMedia.value) {
      return
    }

    emit('insert', uploadedMedia.value)
  }

  resetAll()
}

function resetAll() {
  removeImage()
  isUploaded.value = false
  uploadedMedia.value = null

  selectedMedia.value = []
}

const isInsertButtonDisabled = computed(
  () =>
    (currentTab.value === '0' && selectedMedia.value.length === 0) ||
    (currentTab.value === '1' && selectedMedia.value.length === 0) ||
    (currentTab.value === '2' && isUploaded.value === false)
)
</script>

<template>
  <Modal v-model="isMediaModalOpen" :custom-size="1200" prevent-click-outside>
    <ModalHeader @close="closeMediaModal">Insert media</ModalHeader>

    <ModalContent>
      <div>
        <UTabs
          v-model="currentTab"
          :items="tabs"
          :ui="{ trigger: 'min-w-0 px-2' }"
          class="w-full"
        >
          <template #gallery>
            <div class="@container flex flex-col gap-y-6 pt-6">
              <div
                class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
              >
                <div
                  class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-x-4"
                >
                  <div>
                    <span v-if="selectedMedia.length === 0">
                      Showing {{ imageList?.length }} file{{
                        imageList?.length === 1 ? '' : 's'
                      }}
                    </span>

                    <span v-else>
                      {{ selectedMedia.length }} of
                      {{ imageList?.length }} files selected
                    </span>
                  </div>

                  <div v-if="selectedMedia.length > 0">
                    <UButton
                      color="error"
                      variant="outline"
                      icon="lucide:x"
                      @click="selectedMedia = []"
                    >
                      Cancel selection
                    </UButton>
                  </div>
                </div>

                <div class="flex">
                  <UButton
                    :loading="mediaStatus === 'pending'"
                    icon="lucide:refresh-cw"
                    class="w-full justify-center sm:w-auto"
                    @click="refreshMediaList()"
                  >
                    Refresh
                  </UButton>
                </div>
              </div>

              <div
                class="grid grid-cols-2 gap-3 @sm:grid-cols-3 @md:grid-cols-4 @lg:grid-cols-5"
              >
                <div
                  v-for="file in imageList"
                  :key="file.id"
                  class="group/image-select relative aspect-square overflow-hidden rounded-2xl bg-elevated select-none hover:ring-1 hover:ring-accented has-aria-checked:ring-2 has-aria-checked:ring-primary"
                >
                  <label
                    class="absolute top-0 left-0 grid h-full w-full items-start justify-end"
                  >
                    <div class="rounded-bl-2xl bg-default/80 p-2">
                      <UCheckbox
                        :model-value="isSelected(file.id)"
                        @change="selectMedia(file.id)"
                      />
                    </div>
                  </label>

                  <img
                    v-if="file.name"
                    :src="file.url"
                    :alt="file.alt || file.name"
                    class="h-full w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </template>

          <template #three-dimensional>
            <div class="@container flex flex-col gap-y-6 pt-6">
              <div
                class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>You can only select one 3D model at a time.</div>

                <div class="flex">
                  <UButton
                    :loading="mediaStatus === 'pending'"
                    icon="lucide:refresh-cw"
                    class="w-full justify-center sm:w-auto"
                    @click="refreshMediaList()"
                  >
                    Refresh
                  </UButton>
                </div>
              </div>

              <div
                class="grid grid-cols-2 gap-3 @sm:grid-cols-3 @md:grid-cols-4 @lg:grid-cols-5"
              >
                <div
                  v-for="file in threeDModelList"
                  :key="file.id"
                  class="group/image-select relative aspect-square overflow-hidden rounded-2xl bg-elevated select-none hover:ring-1 hover:ring-accented has-aria-checked:ring-2 has-aria-checked:ring-primary"
                >
                  <label
                    class="absolute top-0 left-0 grid h-full w-full items-start justify-end"
                  >
                    <div class="rounded-bl-2xl bg-default/80 p-2">
                      <UCheckbox
                        :model-value="isSelected(file.id)"
                        @change="selectSingleMedia(file.id)"
                      />
                    </div>
                  </label>

                  <div
                    class="pointer-events-none grid size-full place-items-center"
                  >
                    <div class="flex flex-col items-center gap-y-2">
                      <Icon
                        name="lucide:rotate-3d"
                        class="text-5xl opacity-20 transition-opacity group-hover/image-select:opacity-100"
                      />

                      <div class="text-muted text-sm">{{ file.name }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #upload>
            <div class="flex flex-col gap-4 pt-6 lg:flex-row lg:gap-x-4">
              <UFileUpload
                v-model="selectedFile"
                :accept="PRODUCT_MEDIA_ACCEPT"
                :disabled="isUploading || isUploaded"
                :description="`Or click to browse. Up to ${PRODUCT_MEDIA_MAX_SIZE}.`"
                :ui="{ fileLeadingAvatar: 'size-full rounded-lg bg-elevated [&>img]:object-contain' }"
                icon="lucide:image-up"
                label="Drop an image or a .glb 3D model here"
                class="min-h-72 grow"
                @reject="onReject"
              />

              <div
                class="flex w-full min-w-0 shrink-0 flex-col gap-y-4 lg:w-75"
              >
                <UAlert
                  v-if="uploadError"
                  :description="uploadError"
                  color="error"
                  variant="subtle"
                  icon="lucide:circle-alert"
                  title="This file cannot be uploaded"
                  close
                  @update:open="uploadError = null"
                />

                <div v-if="selectedFile" class="wrap-break-word">{{ selectedFile.name }}</div>

                <div v-if="isUploaded && uploadedMedia?.url" class="truncate">
                  <ULink :href="uploadedMedia.url" target="_blank">
                    {{ uploadedMedia.url }}
                  </ULink>
                </div>

                <div v-if="!isUploaded && selectedFile">
                  <UFormField label="Alt text">
                    <UInput
                      v-model="form.alt"
                      placeholder="e.g: Image of a cute dog"
                    />
                  </UFormField>
                </div>

                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <UButton
                    v-if="!isUploaded && selectedFile"
                    color="error"
                    variant="outline"
                    icon="lucide:x"
                    @click="removeImage"
                  >
                    Cancel
                  </UButton>

                  <UButton
                    v-if="!isUploaded && selectedFile"
                    :loading="isUploading"
                    icon="lucide:upload"
                    loading-icon="lucide:loader-circle"
                    @click="uploadMedia"
                  >
                    Upload{{ isUploading ? 'ing...' : '' }}
                  </UButton>
                </div>
              </div>
            </div>
          </template>
        </UTabs>
      </div>
    </ModalContent>

    <ModalFooter>
      <div
        class="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-x-3"
      >
        <UButton
          variant="ghost"
          icon="lucide:x"
          class="justify-center"
          @click="closeMediaModal"
        >
          Close
        </UButton>

        <UButton
          :disabled="isInsertButtonDisabled"
          variant="solid"
          icon="lucide:check"
          class="justify-center"
          @click="insertMedia"
        >
          Insert
          <span v-show="selectedMedia.length > 0">
            ({{ selectedMedia.length }} selected)
          </span>
        </UButton>
      </div>
    </ModalFooter>
  </Modal>
</template>

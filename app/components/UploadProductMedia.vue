<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const props = withDefaults(
  defineProps<{
    productId?: number
    /** The tab the picker shows each time it opens. */
    startTab?: 'gallery' | 'models' | 'upload'
  }>(),
  { startTab: 'gallery' }
)

const emit = defineEmits<{
  insert: [value: EmitValue | EmitValue[] | null]
}>()

const isMediaModalOpen = defineModel<boolean>({
  default: false,
})

const { t } = usePlutoI18n()
const translateError = usePlutoErrorText()

const { mediaList, refreshMediaList, mediaStatus } = useProductMedia()

const imageList = computed(() => {
  return mediaList.value?.data.filter((item) => !isProductMediaModel(item))
})

const threeDModelList = computed(() => {
  return mediaList.value?.data.filter((item) => isProductMediaModel(item))
})

function closeMediaModal() {
  isMediaModalOpen.value = false
}

const currentTab = ref<'0' | '1' | '2'>('0')

const START_TABS = { gallery: '0', models: '1', upload: '2' } as const

// Open on the tab the caller asks for.
watch(isMediaModalOpen, (open) => {
  if (open) {
    currentTab.value = START_TABS[props.startTab]
  }
})

watch(currentTab, () => {
  resetAll()

  if (currentTab.value === '0') {
    refreshMediaList()
  }
})

const tabs = computed<TabsItem[]>(() => [
  {
    label: t('supabase-shop.picker.tabs.gallery'),
    icon: 'lucide:blocks',
    slot: 'gallery',
  },
  {
    label: t('supabase-shop.picker.tabs.models'),
    icon: 'lucide:rotate-3d',
    slot: 'three-dimensional',
  },
  {
    label: t('supabase-shop.picker.tabs.upload'),
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
  uploadError.value = problem ? t(problem.key, problem.params) : null
  if (problem) {
    selectedFile.value = null
  }
})

// UFileUpload emits `reject` for dropped files that do not match `accept`.
function onReject(rejected: File[]) {
  uploadError.value = rejected
    .map((file) => {
      const problem = productMediaUploadProblem(file)
      return problem
        ? t(problem.key, problem.params)
        : t('supabase-shop.upload.unsupportedType', { name: file.name })
    })
    .join(' ')
}

/** The upload route's own message (413, 415, ...), in words for the user. */
function uploadErrorMessage(error: unknown): string {
  const failure = error as { statusCode?: number }
  if (failure?.statusCode === 403) {
    return t('supabase-shop.upload.noPermission')
  }
  return translateError(error, 'supabase-shop.upload.failed')
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

    response = await $fetch('/api/_pluto/shop/product-media', {
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
    <ModalHeader @close="closeMediaModal">
      {{ t('supabase-shop.picker.title') }}
    </ModalHeader>

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
                      {{ t('supabase-shop.media.showing', imageList?.length ?? 0) }}
                    </span>

                    <span v-else>
                      {{
                        t('supabase-shop.media.selectedOf', {
                          selected: selectedMedia.length,
                          total: imageList?.length,
                        })
                      }}
                    </span>
                  </div>

                  <div v-if="selectedMedia.length > 0">
                    <UButton
                      color="error"
                      variant="outline"
                      icon="lucide:x"
                      @click="selectedMedia = []"
                    >
                      {{ t('supabase-shop.picker.cancelSelection') }}
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
                    {{ t('pluto.common.refresh') }}
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
                <div>{{ t('supabase-shop.picker.oneModelOnly') }}</div>

                <div class="flex">
                  <UButton
                    :loading="mediaStatus === 'pending'"
                    icon="lucide:refresh-cw"
                    class="w-full justify-center sm:w-auto"
                    @click="refreshMediaList()"
                  >
                    {{ t('pluto.common.refresh') }}
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
                :description="t('supabase-shop.picker.dropDescription', { size: PRODUCT_MEDIA_MAX_SIZE })"
                :ui="{ fileLeadingAvatar: 'size-full rounded-lg bg-elevated [&>img]:object-contain' }"
                :label="t('supabase-shop.picker.dropLabel')"
                icon="lucide:image-up"
                class="min-h-72 grow"
                @reject="onReject"
              />

              <div
                class="flex w-full min-w-0 shrink-0 flex-col gap-y-4 lg:w-75"
              >
                <UAlert
                  v-if="uploadError"
                  :description="uploadError"
                  :title="t('supabase-shop.picker.errorTitle')"
                  color="error"
                  variant="subtle"
                  icon="lucide:circle-alert"
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
                  <UFormField :label="t('supabase-shop.picker.altText')">
                    <UInput
                      v-model="form.alt"
                      :placeholder="t('supabase-shop.picker.altPlaceholder')"
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
                    {{ t('pluto.common.cancel') }}
                  </UButton>

                  <UButton
                    v-if="!isUploaded && selectedFile"
                    :loading="isUploading"
                    icon="lucide:upload"
                    loading-icon="lucide:loader-circle"
                    @click="uploadMedia"
                  >
                    {{
                      isUploading
                        ? t('supabase-shop.picker.uploading')
                        : t('supabase-shop.picker.upload')
                    }}
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
          {{ t('pluto.common.close') }}
        </UButton>

        <UButton
          :disabled="isInsertButtonDisabled"
          variant="solid"
          icon="lucide:check"
          class="justify-center"
          @click="insertMedia"
        >
          {{ t('supabase-shop.picker.insert') }}
          <span v-show="selectedMedia.length > 0">
            {{ t('supabase-shop.picker.selectedCount', selectedMedia.length) }}
          </span>
        </UButton>
      </div>
    </ModalFooter>
  </Modal>
</template>

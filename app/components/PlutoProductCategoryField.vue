<script setup lang="ts">
// The `product.category` field widget. Loads `/api/category/list` directly
// in `onMounted`, instead of `useProductCategory()` — that composable is
// `async` (it awaits its own initial fetch at the top level), and a
// top-level await inside a widget resolved dynamically by
// `usePlutoContentFieldWidget` can re-suspend an already-mounted page. See
// the shop-products skill.
const props = defineProps<{
  field: PlutoReferenceField
  modelValue: unknown
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

interface CategoryOption {
  label: string
  value: number
}

const toast = useToast()
const options = ref<CategoryOption[]>([])
const pending = ref(false)
const isOpen = ref(false)

async function loadOptions() {
  pending.value = true

  try {
    const result = await $fetch<{ data: Array<{ id: number, label: string }> }>('/api/category/list')

    options.value = result.data.map((row) => ({ label: row.label, value: row.id }))
  } finally {
    pending.value = false
  }
}

onMounted(loadOptions)

const value = computed(() => props.modelValue as number | undefined)

async function createCategory(name: string) {
  pending.value = true

  try {
    const { data } = await $fetch<{ data: { id: number, label: string } }>('/api/category/new', {
      method: 'POST',
      body: { label: name, slug: slugify(name) },
    })

    await loadOptions()

    emit('update:modelValue', data.id)
    isOpen.value = false

    toast.add({
      title: `${name} created`,
      description: 'Your category has been created successfully.',
      color: 'success',
    })
  } catch (error) {
    console.error(error)

    toast.add({
      title: 'Error',
      description: 'An error occurred while creating the category.',
      color: 'error',
    })
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UFormField :label="field.label" :description="field.description" :required="field.required">
    <UInputMenu
      v-model:open="isOpen"
      :model-value="value"
      :items="options"
      :loading="pending"
      :disabled="disabled"
      value-key="value"
      label-key="label"
      loading-icon="line-md:loading-loop"
      class="w-full"
      placeholder="e.g: Chibi"
      create-item
      @update:model-value="emit('update:modelValue', $event)"
      @create="createCategory"
    />
  </UFormField>
</template>

<script setup lang="ts">
// The `product.availability` field widget. Loads
// `/api/product/availability-statuses` directly in `onMounted`, instead of
// `useProductAvailability()` — same reasoning as `PlutoProductCategoryField.vue`:
// that composable awaits at its own top level, which can re-suspend an
// already-mounted page when resolved dynamically as a widget.
//
// While `bridge.isCustom` is true, every option other than "commission" is
// disabled, and flipping `isCustom` to true forces this field to
// "commission" — preserving the rule `Post.vue` used to enforce with a
// literal id (`2`), resolved here by `slug` instead. This field also
// mirrors the selected option's own `slug` into `bridge.availabilitySlug`,
// which `PlutoProductStockField.vue` reads to decide whether to render at
// all. See the shop-products skill.
const props = defineProps<{
  field: PlutoReferenceField
  modelValue: unknown
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

interface AvailabilityOption {
  label: string
  value: number
  slug: string
}

const bridge = useProductFormBridge()
const options = ref<AvailabilityOption[]>([])
const pending = ref(false)

async function loadOptions() {
  pending.value = true

  try {
    const result = await $fetch<{ data: Array<{ id: number, label: string, slug: string }> }>(
      '/api/product/availability-statuses'
    )

    options.value = result.data.map((row) => ({ label: row.label, value: row.id, slug: row.slug }))
  } finally {
    pending.value = false
  }
}

onMounted(loadOptions)

const value = computed(() => props.modelValue as number | undefined)

const items = computed(() =>
  options.value.map((option) => ({
    ...option,
    disabled: bridge.value.isCustom && option.slug !== 'commission',
  }))
)

// Mirrors the selected option's slug into the bridge, from the first
// render onward (so PlutoProductStockField.vue knows whether to render
// even before the user touches this field).
watch(
  [value, options],
  ([selectedValue, loadedOptions]) => {
    const selected = loadedOptions.find((option) => option.value === selectedValue)
    bridge.value.availabilitySlug = selected?.slug ?? null
  },
  { immediate: true }
)

// Forces "commission" the moment isCustom actually flips true. Not
// `immediate`, on purpose: an already-loaded, already-consistent product
// (edit mode) must not have its real availability overwritten just
// because this widget mounted — only a genuine transition should force it.
watch(
  () => bridge.value.isCustom,
  (isCustom) => {
    if (!isCustom) {
      return
    }

    const commission = options.value.find((option) => option.slug === 'commission')

    if (commission) {
      emit('update:modelValue', commission.value)
    }
  }
)
</script>

<template>
  <UFormField :label="field.label" :description="field.description" :required="field.required">
    <USelect
      :model-value="value"
      :items="items"
      :loading="pending"
      :disabled="disabled"
      value-key="value"
      label-key="label"
      class="w-full"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </UFormField>
</template>

<script setup lang="ts">
// The `product.price` field widget. Copies Post.vue's exact
// `format-options` block. The hardcoded `BRL` currency is a known,
// separate issue — see the shop-products skill — and is not fixed here.
const props = defineProps<{
  field: PlutoNumberField
  modelValue: unknown
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const value = computed(() => {
  const raw = props.modelValue
  return typeof raw === 'number' ? raw : null
})
</script>

<template>
  <UFormField :label="field.label" :description="field.description" :required="field.required">
    <UInputNumber
      :model-value="value"
      :disabled="disabled"
      :format-options="{
        style: 'currency',
        currency: 'BRL',
        currencyDisplay: 'symbol',
        currencySign: 'accounting',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }"
      class="w-full"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </UFormField>
</template>

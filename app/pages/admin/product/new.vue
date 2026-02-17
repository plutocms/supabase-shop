<script setup lang="ts">
const form = ref<FormProduct>({
  name: '',
  description: '',
  price: 0,
  category: null,
  media: [],
  slug: '',
  availability: null,
  is_custom: false,
  stock_quantity: null,
})
</script>

<template>
  <Post v-model="form" />
</template>

<script setup lang="ts">
const route = useRoute('admin-product-edit-id')
</script>

<template>
  <PlutoContentForm :id="route.params.id as string" type="product" />
</template>

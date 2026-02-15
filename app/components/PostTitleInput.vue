<script setup lang="ts">
interface Props {
  placeholder?: string
}

const props = defineProps<Props>()

const model = defineModel<string>()
</script>

<template>
  <div class="grow bg-transparent">
    <input
      v-model="model"
      v-autofocus
      :placeholder="props.placeholder || 'Add title'"
      type="text"
      class="light:text-zinc-600 h-full w-full px-8 pt-8 text-4xl font-bold outline-0 dark:text-white placeholder:text-zinc-500 focus:placeholder:text-zinc-400"
    />
  </div>
</template>

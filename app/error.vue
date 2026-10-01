<script setup lang="ts">
import type { NuxtError } from '#app'

// Nuxt renders this in place of the page for any unhandled error, in the
// browser. It is NOT what produces 404.html: Nuxt 4.5.2 forces that file to
// render without SSR, so the prerendered 404 comes from app/pages/404.vue
// instead. Both render ErrorContent, so the two are indistinguishable to a
// visitor. See ADR-011.
const props = defineProps<{ error: NuxtError }>()

const isNotFound = props.error.statusCode === 404

useSeoMeta({
  title: isNotFound ? 'Page not found' : 'Something went wrong',
})
</script>

<template>
  <NuxtLayout>
    <!-- NuxtError.statusCode is optional, so it has to be given a value here.
         No status code means an error Nuxt could not classify, which is a
         server-side failure as far as the visitor is concerned: 500. -->
    <ErrorContent :status-code="error.statusCode ?? 500" />
  </NuxtLayout>
</template>

<script setup lang="ts">
// This page exists for one reason, and it is a workaround: Nuxt 4.5.2 forces
// /404.html to render without server-side rendering, so app/error.vue cannot
// be prerendered and shipped as an empty shell. An ordinary page route CAN be
// prerendered, and the prerender:generate hook in nuxt.config.ts writes this
// route's output to 404.html instead. See ADR-011.
//
// Consequence worth knowing: /404 is also reachable directly and returns 200
// there, because it is a real route. The robots meta keeps that copy out of
// search results, and US-26 will exclude it from the sitemap.
useSeo({
  title: 'Page not found',
  noindex: true,
})
</script>

<template>
  <ErrorContent :status-code="404" />
</template>

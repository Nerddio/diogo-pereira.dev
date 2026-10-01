<script setup lang="ts">
// Shared by app/error.vue and app/pages/404.vue. Both render identical markup
// on purpose: Nuxt may swap one for the other during hydration on an unknown
// URL, and if the two differed the visitor would see the page change under
// them. See ADR-011 for why two components render the same thing.
const props = defineProps<{ statusCode: number }>()

const isNotFound = computed(() => props.statusCode === 404)
</script>

<template>
  <article>
    <p class="text-muted font-heading text-sm tracking-wide uppercase">
      {{ statusCode }}
    </p>

    <h1 class="font-heading mt-2 text-4xl font-medium tracking-tight sm:text-5xl">
      {{ isNotFound ? 'Page not found' : 'Something went wrong' }}
    </h1>

    <p v-if="isNotFound" class="mt-8 text-lg leading-relaxed">
      That address does not exist on this site. It may have been a typo, or a link that pointed
      somewhere that has since moved.
    </p>
    <p v-else class="mt-8 text-lg leading-relaxed">
      An unexpected error occurred. Trying again often helps; if it does not, the links below will
      get you back to somewhere that works.
    </p>

    <p class="mt-8">
      <NuxtLink class="hover:text-accent text-lg underline underline-offset-4" to="/">
        Back to the home page
      </NuxtLink>
    </p>
  </article>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

// Nuxt renders this in place of the page for any unhandled error. For a
// prerendered site it also produces 404.html, which Cloudflare serves for
// unknown paths via not_found_handling in wrangler.jsonc.
const props = defineProps<{ error: NuxtError }>()

const isNotFound = props.error.statusCode === 404

useSeoMeta({
  title: isNotFound ? 'Page not found' : 'Something went wrong',
})
</script>

<template>
  <NuxtLayout>
    <article>
      <p class="text-muted font-heading text-sm tracking-wide uppercase">
        {{ error.statusCode }}
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
  </NuxtLayout>
</template>

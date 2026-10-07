<script setup lang="ts">
useSeo({
  title: 'Contact',
  description:
    'Get in touch with Diogo Pereira — full-stack engineer in Gouda, Netherlands. Email or LinkedIn.',
})
</script>

<template>
  <article>
    <h1 class="font-heading text-4xl font-medium tracking-tight sm:text-5xl">Contact</h1>

    <p class="mt-8 text-lg leading-relaxed">
      Email is the fastest route. I read everything and reply to anything that is not automated.
    </p>

    <ul class="mt-10 space-y-4">
      <li>
        <a
          class="hover:text-accent font-heading text-lg underline underline-offset-4"
          :href="PROFILES.email"
        >
          {{ EMAIL }}
        </a>
      </li>
      <li>
        <a
          class="hover:text-accent font-heading text-lg underline underline-offset-4"
          :href="PROFILES.linkedin"
        >
          {{ displayUrl(PROFILES.linkedin) }}
        </a>
      </li>
      <li>
        <a
          class="hover:text-accent font-heading text-lg underline underline-offset-4"
          :href="PROFILES.github"
        >
          {{ displayUrl(PROFILES.github) }}
        </a>
      </li>
    </ul>
  </article>
</template>

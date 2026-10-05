<script setup lang="ts">
useSeoMeta({
  title: 'Full-stack engineer',
  description:
    'Diogo Pereira — full-stack engineer based in Gouda, Netherlands. EU work rights, no sponsorship required.',
})
</script>

<template>
  <article>
    <h1 class="font-heading text-4xl font-medium tracking-tight sm:text-5xl">
      Full-stack engineer
    </h1>

    <p class="text-muted mt-4 text-lg">Gouda, Netherlands</p>

    <p class="mt-8 text-lg leading-relaxed">
      I build web applications end to end — most recently a booking platform handling around a
      hundred appointments a month, VAT validation automated against the EU VIES service, and a
      forty-site WooCommerce estate across twelve country markets.
    </p>

    <p class="mt-4 text-lg leading-relaxed">
      EU citizen, resident in the Netherlands. No sponsorship required.
    </p>

    <!-- US-12. Both links sit on this page rather than relying on the footer.
         The acceptance criterion is about the home page, and one satisfied by
         the layout would stop being met the day the layout changed, without
         anything noticing. -->
    <section class="border-rule mt-16 border-t pt-8">
      <h2 class="font-heading text-2xl font-medium tracking-tight">Current focus</h2>

      <p class="mt-4 text-lg leading-relaxed">
        Building this site in the open as the first of two flagship projects — public decision
        records, a pipeline that gates every merge, and a changelog. The second starts once this one
        is tagged.
      </p>

      <p class="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-lg">
        <NuxtLink class="hover:text-accent underline underline-offset-4" to="/projects">
          Read the case study
        </NuxtLink>
        <a
          class="hover:text-accent underline underline-offset-4"
          href="https://github.com/Nerddio"
          target="_blank"
          rel="noopener"
        >
          Code on GitHub
          <span class="sr-only">(opens in a new tab)</span>
        </a>
      </p>
    </section>
  </article>
</template>

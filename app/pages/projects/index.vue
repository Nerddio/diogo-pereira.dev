<script setup lang="ts">
import { projects } from '~/utils/projects'

useSeo({
  title: 'Projects',
  description:
    'Flagship engineering projects by Diogo Pereira, each with a public repository, architecture decision records and a live URL.',
})
</script>

<template>
  <article>
    <h1 class="font-heading text-4xl font-medium tracking-tight sm:text-5xl">Projects</h1>

    <!-- US-19. The single-entry state is stated rather than disguised. A
         "coming soon" card would be a placeholder pretending to be work. -->
    <p class="mt-8 text-lg leading-relaxed">
      One entry, and that is deliberate. A project with a public repository, dated decision records,
      a pipeline that gates every merge and a live URL is worth more than several write-ups nobody
      can check. The second flagship is in progress and will appear here when it is real.
    </p>

    <ul class="mt-12 space-y-12">
      <li v-for="project in projects" :key="project.slug">
        <article>
          <h2 class="font-heading text-2xl font-medium tracking-tight">
            <NuxtLink
              class="hover:text-accent underline underline-offset-4"
              :to="`/projects/${project.slug}`"
            >
              {{ project.title }}
            </NuxtLink>
          </h2>

          <p class="mt-3 leading-relaxed">{{ project.summary }}</p>

          <!-- A list, because it is one: assistive technology announces the
               count, which a row of styled spans would not. -->
          <ul class="text-muted mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm">
            <li
              v-for="item in project.stack"
              :key="item"
              class="after:ml-3 after:content-['·'] last:after:content-['']"
            >
              {{ item }}
            </li>
          </ul>

          <p class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <NuxtLink
              class="hover:text-accent underline underline-offset-4"
              :to="`/projects/${project.slug}`"
            >
              Read the case study
            </NuxtLink>
            <a
              class="hover:text-accent underline underline-offset-4"
              :href="project.repository"
              target="_blank"
              rel="noopener"
            >
              Repository
              <span class="sr-only">(opens in a new tab)</span>
            </a>
            <a
              v-if="project.liveUrl"
              class="hover:text-accent underline underline-offset-4"
              :href="project.liveUrl"
              target="_blank"
              rel="noopener"
            >
              Live site
              <span class="sr-only">(opens in a new tab)</span>
            </a>
          </p>
        </article>
      </li>
    </ul>
  </article>
</template>

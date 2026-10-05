<script setup lang="ts">
import { projects } from '~/utils/projects'

const route = useRoute()
const slug = String(route.params.slug)

const project = projects.find((p) => p.slug === slug)

// A slug with no file is a genuine 404 rather than an empty page. During
// prerendering this aborts the route, and `failOnError` turns that into a
// failed build, so a broken link in the index cannot ship.
if (!project) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
}

// The rendered bodies are kept out of the index's chunk, so this page fetches
// the one it needs. Eager because there is nothing to defer on a prerendered
// route: the HTML is resolved before the visitor arrives.
const bodies = import.meta.glob<string>('../../../content/projects/*.md', {
  eager: true,
  import: 'html',
})
const html = bodies[`../../../content/projects/${slug}.md`] ?? ''

useSeoMeta({
  title: project.title,
  description: project.summary,
})
</script>

<template>
  <article>
    <p class="text-muted font-heading text-sm tracking-wide uppercase">
      <NuxtLink class="hover:text-accent underline underline-offset-4" to="/projects">
        Projects
      </NuxtLink>
    </p>

    <h1 class="font-heading mt-2 text-4xl font-medium tracking-tight sm:text-5xl">
      {{ project.title }}
    </h1>

    <p class="mt-4 text-lg leading-relaxed">{{ project.summary }}</p>

    <ul class="text-muted mt-6 flex flex-wrap gap-x-3 gap-y-1 text-sm">
      <li
        v-for="item in project.stack"
        :key="item"
        class="after:ml-3 after:content-['·'] last:after:content-['']"
      >
        {{ item }}
      </li>
    </ul>

    <p class="mt-6 flex flex-wrap gap-x-6 gap-y-2">
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

    <!-- v-html renders markup produced by our own build from a file in this
         repository. markdown-it runs with html: false, so raw HTML inside the
         markdown is escaped rather than passed through: there is no path from
         file content to executable markup. If content ever came from anywhere
         but this repository, that reasoning stops holding and the output would
         need sanitising. -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="prose-body mt-12" v-html="html" />
  </article>
</template>

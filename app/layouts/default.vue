<template>
  <div class="mx-auto flex min-h-screen max-w-2xl flex-col px-6">
    <!-- US-23. First focusable element on every page, visually hidden until it
         receives focus, so a keyboard user can jump past the header instead of
         tabbing through it on every navigation. -->
    <a
      href="#main"
      class="focus:bg-accent focus:text-paper sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:px-4 focus:py-2"
    >
      Skip to content
    </a>

    <header class="py-10">
      <NuxtLink to="/" class="font-heading text-lg font-medium tracking-tight">
        Diogo Pereira
      </NuxtLink>
    </header>

    <!-- The main landmark. Its absence was one of the three accessibility
         failures in the 19 September baseline. -->
    <main id="main" class="flex-1">
      <slot />
    </main>

    <!-- border-rule, not border-border: this is a decorative divider, which
         WCAG 1.4.11 exempts. A control would need the darker token. -->
    <footer class="text-muted border-rule mt-16 border-t py-8 text-sm">
      <ul class="flex flex-wrap gap-x-6 gap-y-2">
        <li>
          <a
            class="hover:text-accent underline underline-offset-4"
            href="mailto:diogo.work.pereira@gmail.com"
          >
            Email
          </a>
        </li>
        <li>
          <a
            class="hover:text-accent underline underline-offset-4"
            href="https://github.com/Nerddio"
          >
            GitHub
          </a>
        </li>
        <li>
          <a
            class="hover:text-accent underline underline-offset-4"
            href="https://www.linkedin.com/in/diogo-marques-pereira/"
          >
            LinkedIn
          </a>
        </li>
      </ul>
    </footer>
  </div>
</template>

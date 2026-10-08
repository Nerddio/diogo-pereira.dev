<script setup lang="ts">
useSeo({
  title: 'Privacy',
  description:
    'What diogo-pereira.dev collects, what it does not, and how to check: no cookies, nothing stored in your browser, one cookieless analytics beacon.',
})
</script>

<template>
  <article>
    <h1 class="font-heading text-4xl font-medium tracking-tight sm:text-5xl">Privacy</h1>

    <p class="mt-8 text-lg leading-relaxed">
      This site has no accounts, no forms, no database and no server. There is almost nothing it
      could collect about you.
    </p>

    <h2 class="font-heading mt-16 text-2xl font-medium tracking-tight">
      Nothing is stored in your browser
    </h2>
    <p class="mt-4 text-lg leading-relaxed">
      No cookies, and nothing written to local storage, session storage or IndexedDB.
    </p>

    <h2 class="font-heading mt-12 text-2xl font-medium tracking-tight">One third party</h2>
    <p class="mt-4 text-lg leading-relaxed">
      Cloudflare Web Analytics counts page views. The script is loaded from
      <code>static.cloudflareinsights.com</code> and the measurements are sent to
      <code>cloudflareinsights.com</code>. It sets no cookie and stores nothing on your device. It
      records which page was viewed, which site you arrived from, your country, and the kind of
      browser, operating system and device you used. It does not identify you and it cannot follow
      you to other sites.
    </p>

    <h2 class="font-heading mt-12 text-2xl font-medium tracking-tight">Your IP address</h2>
    <p class="mt-4 text-lg leading-relaxed">
      Your IP address reaches Cloudflare's servers, because that is how they know where to send the
      page. Every web server works this way.
    </p>

    <h2 class="font-heading mt-12 text-2xl font-medium tracking-tight">If you email me</h2>
    <p class="mt-4 text-lg leading-relaxed">
      I have your address and whatever you wrote, in my mailbox. Nothing else happens to it.
    </p>

    <h2 class="font-heading mt-12 text-2xl font-medium tracking-tight">
      Why there is no cookie banner
    </h2>
    <p class="mt-4 text-lg leading-relaxed">
      The rule people mean by "cookie law" is about storing or reading information on your device.
      Nothing here does — which is also why a banner would be asking permission for something that
      is not happening.
    </p>

    <h2 class="font-heading mt-12 text-2xl font-medium tracking-tight">
      You do not have to take my word for it
    </h2>
    <p class="mt-4 text-lg leading-relaxed">
      This site is
      <a
        class="hover:text-accent underline underline-offset-4"
        :href="REPOSITORY"
        target="_blank"
        rel="noopener"
      >
        open source
        <span class="sr-only">(opens in a new tab)</span></a
      >, and the claims above are asserted by automated tests that run on every change: no cookie is
      set, nothing is written to browser storage, and no request goes to any host other than this
      one and the two named above. If any of that stopped being true, the build would fail before
      the change reached you.
    </p>
  </article>
</template>

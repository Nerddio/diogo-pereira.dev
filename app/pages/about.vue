<script setup lang="ts">
usePersonSchema()

useSeo({
  title: 'About',
  description:
    'Diogo Pereira — full-stack engineer. Three years building production web applications end to end at Foldaco International: booking platform, EU VAT automation, forty-plus WooCommerce sites, Power BI reporting.',
})
</script>

<template>
  <article>
    <!-- US-17. width and height carry the intrinsic size so the browser can
         reserve the right space from the first layout pass; the displayed size
         comes from the utility classes. Without them the text below jumps when
         the image arrives, which is the cumulative layout shift ADR-014 spent a
         ticket removing. No lazy loading: this is above the fold, and deferring
         it would delay the largest paint rather than save anything. -->
    <img
      src="/portrait.webp"
      alt="Diogo Pereira"
      width="400"
      height="378"
      decoding="async"
      class="mb-10 block h-auto w-40 sm:w-48"
    />

    <h1 class="font-heading text-4xl font-medium tracking-tight sm:text-5xl">About</h1>

    <p class="mt-8 text-lg leading-relaxed">
      I build production web applications end to end — database schema through REST API to a Vue
      front end. Nearly three years of it, most recently at Foldaco International, where the work
      ran from checkout logic on forty-odd e-commerce sites to the reporting the leadership team
      used to run the business.
    </p>

    <p class="mt-4 text-lg leading-relaxed">
      Right now I am building this site in the open — public decision records, a pipeline that gates
      every merge, and a changelog — as the first of two flagship projects. The second starts once
      this one is tagged.
    </p>

    <h2 class="font-heading mt-16 text-2xl font-medium tracking-tight">Experience</h2>

    <section class="mt-8">
      <h3 class="font-heading text-xl font-medium">Full Stack Engineer</h3>
      <p class="text-muted mt-1">
        Foldaco International B.V., Bergschenhoek, Netherlands · November 2023 – June 2026
      </p>

      <ul class="mt-6 space-y-5">
        <li class="leading-relaxed">
          <strong class="font-heading font-medium">Full-stack development.</strong> Built and
          maintained web applications with Express.js, Vue.js, PHP and REST APIs, including a
          booking platform handling around a hundred appointments a month that replaced manual email
          and phone scheduling — with its own API, WordPress integration and Outlook calendar
          automation. Designed the database schema and modelled it for downstream analytics in
          BigQuery and Looker Studio.
        </li>
        <li class="leading-relaxed">
          <strong class="font-heading font-medium">E-commerce engineering.</strong> Managed 40+
          WordPress and WooCommerce sites generating multi-million-euro sales, building custom
          plugins with JavaScript, PHP and AJAX. Developed dynamic transport pricing by country and
          region, and checkout integration validating business VAT numbers against the EU VIES API
          for correct reverse-charge treatment on intra-community supply — saving roughly an hour of
          manual administration per qualifying order and preventing downstream credit notes.
        </li>
        <li class="leading-relaxed">
          <strong class="font-heading font-medium">ERP integration and administration.</strong>
          Worked in Exact Online across the full sales cycle — customers, quotes, orders, invoices
          and purchase orders — and administered the environment for four divisions with dozens of
          sales channels and their document layouts. Integrated its data into reporting through both
          the REST API and the Power BI connector.
        </li>
        <li class="leading-relaxed">
          <strong class="font-heading font-medium">Identity and integrations.</strong> Implemented
          Microsoft Entra ID authentication and Azure app registrations for internal applications
          and third-party API integrations; administered Microsoft 365 for around fifty users.
        </li>
        <li class="leading-relaxed">
          <strong class="font-heading font-medium">Business intelligence.</strong> Translated
          reporting requirements from leadership, sales and marketing into Power BI semantic models,
          DAX measures and Power Query transformations for 50+ users — including a multi-entity
          revenue report consolidating four legal entities and twelve-plus country markets that
          replaced a recurring manual Excel consolidation.
        </li>
      </ul>
    </section>

    <h2 class="font-heading mt-16 text-2xl font-medium tracking-tight">Education</h2>

    <section class="mt-6 space-y-4">
      <div>
        <h3 class="font-heading text-lg font-medium">BSc Computer Science</h3>
        <p class="text-muted mt-1">
          Instituto Politécnico de Leiria, Portugal · September 2019 – July 2023
        </p>
      </div>
      <div>
        <h3 class="font-heading text-lg font-medium">Claude Code in Action</h3>
        <p class="text-muted mt-1">Anthropic · June 2026</p>
      </div>
    </section>

    <h2 class="font-heading mt-16 text-2xl font-medium tracking-tight">Languages</h2>

    <!-- A description list, because each row is a term and its value rather
         than a flat list of items. Assistive technology announces the pairing. -->
    <dl class="mt-6 space-y-2">
      <div class="flex gap-3">
        <dt class="font-heading w-28 font-medium">Portuguese</dt>
        <dd class="text-muted">Native</dd>
      </div>
      <div class="flex gap-3">
        <dt class="font-heading w-28 font-medium">English</dt>
        <dd class="text-muted">C2</dd>
      </div>
      <div class="flex gap-3">
        <dt class="font-heading w-28 font-medium">French</dt>
        <dd class="text-muted">B2</dd>
      </div>
      <div class="flex gap-3">
        <dt class="font-heading w-28 font-medium">Spanish</dt>
        <dd class="text-muted">B2</dd>
      </div>
      <div class="flex gap-3">
        <dt class="font-heading w-28 font-medium">Dutch</dt>
        <dd class="text-muted">B1</dd>
      </div>
    </dl>

    <h2 class="font-heading mt-16 text-2xl font-medium tracking-tight">Work rights</h2>

    <p class="mt-6 text-lg leading-relaxed">
      EU citizen, resident in the Netherlands. No sponsorship required.
    </p>
  </article>
</template>

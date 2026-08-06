<script setup lang="ts">
const localePath = useLocalePath()
const { items, hydrate } = useRecentlyViewed()

onMounted(() => {
  hydrate()
})

function productTo(url: string) {
  if (/^https?:\/\//.test(url))
    return url

  return localePath(url)
}
</script>

<template>
  <section
    class="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-10 sm:px-8"
    aria-labelledby="recently-viewed-heading"
  >
    <h2
      id="recently-viewed-heading"
      class="mb-8 text-[14px] font-semibold uppercase tracking-[0.12em] text-black"
    >
      {{ $t('recentlyViewed.title') }}
    </h2>

    <div
      v-if="items.length"
      class="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4"
    >
      <article
        v-for="product in items"
        :key="product.slug"
        class="text-center"
      >
        <NuxtLink
          :to="productTo(product.url)"
          class="group block text-black no-underline"
        >
          <div class="relative mx-auto aspect-[2/3] w-full max-w-[280px] overflow-hidden bg-[#f7f7f7]">
            <img
              :src="product.image"
              :alt="product.name"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              width="280"
              height="420"
            >
          </div>
          <h3 class="mt-3 text-[13px] font-semibold leading-[1.3]">
            {{ product.name }}
          </h3>
          <p
            v-if="product.brand"
            class="mt-0.5 text-[12px] uppercase leading-[1.3] text-[#555]"
          >
            {{ product.brand }}
          </p>
          <p
            v-if="product.price"
            class="mt-1 text-[13px] font-semibold leading-[1.3]"
          >
            {{ product.price }}
          </p>
        </NuxtLink>
      </article>
    </div>
  </section>
</template>

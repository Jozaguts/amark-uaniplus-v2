<script setup lang="ts">
import { useSearch } from '~/composables/useSearch'

const props = withDefaults(defineProps<{
  fullWidth?: boolean
}>(), {
  fullWidth: false,
})

const localePath = useLocalePath()
const route = useRoute()
const { query, results, pending, clear } = useSearch()

const containerRef = ref<HTMLElement | null>(null)
const showDropdown = computed(() => query.value.length >= 2)
const isEmpty = computed(() => !pending.value && results.value.length === 0 && query.value.length >= 2)

onClickOutside(containerRef, () => {
  clear()
})

watch(route, () => {
  clear()
})

function resultPath(result: { type: string, slug?: string, path?: string }): string {
  if (result.type === 'product' && result.slug) {
    return localePath('/products/' + result.slug)
  }
  if (result.type === 'category' && result.path) {
    return localePath('/' + result.path)
  }
  return localePath('/')
}

function handleResultClick() {
  clear()
}

function handleViewAll() {
  navigateTo(localePath('/search?q=' + encodeURIComponent(query.value)))
  clear()
}
</script>

<template>
  <div
    ref="containerRef"
    class="relative"
  >
    <!-- Input — Revolve underline style -->
    <div class="flex items-center gap-2 border-b border-[#d0d0d0] pb-1">
      <input
        v-model="query"
        type="search"
        :placeholder="$t('search.placeholder')"
        class="w-full min-w-[130px] bg-transparent text-[13px] font-normal text-[#222] outline-none placeholder:font-normal placeholder:text-[#aaa]"
        @keydown.escape="clear()"
      />
      <Icon
        name="ph:magnifying-glass"
        class="size-[15px] shrink-0 text-[#555]"
      />
    </div>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="showDropdown"
        class="absolute top-[calc(100%+8px)] z-[90] overflow-hidden border border-[#e8e8e8] bg-white shadow-[0_18px_40px_rgba(17,19,20,0.12)]"
        :class="fullWidth ? 'left-0 right-0' : 'right-0 w-[360px]'"
      >
        <!-- Loading skeleton -->
        <template v-if="pending">
          <div
            v-for="i in 3"
            :key="i"
            class="flex items-center gap-3 border-b border-[#f0f0f0] px-4 py-3"
          >
            <div class="h-8 w-8 shrink-0 rounded bg-[#f0f0f0]" />
            <div class="flex-1 space-y-1.5">
              <div class="h-3 w-2/3 rounded bg-[#f0f0f0]" />
              <div class="h-3 w-1/3 rounded bg-[#f0f0f0]" />
            </div>
          </div>
        </template>

        <!-- Results -->
        <template v-else-if="results.length > 0">
          <NuxtLink
            v-for="result in results"
            :key="`${result.type}-${result.slug ?? result.path}`"
            :to="resultPath(result)"
            class="flex items-center gap-3 border-b border-[#f0f0f0] px-4 py-3 transition-colors hover:bg-[#f9f9f9]"
            @click="handleResultClick"
          >
            <!-- Product row -->
            <template v-if="result.type === 'product'">
              <img
                v-if="result.image"
                :src="result.image"
                :alt="result.name"
                class="h-8 w-8 shrink-0 rounded object-cover"
              />
              <div
                v-else
                class="h-8 w-8 shrink-0 rounded bg-[#f0f0f0]"
              />
              <span class="flex-1 truncate text-[13px] text-[#222]">{{ result.name }}</span>
              <span
                v-if="result.price"
                class="shrink-0 text-[13px] font-semibold text-[#222]"
              >{{ result.price }}</span>
            </template>

            <!-- Category row -->
            <template v-else>
              <div class="flex h-8 w-8 shrink-0 items-center justify-center">
                <Icon
                  name="ph:folder"
                  class="size-5 text-[#888]"
                />
              </div>
              <span class="flex-1 truncate text-[13px] text-[#555]">{{ result.name }}</span>
              <Icon
                name="ph:caret-right"
                class="size-3.5 shrink-0 text-[#bbb]"
              />
            </template>
          </NuxtLink>

          <!-- View all -->
          <button
            type="button"
            class="flex w-full items-center justify-center gap-2 px-4 py-3 text-[13px] font-semibold text-[#222] transition-colors hover:bg-[#f9f9f9]"
            @click="handleViewAll"
          >
            {{ $t('search.viewAll') }}
            <Icon
              name="ph:arrow-right"
              class="size-4"
            />
          </button>
        </template>

        <!-- Empty state -->
        <template v-else-if="isEmpty">
          <div class="px-4 py-6 text-center text-[13px] text-[#888]">
            {{ $t('search.empty', { q: query }) }}
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

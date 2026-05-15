<script setup lang="ts">
import type {
  CatalogNavigationColumn,
  CatalogNavigationMenuLink,
  CatalogNavigationPromotion,
} from '~/types/catalog-navigation'

const props = defineProps<{
  columns: CatalogNavigationColumn[]
  images?: CatalogNavigationPromotion[]
}>()

const localePath = useLocalePath()

const textSpanClass = computed(() => {
  if (props.columns.length === 4)
    return 'lg:col-span-9'

  return 'lg:col-span-6'
})

const imageSpanClass = computed(() => {
  if (props.columns.length === 4)
    return 'lg:col-span-3'

  return 'lg:col-span-6'
})

function columnSpanClass(column: CatalogNavigationColumn): string {
  if (props.columns.length === 2 && column.groups)
    return 'lg:col-span-8'

  if (props.columns.length === 2)
    return 'lg:col-span-4'

  if (props.columns.length === 4)
    return 'lg:col-span-3'

  return 'lg:col-span-4'
}

function linkTarget(url: string): string {
  if (/^https?:\/\//.test(url))
    return url

  return localePath(url)
}

function imageLinkTarget(url?: string | null): string | null {
  if (!url)
    return null

  return linkTarget(url)
}

function linkKey(item: CatalogNavigationMenuLink): string {
  return String(item.id ?? item.path ?? item.url)
}

function hasChildren(item: CatalogNavigationMenuLink): boolean {
  return Boolean(item.children?.length)
}
</script>

<template>
  <div class="fixed flex justify-center items-center inset-x-0 top-26 border-b border-[#f4f4f4] bg-white text-left normal-case tracking-normal">
    <div class="mx-72 overflow-x-auto scrollbar-thin h-100">
      <div class="grid grid-cols-12 gap-4 h-full">
        <div
          class="col-span-12"
          :class="textSpanClass"
        >
          <div class="grid grid-cols-12 gap-4 h-full">
            <section
              v-for="column in columns"
              :key="column.title"
              class="col-span-12 min-w-0"
              :class="columnSpanClass(column)"
            >
              <h3 class="mb-1.5 border-b border-[#e4e4e4] pb-2 text-[14px] font-semibold uppercase leading-none tracking-[0.083em] text-black">
                {{ column.title }}
              </h3>

              <div
                v-if="column.groups"
                class="columns-2 gap-[16px]"
              >
                <ul
                  v-for="(group, groupIndex) in column.groups"
                  :key="`${column.title}-${groupIndex}`"
                  class="mb-0 break-inside-avoid space-y-0"
                >
                  <li
                    v-for="item in group"
                    :key="linkKey(item)"
                    class=""
                  >
                    <span
                      v-if="hasChildren(item)"
                      class="text-[14px] font-normal  text-[#6e6e6e]"
                      :class="item.italic && 'italic'"
                    >
                      {{ item.label }}
                      <span
                        v-if="item.badge"
                        class="ml-[5px] inline-flex rounded-full bg-[#e5e5e5] px-[6px] py-[1px] align-middle text-[6px] font-bold not-italic leading-none text-black"
                      >
                        {{ item.badge }}
                      </span>
                    </span>

                    <NuxtLink
                      v-else
                      :to="linkTarget(item.url)"
                      class="text-[14px] font-normal  text-[#6e6e6e]"
                      :class="item.italic && 'italic'"
                    >
                      {{ item.label }}
                      <span
                        v-if="item.badge"
                        class="ml-[5px] inline-flex rounded-full bg-[#e5e5e5] px-[6px] py-[1px] align-middle text-[6px] font-bold not-italic leading-none text-black"
                      >
                        {{ item.badge }}
                      </span>
                    </NuxtLink>

                    <ul
                      v-if="item.children?.length"
                      class="ml-[10px] mt-[2px] space-y-0"
                    >
                      <li
                        v-for="child in item.children"
                        :key="linkKey(child)"
                        class=""
                      >
                        <NuxtLink
                          :to="linkTarget(child.url)"
                          class="text-[13px] font-normal  text-[#8a8a8a]"
                        >
                          {{ child.label }}
                        </NuxtLink>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>

              <ul
                v-else
                class="mb-0 space-y-0"
              >
                <li
                  v-for="item in column.items"
                  :key="linkKey(item)"
                  class=""
                >
                  <span
                    v-if="hasChildren(item)"
                    class="text-[14px] font-normal  text-[#6e6e6e]"
                    :class="item.italic && 'italic'"
                  >
                    {{ item.label }}
                    <span
                      v-if="item.badge"
                      class="ml-[5px] inline-flex rounded-full bg-[#e5e5e5] px-[6px] py-[1px] align-middle text-[6px] font-bold not-italic leading-none text-black"
                    >
                      {{ item.badge }}
                    </span>
                  </span>

                  <NuxtLink
                    v-else
                    :to="linkTarget(item.url)"
                    class="text-[14px] font-normal  text-[#6e6e6e]  hover:underline "
                    :class="item.italic && 'italic'"
                  >
                    {{ item.label }}
                    <span
                      v-if="item.badge"
                      class="ml-[5px] inline-flex rounded-full bg-[#e5e5e5] px-[6px] py-[1px] align-middle text-[6px] font-bold not-italic leading-none text-black"
                    >
                      {{ item.badge }}
                    </span>
                  </NuxtLink>

                  <ul
                    v-if="item.children?.length"
                    class="ml-[10px] mt-[2px] space-y-0"
                  >
                    <li
                      v-for="child in item.children"
                      :key="linkKey(child)"
                      class=""
                    >
                      <NuxtLink
                        :to="linkTarget(child.url)"
                        class="text-[13px] font-normal  text-[#8a8a8a]"
                      >
                        {{ child.label }}
                      </NuxtLink>
                    </li>
                  </ul>
                </li>
              </ul>
            </section>
          </div>
        </div>

        <div
          v-if="images?.length"
          class="col-span-12"
          :class="imageSpanClass"
        >
          <div
            class="grid gap-[16px] grid-cols-3"
          >
            <component
              :is="imageLinkTarget(image.url) ? 'NuxtLink' : 'div'"
              v-for="image in images"
              :key="image.src"
              :to="imageLinkTarget(image.url) || undefined"
              class="block whitespace-normal leading-normal"
            >
              <img
                :src="image.src"
                :alt="image.alt"
                class="relative z-[1] aspect-[322/428] w-full object-cover"
              >
              <span class="mt-[8px] block text-[14px] font-semibold leading-[18px] tracking-[0.021em] text-black">
                {{ image.title }}
              </span>
              <span
                v-if="image.description"
                class="mt-[2px] block text-[14px] font-normal leading-[22px] text-[#6e6e6e]"
              >
                {{ image.description }}
              </span>
            </component>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  CatalogNavigationColumn,
  CatalogNavigationMenuLink,
} from '~/types/catalog-navigation'

const props = defineProps<{
  columns: CatalogNavigationColumn[]
}>()

const localePath = useLocalePath()

function itemChunks(items: CatalogNavigationMenuLink[] | undefined): CatalogNavigationMenuLink[][] {
  if (!items?.length) return []
  if (items.length <= 12) return [items]
  return [items.slice(0, 12), items.slice(12, 20)]
}

function columnNeedsSplit(col: CatalogNavigationColumn): boolean {
  return (col.items?.length ?? 0) > 12
}

function columnSpanClass(column: CatalogNavigationColumn): string {
  const isSplit = columnNeedsSplit(column)
  const splitCount = props.columns.filter(columnNeedsSplit).length
  const n = props.columns.length

  if (splitCount === 0) {
    if (n === 4) return 'lg:col-span-3'
    if (n === 2) return 'lg:col-span-4'
    return 'lg:col-span-4'
  }

  // Una columna "split" toma el doble del ancho de una normal.
  // n=2: split=8 regular=4  → 8+4=12 ✓
  // n=3: split=6 regular=3  → 6+3+3=12 ✓
  // n=4: split=6 regular=2  → 6+2+2+2=12 ✓
  if (n === 2) return isSplit ? 'lg:col-span-8' : 'lg:col-span-4'
  if (n === 3) return isSplit ? 'lg:col-span-6' : 'lg:col-span-3'
  if (n === 4) return isSplit ? 'lg:col-span-6' : 'lg:col-span-2'
  return isSplit ? 'lg:col-span-6' : 'lg:col-span-3'
}

function linkTarget(url: string): string {
  if (/^https?:\/\//.test(url))
    return url

  return localePath(url)
}

function linkKey(item: CatalogNavigationMenuLink): string {
  return String(item.id ?? item.path ?? item.url)
}

function hasChildren(item: CatalogNavigationMenuLink): boolean {
  return Boolean(item.children?.length)
}
</script>

<template>
  <div
      class="fixed inset-x-0 top-[63px] flex items-center justify-center border-b border-[#f4f4f4] bg-white pt-4 text-left normal-case tracking-normal">
    <div class="mx-72 overflow-x-auto scrollbar-thin h-100">
      <div class="grid grid-cols-12 gap-4 h-full min-w-330">
        <div class="col-span-12">
          <div class="grid grid-cols-12 gap-4 h-full">
            <section
              v-for="column in columns"
              :key="column.title"
              class="col-span-12 min-w-0"
              :class="columnSpanClass(column)"
            >
              <NuxtLink
                v-if="column.isClickable && column.url"
                :to="linkTarget(column.url)"
                class="mb-1.5 block border-b border-[#e4e4e4] pb-2 text-[14px] font-semibold uppercase leading-none tracking-[0.083em] text-black"
              >
                {{ column.title }}
              </NuxtLink>
              <h3
                v-else
                class="mb-1.5 border-b border-[#e4e4e4] pb-2 text-[14px] font-semibold uppercase leading-none tracking-[0.083em] text-black"
              >
                {{ column.title }}
              </h3>

              <!-- items: se parte en 2 sub-columnas automáticamente si hay más de 12 -->
              <div
                :class="itemChunks(column.items).length > 1 ? 'grid grid-cols-2 gap-x-4' : ''"
              >
                <ul
                  v-for="(chunk, chunkIdx) in itemChunks(column.items)"
                  :key="chunkIdx"
                  class="mb-0 space-y-0"
                >
                  <li
                    v-for="item in chunk"
                    :key="linkKey(item)"
                  >
                    <NuxtLink
                      v-if="item.isClickable"
                      :to="linkTarget(item.url)"
                      class="text-[14px] font-normal text-[#6e6e6e] hover:underline"
                    >
                      {{ item.label }}
                    </NuxtLink>
                    <span
                      v-else
                      class="text-[14px] font-normal text-[#6e6e6e]"
                    >
                      {{ item.label }}
                    </span>

                    <ul
                      v-if="hasChildren(item)"
                      class="ml-[10px] mt-[2px] space-y-0"
                    >
                      <li
                        v-for="child in item.children"
                        :key="linkKey(child)"
                      >
                        <NuxtLink
                          v-if="child.isClickable"
                          :to="linkTarget(child.url)"
                          class="text-[13px] font-normal text-[#8a8a8a]"
                        >
                          {{ child.label }}
                        </NuxtLink>
                        <span
                          v-else
                          class="text-[13px] font-normal text-[#8a8a8a]"
                        >
                          {{ child.label }}
                        </span>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

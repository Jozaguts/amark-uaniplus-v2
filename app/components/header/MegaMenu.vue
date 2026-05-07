<script setup lang="ts">
type MegaMenuLink = {
  labelKey: string
  badgeKey?: string
  italic?: boolean
}

type MegaMenuColumn = {
  titleKey: string
  items?: MegaMenuLink[]
  groups?: MegaMenuLink[][]
}

type MegaMenuImage = {
  titleKey: string
  descKey?: string
  altKey: string
  src: string
}

const props = defineProps<{
  columns: MegaMenuColumn[]
  images?: MegaMenuImage[]
}>()

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

function columnSpanClass(column: MegaMenuColumn): string {
  if (props.columns.length === 2 && column.groups)
    return 'lg:col-span-8'

  if (props.columns.length === 2)
    return 'lg:col-span-4'

  if (props.columns.length === 4)
    return 'lg:col-span-3'

  return 'lg:col-span-4'
}
</script>

<template>
  <div class="fixed inset-x-0 top-26 border-b border-[#f4f4f4] bg-white text-left normal-case tracking-normal">
    <div class="container mx-auto  px-8 pb-4 pt-5.5">
      <div class="grid grid-cols-12 gap-4">
        <div
          class="col-span-12"
          :class="textSpanClass"
        >
          <div class="grid grid-cols-12 gap-4">
            <section
              v-for="column in columns"
              :key="column.titleKey"
              class="col-span-12 min-w-0"
              :class="columnSpanClass(column)"
            >
              <h3 class="mb-1.5 border-b border-[#e4e4e4] pb-2 text-[14px] font-semibold uppercase leading-none tracking-[0.083em] text-black">
                {{ $t(column.titleKey) }}
              </h3>

              <div
                v-if="column.groups"
                class="columns-2 gap-[16px]"
              >
                <ul
                  v-for="(group, groupIndex) in column.groups"
                  :key="`${column.titleKey}-${groupIndex}`"
                  class="mb-0 break-inside-avoid space-y-0"
                >
                  <li
                    v-for="item in group"
                    :key="item.labelKey"
                    class="leading-[1.285714]"
                  >
                    <a
                      href="#"
                      class="text-[14px] font-normal leading-[1.285714] text-[#6e6e6e]"
                      :class="item.italic && 'italic'"
                    >
                      {{ $t(item.labelKey) }}
                      <span
                        v-if="item.badgeKey"
                        class="ml-[5px] inline-flex rounded-full bg-[#e5e5e5] px-[6px] py-[1px] align-middle text-[6px] font-bold not-italic leading-none text-black"
                      >
                        {{ $t(item.badgeKey) }}
                      </span>
                    </a>
                  </li>
                </ul>
              </div>

              <ul
                v-else
                class="mb-0 space-y-0"
              >
                <li
                  v-for="item in column.items"
                  :key="item.labelKey"
                  class="leading-[1.285714]"
                >
                  <a
                    href="#"
                    class="text-[14px] font-normal leading-[1.285714] text-[#6e6e6e]"
                    :class="item.italic && 'italic'"
                  >
                    {{ $t(item.labelKey) }}
                    <span
                      v-if="item.badgeKey"
                      class="ml-[5px] inline-flex rounded-full bg-[#e5e5e5] px-[6px] py-[1px] align-middle text-[6px] font-bold not-italic leading-none text-black"
                    >
                      {{ $t(item.badgeKey) }}
                    </span>
                  </a>
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
            class="grid gap-[16px]"
            :class="images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'"
          >
            <a
              v-for="image in images"
              :key="image.src"
              href="#"
              class="block whitespace-normal leading-normal"
            >
              <img
                :src="image.src"
                :alt="$t(image.altKey)"
                class="relative z-[1] aspect-[322/428] w-full object-cover"
              >
              <span class="mt-[8px] block text-[14px] font-semibold leading-[18px] tracking-[0.021em] text-black">
                {{ $t(image.titleKey) }}
              </span>
              <span
                v-if="image.descKey"
                class="mt-[2px] block text-[14px] font-normal leading-[22px] text-[#6e6e6e]"
              >
                {{ $t(image.descKey) }}
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

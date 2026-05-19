<script setup lang="ts">
withDefaults(
  defineProps<{
    rows?: number
  }>(),
  {
    rows: 5,
  },
)
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between border-b border-[#e7e7e7] pb-5">
      <div class="flex gap-20">
        <ElSkeletonItem variant="text" class="!h-4 !w-16 !rounded-full" />
        <ElSkeletonItem variant="text" class="!h-4 !w-16 !rounded-full" />
      </div>
      <ElSkeletonItem variant="text" class="!h-4 !w-16 !rounded-full" />
    </div>

    <ElSkeleton animated :count="rows">
      <template #template>
        <div class="border-b border-[#e7e7e7] py-5">
          <div class="grid grid-cols-[72px_minmax(0,1.6fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_72px] items-center gap-4">
            <ElSkeletonItem variant="image" class="!h-[94px] !w-[72px] !rounded-md" />

            <div class="space-y-4">
              <ElSkeletonItem variant="h3" class="!h-4 !w-[200px] !rounded-full" />
              <ElSkeletonItem variant="text" class="!h-4 !w-[100px] !rounded-full" />
              <ElSkeletonItem variant="text" class="!h-4 !w-[200px] !rounded-full" />
              <ElSkeletonItem variant="text" class="!h-4 !w-[100px] !rounded-full" />
            </div>

            <div class="space-y-4">
              <ElSkeletonItem variant="text" class="!h-4 !w-[120px] !rounded-full" />
              <ElSkeletonItem variant="text" class="!h-4 !w-[90px] !rounded-full" />
            </div>

            <div class="space-y-4">
              <ElSkeletonItem variant="text" class="!h-4 !w-[120px] !rounded-full" />
              <ElSkeletonItem variant="text" class="!h-4 !w-[90px] !rounded-full" />
            </div>

            <div class="flex justify-end gap-4">
              <ElSkeletonItem variant="text" class="!h-4 !w-9 !rounded-full" />
              <ElSkeletonItem variant="text" class="!h-4 !w-9 !rounded-full" />
            </div>
          </div>
        </div>
      </template>
    </ElSkeleton>
  </div>
</template>

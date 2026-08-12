<script setup lang="ts">
import type { DesignDraftListItem } from '~~/types/design-draft'
import type { StorefrontFetchError } from '~~/types/storefront'

const props = withDefaults(defineProps<{
  currentDesignId?: string | null
  refreshKey?: number
}>(), {
  currentDesignId: null,
  refreshKey: 0,
})

const emit = defineEmits<{
  'deleted-design': [designId: string]
}>()

const { deleteDesignDraft, listDesignDrafts } = useDesignDrafts()

const drafts = ref<DesignDraftListItem[]>([])
const draftsPending = ref(false)
const draftsErrorMessage = ref<string | null>(null)
const deletingDraftIds = ref<string[]>([])
const deleteSuccessMessage = ref<string | null>(null)

const formatUpdatedAt = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Updated recently'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const createDraftHref = (draft: DesignDraftListItem) => {
  const params = new URLSearchParams({ designId: draft.id })

  if (draft.product_type) {
    params.set('type', draft.product_type)
  }

  return `/design/${draft.product_handle}?${params.toString()}`
}

const removeDeletingDraftId = (designId: string) => {
  deletingDraftIds.value = deletingDraftIds.value.filter(id => id !== designId)
}

const handleDeleteDraft = async (draft: DesignDraftListItem) => {
  if (deletingDraftIds.value.includes(draft.id)) {
    return
  }

  deletingDraftIds.value = [...deletingDraftIds.value, draft.id]
  deleteSuccessMessage.value = null
  draftsErrorMessage.value = null

  try {
    await deleteDesignDraft(draft.id)
    drafts.value = drafts.value.filter(item => item.id !== draft.id)
    deleteSuccessMessage.value = 'Design draft deleted.'

    if (props.currentDesignId === draft.id) {
      emit('deleted-design', draft.id)
    }
  } catch (error) {
    const storefrontError = error as StorefrontFetchError
    draftsErrorMessage.value = storefrontError?.data?.message || 'Could not delete the selected design.'
  } finally {
    removeDeletingDraftId(draft.id)
  }
}

const loadDrafts = async () => {
  draftsPending.value = true
  draftsErrorMessage.value = null

  try {
    const response = await listDesignDrafts({
      status: 'draft',
      page: 1,
      per_page: 20,
    })

    drafts.value = response.data ?? []
  } catch (error) {
    const storefrontError = error as StorefrontFetchError
    draftsErrorMessage.value = storefrontError?.data?.message || 'Could not load saved designs.'
    drafts.value = []
  } finally {
    draftsPending.value = false
  }
}

watch(() => props.refreshKey, () => {
  void loadDrafts()
}, { immediate: true })
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <div class="border-b border-borderSecondary px-5 py-4">
      <h2 class="text-base font-semibold text-primary">
        Saved designs
      </h2>
      <p class="mt-1 text-sm text-[#686f72]">
        Drafts linked to the current storefront session or signed-in user.
      </p>
      <p
        v-if="deleteSuccessMessage"
        class="mt-2 text-xs font-medium text-[#2f7d4e]"
      >
        {{ deleteSuccessMessage }}
      </p>
    </div>

    <div v-if="draftsPending" class="flex flex-1 items-center justify-center p-6">
      <div class="flex max-w-[220px] flex-col items-center text-center">
        <span class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cotton-grey-1 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="26" height="26" fill="currentColor" class="animate-spin inline-block shrink-0" aria-hidden="true" focusable="false" role="presentation"><!-- Icon from Phosphor by Phosphor Icons - https://github.com/phosphor-icons/core/blob/main/LICENSE --><path fill="currentColor" d="M136 32v32a8 8 0 0 1-16 0V32a8 8 0 0 1 16 0m88 88h-32a8 8 0 0 0 0 16h32a8 8 0 0 0 0-16m-45.09 47.6a8 8 0 0 0-11.31 11.31l22.62 22.63a8 8 0 0 0 11.32-11.32ZM128 184a8 8 0 0 0-8 8v32a8 8 0 0 0 16 0v-32a8 8 0 0 0-8-8m-50.91-16.4l-22.63 22.62a8 8 0 0 0 11.32 11.32l22.62-22.63a8 8 0 0 0-11.31-11.31M72 128a8 8 0 0 0-8-8H32a8 8 0 0 0 0 16h32a8 8 0 0 0 8-8m-6.22-73.54a8 8 0 0 0-11.32 11.32L77.09 88.4A8 8 0 0 0 88.4 77.09Z"/></svg>
        </span>
        <p class="text-[15px] font-medium leading-6 text-primary">
          Loading saved designs
        </p>
      </div>
    </div>

    <div
      v-else-if="draftsErrorMessage"
      class="flex flex-1 items-center justify-center p-6"
    >
      <div class="flex max-w-[240px] flex-col items-center text-center">
        <span class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cotton-grey-1 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="26" height="26" fill="currentColor" class="inline-block shrink-0" aria-hidden="true" focusable="false" role="presentation"><!-- Icon from Phosphor by Phosphor Icons - https://github.com/phosphor-icons/core/blob/main/LICENSE --><path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m-8-80V80a8 8 0 0 1 16 0v56a8 8 0 0 1-16 0m20 36a12 12 0 1 1-12-12a12 12 0 0 1 12 12"/></svg>
        </span>
        <p class="text-[15px] font-medium leading-6 text-primary">
          {{ draftsErrorMessage }}
        </p>
        <button
          type="button"
          class="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-borderSecondary px-4 text-sm font-semibold text-primary transition hover:bg-cotton-grey-1"
          @click="loadDrafts"
        >
          Retry
        </button>
      </div>
    </div>

    <div
      v-else-if="!drafts.length"
      class="flex flex-1 items-center justify-center p-6"
    >
      <div class="flex max-w-[220px] flex-col items-center text-center">
        <span class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cotton-grey-1 text-primary">
          <Icon
            name="ph:floppy-disk-back"
            size="30px"
          />
        </span>
        <p class="text-[15px] font-medium leading-6 text-primary">
          You do not have any saved designs yet.
        </p>
      </div>
    </div>

    <div
      v-else
      class="min-h-0 flex-1 overflow-y-auto px-4 py-4"
    >
      <div class="space-y-3">
        <NuxtLink
          v-for="draft in drafts"
          :key="draft.id"
          :to="createDraftHref(draft)"
          class="flex items-center gap-3 rounded-2xl border border-borderSecondary bg-white p-3 transition hover:border-primary/25 hover:bg-[#fbfbfa]"
          :class="draft.id === props.currentDesignId ? 'border-primary/35 bg-[#f7f7f5]' : ''"
        >
          <div class="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl bg-cotton-grey-1">
            <img
              v-if="draft.preview_image"
              :src="draft.preview_image"
              :alt="draft.name || draft.product_name || draft.product_handle"
              class="h-full w-full object-cover"
            >
            <div
              v-else
              class="flex h-full w-full items-center justify-center text-[#8a8f98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="26" height="26" fill="currentColor" class="inline-block shrink-0" aria-hidden="true" focusable="false" role="presentation"><!-- Icon from Phosphor by Phosphor Icons - https://github.com/phosphor-icons/core/blob/main/LICENSE --><path fill="currentColor" d="M208 32H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16M48 48h160v77.38l-24.69-24.7a16 16 0 0 0-22.62 0L53.37 208H48Zm160 160H76l96-96l36 36zM96 120a24 24 0 1 0-24-24a24 24 0 0 0 24 24m0-32a8 8 0 1 1-8 8a8 8 0 0 1 8-8"/></svg>
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-primary">
                  {{ draft.name || draft.product_name || 'Untitled design' }}
                </p>
                <p class="mt-1 truncate text-xs text-[#686f72]">
                  {{ draft.product_name || draft.product_handle }}
                </p>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <span class="rounded-full bg-[#f2f2ef] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
                  {{ draft.status }}
                </span>
                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-full text-[#8a8f98] transition hover:bg-[#f2f2ef] hover:text-primary disabled:cursor-not-allowed disabled:text-[#c6c9ce]"
                  :disabled="deletingDraftIds.includes(draft.id)"
                  :aria-label="`Delete ${draft.name || draft.product_name || 'design'}`"
                  @click.prevent.stop="handleDeleteDraft(draft)"
                >
                  <Icon
                    :name="deletingDraftIds.includes(draft.id) ? 'ph:spinner-gap' : 'ph:trash'"
                    size="16px"
                    :class="deletingDraftIds.includes(draft.id) ? 'animate-spin' : ''"
                  />
                </button>
              </div>
            </div>

            <div class="mt-3 flex items-center justify-between gap-3">
              <p class="text-[11px] text-[#8a8f98]">
                Updated {{ formatUpdatedAt(draft.updated_at) }}
              </p>
              <span class="text-xs font-semibold text-primary">
                Open
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

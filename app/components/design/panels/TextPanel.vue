<script setup lang="ts">
import { designEditorNumberArtOptions, designEditorWordArtOptions } from '~/data/design-editor'
import type { DesignEditorWordArtOption } from '~/data/design-editor'

const props = withDefaults(defineProps<{
  textOptions?: DesignEditorWordArtOption[]
  numberOptions?: DesignEditorWordArtOption[]
  showFallbackNotice?: boolean
}>(), {
  textOptions: () => [],
  numberOptions: () => [],
  showFallbackNotice: false,
})

type WordArtSelection = {
  text: string
  color: string
  option: DesignEditorWordArtOption
}

const emit = defineEmits<{
  addTextWordArt: [selection: WordArtSelection]
  addNumberWordArt: [selection: WordArtSelection]
}>()

const defaultWordArtColor = '#c53232'
const inputValue = ref('')
const inputColor = ref(defaultWordArtColor)
const appliedValue = ref('')
const appliedColor = ref(defaultWordArtColor)

const normalizedValue = computed(() => inputValue.value.trim())
const previewValue = computed(() => appliedValue.value.trim())
const createButtonClass = computed(() => normalizedValue.value ? 'bg-primary' : 'bg-[#d8dcdf]')

const resolvedTextOptions = computed(() =>
  props.textOptions.length ? props.textOptions : designEditorWordArtOptions,
)
const resolvedNumberOptions = computed(() =>
  props.numberOptions.length ? props.numberOptions : designEditorNumberArtOptions,
)

/** Unified style list: text fonts + number fonts, same input drives both. */
const resolvedStyleOptions = computed(() => {
  const textIds = new Set(resolvedTextOptions.value.map(option => option.id))
  const numberOnly = resolvedNumberOptions.value.filter(option => !textIds.has(option.id))
  return [...resolvedTextOptions.value, ...numberOnly]
})

const resolvedDefaultColor = computed(() =>
  resolvedStyleOptions.value[0]?.defaultColor
  ?? resolvedTextOptions.value[0]?.defaultColor
  ?? defaultWordArtColor,
)

const numberOptionIds = computed(() => new Set(resolvedNumberOptions.value.map(option => option.id)))

const getOptionPreviewStyle = (option: DesignEditorWordArtOption, color: string) => ({
  color,
  fontFamily: option.fontFamily,
  fontSize: option.fontSize ? `${option.fontSize}px` : undefined,
  fontWeight: option.fontWeight,
  fontStyle: option.fontStyle,
  letterSpacing: option.letterSpacing != null ? `${option.letterSpacing}px` : undefined,
  lineHeight: option.lineHeight ?? undefined,
  textTransform: option.textTransform ?? undefined,
})

const createWordArt = () => {
  appliedValue.value = normalizedValue.value
  appliedColor.value = inputColor.value
}

const addWordArt = (option: DesignEditorWordArtOption) => {
  const selection: WordArtSelection = {
    text: previewValue.value || option.fallbackText,
    color: appliedColor.value,
    option,
  }

  if (numberOptionIds.value.has(option.id)) {
    emit('addNumberWordArt', selection)
    return
  }

  emit('addTextWordArt', selection)
}

watch(resolvedDefaultColor, (color) => {
  if (inputColor.value === defaultWordArtColor)
    inputColor.value = color

  if (appliedColor.value === defaultWordArtColor)
    appliedColor.value = color
}, { immediate: true })
</script>

<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden p-3">
    <ElInput
      v-model="inputValue"
      placeholder="add text or numbers here"
      class="design-editor-text-input"
    >
      <template #suffix>
        <DesignColorPickerSuffix
          v-model="inputColor"
          aria-label="Choose text color"
        />
      </template>
    </ElInput>

    <button
      type="button"
      class="mt-3 flex h-11 w-full shrink-0 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-100"
      :class="createButtonClass"
      :disabled="!normalizedValue"
      @click="createWordArt"
    >
      Create WordArt
    </button>

    <ElScrollbar
      height="100%"
      class="mt-4 min-h-0 flex-1"
    >
      <div class="space-y-4 pr-1">
        <p
          v-if="props.showFallbackNotice && !props.textOptions.length && !props.numberOptions.length"
          class="text-center text-xs text-[#8b8f94]"
        >
          Test fonts. Configure fonts
        </p>

        <button
          v-for="option in resolvedStyleOptions"
          :key="option.id"
          type="button"
          class="design-checkerboard flex min-h-[74px] w-full items-center justify-center overflow-hidden rounded-[6px] border border-[#efefeb] px-4 py-5"
          @click="addWordArt(option)"
        >
          <span
            :class="option.className"
            :style="getOptionPreviewStyle(option, appliedColor)"
          >
            {{ previewValue || option.fallbackText }}
          </span>
        </button>
      </div>
    </ElScrollbar>
  </div>
</template>

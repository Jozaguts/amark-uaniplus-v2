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

const { t } = useI18n()

const defaultWordArtColor = '#c53232'
const inputValue = ref('')
const inputColor = ref(defaultWordArtColor)
const selectedOptionId = ref('')

const normalizedValue = computed(() => inputValue.value.trim())
const createButtonClass = computed(() => normalizedValue.value ? 'bg-primary' : 'bg-[#d8dcdf]')

const resolvedTextOptions = computed(() =>
  props.textOptions.length ? props.textOptions : designEditorWordArtOptions,
)
const resolvedNumberOptions = computed(() =>
  props.numberOptions.length ? props.numberOptions : designEditorNumberArtOptions,
)

/** Unified font list: text + number styles (deduped by id). */
const resolvedStyleOptions = computed(() => {
  const textIds = new Set(resolvedTextOptions.value.map(option => option.id))
  const numberOnly = resolvedNumberOptions.value.filter(option => !textIds.has(option.id))
  return [...resolvedTextOptions.value, ...numberOnly]
})

const numberOptionIds = computed(() => new Set(resolvedNumberOptions.value.map(option => option.id)))

const selectedOption = computed(() =>
  resolvedStyleOptions.value.find(option => option.id === selectedOptionId.value)
  ?? resolvedStyleOptions.value[0]
  ?? null,
)

const resolvedDefaultColor = computed(() =>
  selectedOption.value?.defaultColor
  ?? resolvedStyleOptions.value[0]?.defaultColor
  ?? defaultWordArtColor,
)

/**
 * Select label must be the typeface name (Arial, Aileron…), not "Word Art 1".
 * Prefer fontFamily; only use label when it is not a generic art placeholder.
 */
function optionDisplayName(option: DesignEditorWordArtOption): string {
  const family = option.fontFamily?.trim()
  if (family)
    return family

  const label = option.label?.trim()
  if (label && !/^(word|number)[\s_-]*art/i.test(label))
    return label

  // Last resort: humanize id (avoid showing Word Art N when family is missing)
  if (label)
    return label

  return option.id
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

function getSelectOptionStyle(option: DesignEditorWordArtOption): Record<string, string | number | undefined> {
  // Quote family so multi-word names / custom FontFace names resolve correctly
  const family = option.fontFamily?.trim()
  return {
    fontFamily: family ? `"${family}", sans-serif` : undefined,
    fontWeight: option.fontWeight ?? undefined,
    fontStyle: option.fontStyle ?? undefined,
    letterSpacing: option.letterSpacing != null ? `${option.letterSpacing}px` : undefined,
    textTransform: option.textTransform ?? undefined,
    fontSize: '15px',
    lineHeight: 1.4,
  }
}

const selectedSelectStyle = computed(() => {
  if (!selectedOption.value)
    return {}

  return getSelectOptionStyle(selectedOption.value)
})

function createWordArt() {
  const option = selectedOption.value
  if (!option || !normalizedValue.value)
    return

  const selection: WordArtSelection = {
    text: normalizedValue.value,
    color: inputColor.value,
    option,
  }

  if (numberOptionIds.value.has(option.id)) {
    emit('addNumberWordArt', selection)
    return
  }

  emit('addTextWordArt', selection)
}

watch(
  resolvedStyleOptions,
  (options) => {
    if (!options.length) {
      selectedOptionId.value = ''
      return
    }

    if (!options.some(option => option.id === selectedOptionId.value))
      selectedOptionId.value = options[0]!.id
  },
  { immediate: true },
)

watch(resolvedDefaultColor, (color) => {
  if (inputColor.value === defaultWordArtColor)
    inputColor.value = color
}, { immediate: true })
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-3 overflow-hidden p-3">
    <ElInput
      v-model="inputValue"
      :placeholder="$t('catalog.designEditor.text.placeholder')"
      class="design-editor-text-input"
    >
      <template #suffix>
        <DesignColorPickerSuffix
          v-model="inputColor"
          :aria-label="$t('catalog.designEditor.text.colorAria')"
        />
      </template>
    </ElInput>

    <div class="shrink-0">
      <label class="mb-1.5 block text-[12px] font-medium text-[#686f72]">
        {{ $t('catalog.designEditor.text.fontFamily') }}
      </label>
      <ElSelect
        v-model="selectedOptionId"
        class="design-font-select w-full"
        :placeholder="$t('catalog.designEditor.text.fontFamilyPlaceholder')"
        filterable
        :style="selectedSelectStyle"
      >
        <ElOption
          v-for="option in resolvedStyleOptions"
          :key="option.id"
          :label="optionDisplayName(option)"
          :value="option.id"
        >
          <span
            class="block truncate py-0.5"
            :style="getSelectOptionStyle(option)"
          >
            {{ optionDisplayName(option) }}
          </span>
        </ElOption>
      </ElSelect>

      <p
        v-if="props.showFallbackNotice && !props.textOptions.length && !props.numberOptions.length"
        class="mt-2 text-center text-xs text-[#8b8f94]"
      >
        {{ $t('catalog.designEditor.text.fallbackFonts') }}
      </p>
    </div>

    <button
      type="button"
      class="flex h-11 w-full shrink-0 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-100"
      :class="createButtonClass"
      :disabled="!normalizedValue || !selectedOption"
      @click="createWordArt"
    >
      {{ $t('catalog.designEditor.text.create') }}
    </button>
  </div>
</template>

<style scoped>
.design-font-select :deep(.el-select__wrapper) {
  min-height: 44px;
}

.design-font-select :deep(.el-select__selected-item) {
  font-family: inherit;
}
</style>

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
const inputText = ref('')
const inputNumber = ref('')
const inputTextColor = ref(defaultWordArtColor)
const inputNumberColor = ref(defaultWordArtColor)
const appliedText = ref('')
const appliedNumber = ref('')
const appliedTextColor = ref(defaultWordArtColor)
const appliedNumberColor = ref(defaultWordArtColor)

const normalizedText = computed(() => inputText.value.trim())
const normalizedNumber = computed(() => inputNumber.value.trim())
const previewText = computed(() => appliedText.value.trim())
const previewNumber = computed(() => appliedNumber.value.trim())
const createTextButtonClass = computed(() => normalizedText.value ? 'bg-primary' : 'bg-[#d8dcdf]')
const createNumberButtonClass = computed(() => normalizedNumber.value ? 'bg-primary' : 'bg-[#d8dcdf]')
const resolvedTextOptions = computed(() => props.textOptions.length ? props.textOptions : designEditorWordArtOptions)
const resolvedNumberOptions = computed(() => props.numberOptions.length ? props.numberOptions : designEditorNumberArtOptions)
const resolvedTextDefaultColor = computed(() => resolvedTextOptions.value[0]?.defaultColor ?? defaultWordArtColor)
const resolvedNumberDefaultColor = computed(() => resolvedNumberOptions.value[0]?.defaultColor ?? defaultWordArtColor)
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

const createTextWordArt = () => {
  appliedText.value = normalizedText.value
  appliedTextColor.value = inputTextColor.value
}

const createNumberWordArt = () => {
  appliedNumber.value = normalizedNumber.value
  appliedNumberColor.value = inputNumberColor.value
}

const addTextWordArt = (option: DesignEditorWordArtOption) => {
  emit('addTextWordArt', {
    text: previewText.value || option.fallbackText,
    color: appliedTextColor.value,
    option,
  })
}

const addNumberWordArt = (option: DesignEditorWordArtOption) => {
  emit('addNumberWordArt', {
    text: previewNumber.value || option.fallbackText,
    color: appliedNumberColor.value,
    option,
  })
}

watch(inputNumber, (nextValue) => {
  const digitsOnly = nextValue.replace(/\D/g, '')

  if (digitsOnly !== nextValue) {
    inputNumber.value = digitsOnly
  }
})

watch(resolvedTextDefaultColor, (color) => {
  if (inputTextColor.value === defaultWordArtColor) {
    inputTextColor.value = color
  }

  if (appliedTextColor.value === defaultWordArtColor) {
    appliedTextColor.value = color
  }
}, { immediate: true })

watch(resolvedNumberDefaultColor, (color) => {
  if (inputNumberColor.value === defaultWordArtColor) {
    inputNumberColor.value = color
  }

  if (appliedNumberColor.value === defaultWordArtColor) {
    appliedNumberColor.value = color
  }
}, { immediate: true })
</script>

<template>
  <div class="grid h-full grid-rows-2 gap-4 overflow-hidden p-3">
    <section class="flex min-h-0 flex-col overflow-hidden">
      <ElInput
        v-model="inputText"
        placeholder="add text here"
        class="design-editor-text-input"
      >
        <template #suffix>
          <DesignColorPickerSuffix
            v-model="inputTextColor"
            aria-label="Choose text color"
          />
        </template>
      </ElInput>

      <button
        type="button"
        class="mt-3 flex h-11 w-full shrink-0 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-100"
        :class="createTextButtonClass"
        :disabled="!normalizedText"
        @click="createTextWordArt"
      >
        Create WordArt
      </button>

      <ElScrollbar
        height="100%"
        class="mt-4 min-h-0"
      >
        <div class="space-y-4 pr-1">
          <p
            v-if="props.showFallbackNotice && !props.textOptions.length"
            class="text-center text-xs text-[#8b8f94]"
          >
            Test fonts. Configure fonts
          </p>

          <button
            v-for="option in resolvedTextOptions"
            :key="option.id"
            type="button"
            class="design-checkerboard flex min-h-[74px] w-full items-center justify-center overflow-hidden rounded-[6px] border border-[#efefeb] px-4 py-5"
            @click="addTextWordArt(option)"
          >
            <span
              :class="option.className"
              :style="getOptionPreviewStyle(option, appliedTextColor)"
            >
              {{ previewText || option.fallbackText }}
            </span>
          </button>
        </div>
      </ElScrollbar>
    </section>

    <section class="flex min-h-0 flex-col overflow-hidden">
      <ElInput
        v-model="inputNumber"
        placeholder="add number here"
        inputmode="numeric"
        pattern="[0-9]*"
        class="design-editor-text-input"
      >
        <template #suffix>
          <DesignColorPickerSuffix
            v-model="inputNumberColor"
            aria-label="Choose number color"
          />
        </template>
      </ElInput>

      <button
        type="button"
        class="mt-3 flex h-11 w-full shrink-0 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-100"
        :class="createNumberButtonClass"
        :disabled="!normalizedNumber"
        @click="createNumberWordArt"
      >
        Create WordArt
      </button>

      <ElScrollbar
        height="100%"
        class="mt-4 min-h-0"
      >
        <div class="space-y-4 pr-1">
          <p
            v-if="props.showFallbackNotice && !props.numberOptions.length"
            class="text-center text-xs text-[#8b8f94]"
          >
            Test fonts. Configure fonts
          </p>

          <button
            v-for="option in resolvedNumberOptions"
            :key="option.id"
            type="button"
            class="design-checkerboard flex min-h-[74px] w-full items-center justify-center overflow-hidden rounded-[6px] border border-[#efefeb] px-4 py-5"
            @click="addNumberWordArt(option)"
          >
            <span
              :class="option.className"
              :style="getOptionPreviewStyle(option, appliedNumberColor)"
            >
              {{ previewNumber || option.fallbackText }}
            </span>
          </button>
        </div>
      </ElScrollbar>
    </section>
  </div>
</template>

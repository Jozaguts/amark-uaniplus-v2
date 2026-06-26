<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'

type HoverDirection = 'top' | 'bottom' | 'left' | 'right'

interface Props {
  imageUrl: string
  alt?: string
  srcset?: string | null
  childrenClass?: string
  imageClass?: string
  imageContainerClass?: string
  contentAlwaysVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  srcset: undefined,
  childrenClass: undefined,
  imageClass: undefined,
  imageContainerClass: undefined,
  contentAlwaysVisible: false,
})
const divRef = ref<HTMLDivElement | null>(null)
const direction = shallowRef<HoverDirection>('left')
const isActive = shallowRef(false)
const isTouched = shallowRef(false)
const isMobile = shallowRef(false)

let touchTimer: ReturnType<typeof setTimeout> | null = null

function detectMobile() {
  isMobile.value = window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window
}

function setDirection(fetchedDirection: number) {
  switch (fetchedDirection) {
    case 0:
      direction.value = 'top'
      break
    case 1:
      direction.value = 'right'
      break
    case 2:
      direction.value = 'bottom'
      break
    case 3:
      direction.value = 'left'
      break
    default:
      direction.value = 'left'
      break
  }
}

function handleMouseEnter(event: MouseEvent) {
  if (isMobile.value)
    return

  if (!divRef.value)
    return

  setDirection(getDirection(event, divRef.value))
  isActive.value = true
}

function handleMouseLeave() {
  if (isMobile.value)
    return

  isActive.value = false
}

function handleTouchStart(event: TouchEvent) {
  if (!isMobile.value)
    return

  isTouched.value = true

  if (!divRef.value)
    return

  const touch = event.touches[0]
  const mouseEvent = new MouseEvent('mouseenter', {
    clientX: touch.clientX,
    clientY: touch.clientY,
  })

  setDirection(getDirection(mouseEvent, divRef.value))
  isActive.value = true

  if (touchTimer)
    clearTimeout(touchTimer)
  touchTimer = setTimeout(() => {
    handleTouchEnd()
  }, 3000)
}

function handleTouchEnd() {
  if (touchTimer) {
    clearTimeout(touchTimer)
    touchTimer = null
  }

  isActive.value = false

  setTimeout(() => {
    isTouched.value = false
  }, 300)
}

function getDirection(ev: MouseEvent, obj: HTMLElement) {
  const { width: w, height: h, left, top } = obj.getBoundingClientRect()
  const x = ev.clientX - left - (w / 2) * (w > h ? h / w : 1)
  const y = ev.clientY - top - (h / 2) * (h > w ? w / h : 1)

  return Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4
}

const containerClass = computed(() => [
  'group/card relative block w-full overflow-hidden bg-transparent transition-all duration-300',
  'touch-manipulation active:scale-[0.98] md:active:scale-100',
])

const imageClass = computed(() => [
  'h-full w-full object-cover align-middle transition-transform duration-300',
  props.imageClass,
])

const childrenClass = computed(() => [
  'absolute z-40 text-white transition-opacity duration-300',
  'bottom-2 left-2 text-sm sm:bottom-3 sm:left-3 sm:text-base md:bottom-4 md:left-4 md:text-lg',
  props.childrenClass,
])

const overlayClass = computed(() => {
  const baseClasses = 'absolute inset-0 z-10 transition-transform duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
  const backgroundClasses = 'bg-black/10 dark:bg-black/10'

  if (isActive.value)
    return [baseClasses, backgroundClasses, 'translate-x-0 translate-y-0']

  switch (direction.value) {
    case 'top':
      return [baseClasses, backgroundClasses, '-translate-y-full']
    case 'bottom':
      return [baseClasses, backgroundClasses, 'translate-y-full']
    case 'left':
      return [baseClasses, backgroundClasses, '-translate-x-full']
    case 'right':
      return [baseClasses, backgroundClasses, 'translate-x-full']
    default:
      return [baseClasses, backgroundClasses]
  }
})

const imageContainerClass = computed(() => ({
  'translate-y-2 md:translate-y-5': isActive.value && direction.value === 'top',
  '-translate-y-2 md:-translate-y-5': isActive.value && direction.value === 'bottom',
  'translate-x-2 md:translate-x-5': isActive.value && direction.value === 'left',
  '-translate-x-2 md:-translate-x-5': isActive.value && direction.value === 'right',
}))

onMounted(() => {
  detectMobile()
  window.addEventListener('resize', detectMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', detectMobile)
  if (touchTimer) {
    clearTimeout(touchTimer)
  }
})
</script>

<template>
  <div
    ref="divRef"
    :class="containerClass"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <div class="relative size-full overflow-hidden">
      <div :class="overlayClass" />
      <div
        :class="[
          'relative size-full transform-gpu bg-transparent transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
          imageContainerClass,
          props.imageContainerClass,
        ]"
      >
        <img
          :src="imageUrl"
          :srcset="srcset || undefined"
          :alt="alt"
          :class="imageClass"
          width="1000"
          height="1000"
        />
      </div>
      <transition name="fade">
        <div
          v-show="contentAlwaysVisible || isActive || isTouched"
          :class="childrenClass"
        >
          <slot />
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Enhanced mobile touch targets */
@media (max-width: 768px) {
  .group\/card {
    min-height: 44px; /* iOS minimum touch target */
    min-width: 44px;
  }
}

/* Smooth transitions for mobile */
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.1s !important;
  }
}
</style>

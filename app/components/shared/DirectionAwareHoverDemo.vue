<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, useTemplateRef } from 'vue'

type HoverDirection = 'top' | 'bottom' | 'left' | 'right'

interface Props {
  imageUrl: string
  alt?: string
  srcset?: string | null
  hoverVideoUrl?: string | null
  childrenClass?: string
  imageClass?: string
  imageContainerClass?: string
  contentAlwaysVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  srcset: undefined,
  hoverVideoUrl: undefined,
  childrenClass: undefined,
  imageClass: undefined,
  imageContainerClass: undefined,
  contentAlwaysVisible: false,
})

const divRef = ref<HTMLDivElement | null>(null)
const videoRef = useTemplateRef<HTMLVideoElement>('hoverVideo')
const direction = shallowRef<HoverDirection>('left')
const isActive = shallowRef(false)
/** Fine pointer + hover capability (desktop). Touch/coarse devices skip hover choreography. */
const prefersHover = shallowRef(true)
const shouldLoadVideo = shallowRef(false)
const isVideoVisible = shallowRef(false)

let observer: IntersectionObserver | null = null
let hoverMedia: MediaQueryList | null = null

function detectHoverCapability() {
  prefersHover.value = window.matchMedia('(hover: hover) and (pointer: fine)').matches
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
  if (!prefersHover.value || !divRef.value)
    return

  setDirection(getDirection(event, divRef.value))
  isActive.value = true
  playHoverVideo()
}

function handleMouseLeave() {
  if (!prefersHover.value)
    return

  isActive.value = false
  pauseHoverVideo()
}

function hasHoverVideo() {
  return Boolean(props.hoverVideoUrl)
}

async function prepareHoverVideo() {
  if (!hasHoverVideo() || shouldLoadVideo.value)
    return

  shouldLoadVideo.value = true
  await nextTick()
  videoRef.value?.load()
}

async function playHoverVideo() {
  await prepareHoverVideo()

  if (!videoRef.value)
    return

  try {
    await videoRef.value.play()
    isVideoVisible.value = true
  }
  catch {
    isVideoVisible.value = false
  }
}

function pauseHoverVideo() {
  if (!videoRef.value)
    return

  videoRef.value.pause()
  videoRef.value.currentTime = 0
  isVideoVisible.value = false
}

function getDirection(ev: MouseEvent, obj: HTMLElement) {
  const { width: w, height: h, left, top } = obj.getBoundingClientRect()
  const x = ev.clientX - left - (w / 2) * (w > h ? h / w : 1)
  const y = ev.clientY - top - (h / 2) * (h > w ? w / h : 1)

  return Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4
}

const showSlotContent = computed(() =>
  props.contentAlwaysVisible || !prefersHover.value || isActive.value,
)

const containerClass = computed(() => [
  'group/card relative block w-full overflow-hidden bg-transparent',
  'touch-manipulation',
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
  const baseClasses = 'pointer-events-none absolute inset-0 z-10 transition-transform duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
  const backgroundClasses = 'bg-black/10 dark:bg-black/10'

  // On touch devices, keep a light static scrim so overlay text stays readable.
  if (!prefersHover.value)
    return [baseClasses, backgroundClasses, 'translate-x-0 translate-y-0']

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

const imageContainerClass = computed(() => {
  if (!prefersHover.value || !isActive.value)
    return {}

  return {
    'translate-y-2 md:translate-y-5': direction.value === 'top',
    '-translate-y-2 md:-translate-y-5': direction.value === 'bottom',
    'translate-x-2 md:translate-x-5': direction.value === 'left',
    '-translate-x-2 md:-translate-x-5': direction.value === 'right',
  }
})

onMounted(() => {
  detectHoverCapability()
  hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine)')
  hoverMedia.addEventListener('change', detectHoverCapability)

  if (props.hoverVideoUrl && divRef.value && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      if (!entries.some(entry => entry.isIntersecting))
        return

      prepareHoverVideo()
      observer?.disconnect()
      observer = null
    }, { rootMargin: '600px 0px' })

    observer.observe(divRef.value)
  }
})

onUnmounted(() => {
  hoverMedia?.removeEventListener('change', detectHoverCapability)
  observer?.disconnect()
})
</script>

<template>
  <div
    ref="divRef"
    :class="containerClass"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
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
        >
        <video
          v-if="props.hoverVideoUrl && shouldLoadVideo"
          ref="hoverVideo"
          class="pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-200"
          :class="isVideoVisible ? 'opacity-100' : 'opacity-0'"
          :src="props.hoverVideoUrl"
          :poster="imageUrl"
          preload="auto"
          muted
          loop
          playsinline
        />
      </div>
      <transition name="fade">
        <div
          v-show="showSlotContent"
          :class="childrenClass"
          class="pointer-events-none"
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

@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.1s !important;
  }
}
</style>

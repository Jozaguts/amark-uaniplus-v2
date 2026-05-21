<script setup lang="ts">
import CheckoutHeader from '~/components/checkout/CheckoutHeader.vue'

const route = useRoute()

const checkoutHeaderRoutes = [
  '/account/cart',
  '/account/orders',
  '/order/checkout',
  '/checkout/result',
]

const shouldShowCheckoutHeader = computed(() => {
  const normalizedPath = route.path.replace(/^\/(en|es)(?=\/)/, '').replace(/\/$/, '') || '/'

  return checkoutHeaderRoutes.some(path => normalizedPath === path || normalizedPath.startsWith(`${path}/`))
})
</script>

<template>
  <CheckoutHeader v-if="shouldShowCheckoutHeader" />
  <slot />
</template>

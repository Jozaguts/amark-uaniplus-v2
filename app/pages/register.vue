<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
definePageMeta({
  layout: 'blank',
})
const redirectTarget = computed(() => {
  const redirect = Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect

  return typeof redirect === 'string' && redirect ? redirect : '/'
})

const loginHref = computed(() => {
  return redirectTarget.value !== '/'
    ? `/login?redirect=${encodeURIComponent(redirectTarget.value)}`
    : '/login'
})

useSeoMeta({
  title: () => t('auth.register.seo.title'),
  description: () => t('auth.register.seo.description'),
})
</script>

<template>
  <AuthPage
    :title="$t('auth.register.title')"
    :prompt-text="$t('auth.register.promptText')"
    :prompt-link-label="$t('auth.register.promptLinkLabel')"
    :prompt-link-to="loginHref"
    :google-label="$t('auth.register.googleLabel')"
    :submit-label="$t('auth.register.submitLabel')"
    auth-action="register"
    :success-redirect-to="redirectTarget"
  />
</template>
